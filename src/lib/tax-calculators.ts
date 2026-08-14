// Calculadoras fiscales orientativas (plusvalía municipal, IRPF de venta, gastos de compra).
// Tipos y coeficientes generales de Andalucía / normativa estatal vigente. No constituyen
// asesoramiento fiscal: los ayuntamientos y la Ley de Presupuestos pueden variar coeficientes/tipos.

// --- 1. Plusvalía municipal (IIVTNU) --------------------------------------------------------

// Coeficientes máximos legales por años de tenencia (RD-ley 26/2021), referencia informativa.
const PLUSVALIA_COEFFICIENTS: Record<number, number> = {
  1: 0.15,
  2: 0.14,
  3: 0.14,
  4: 0.16,
  5: 0.18,
  6: 0.19,
  7: 0.2,
  8: 0.19,
  9: 0.15,
  10: 0.12,
  11: 0.1,
  12: 0.09,
  13: 0.09,
  14: 0.09,
  15: 0.09,
  16: 0.1,
  17: 0.13,
  18: 0.17,
  19: 0.23,
  20: 0.4,
}

function plusvaliaCoefficient(years: number): number {
  const clamped = Math.min(Math.max(years, 1), 20)
  return PLUSVALIA_COEFFICIENTS[clamped]
}

function yearsHeld(fechaCompra: string, fechaVenta: string): number {
  const compra = new Date(fechaCompra)
  const venta = new Date(fechaVenta)
  const ms = venta.getTime() - compra.getTime()
  if (!Number.isFinite(ms) || ms <= 0) return 1
  return Math.max(1, Math.floor(ms / (1000 * 60 * 60 * 24 * 365.25)))
}

export type PlusvaliaInput = {
  municipio: string
  tipoImpositivo: number
  fechaCompra: string
  fechaVenta: string
  precioCompra: number
  precioVenta: number
  valorCatastralSuelo: number
  valorCatastralTotal: number
}

export type PlusvaliaResult = {
  years: number
  coefficient: number
  baseObjetiva: number
  cuotaObjetiva: number
  incrementoRealSuelo: number
  baseReal: number
  cuotaReal: number
  exento: boolean
  cuotaFinal: number
  metodoRecomendado: 'objetivo' | 'real' | 'exento'
}

export function calculatePlusvaliaMunicipal(input: PlusvaliaInput): PlusvaliaResult {
  const years = yearsHeld(input.fechaCompra, input.fechaVenta)
  const coefficient = plusvaliaCoefficient(years)
  const tipo = input.tipoImpositivo / 100

  const baseObjetiva = input.valorCatastralSuelo * coefficient
  const cuotaObjetiva = baseObjetiva * tipo

  const proporcionSuelo = input.valorCatastralTotal > 0 ? input.valorCatastralSuelo / input.valorCatastralTotal : 0
  const incrementoRealTotal = input.precioVenta - input.precioCompra
  const incrementoRealSuelo = incrementoRealTotal * proporcionSuelo
  const exento = incrementoRealSuelo <= 0
  const baseReal = exento ? 0 : incrementoRealSuelo
  const cuotaReal = baseReal * tipo

  if (exento) {
    return {
      years, coefficient, baseObjetiva, cuotaObjetiva,
      incrementoRealSuelo, baseReal, cuotaReal,
      exento: true, cuotaFinal: 0, metodoRecomendado: 'exento',
    }
  }

  const metodoRecomendado = cuotaReal <= cuotaObjetiva ? 'real' : 'objetivo'
  const cuotaFinal = Math.min(cuotaObjetiva, cuotaReal)

  return {
    years, coefficient, baseObjetiva, cuotaObjetiva,
    incrementoRealSuelo, baseReal, cuotaReal,
    exento: false, cuotaFinal, metodoRecomendado,
  }
}

// --- 2. IRPF de la venta (ganancia patrimonial) ---------------------------------------------

const IRPF_AHORRO_BRACKETS: { limit: number; rate: number }[] = [
  { limit: 6000, rate: 0.19 },
  { limit: 50000, rate: 0.21 },
  { limit: 200000, rate: 0.23 },
  { limit: 300000, rate: 0.27 },
  { limit: Infinity, rate: 0.3 },
]

function irpfAhorroProgressive(ganancia: number): number {
  let remaining = ganancia
  let previousLimit = 0
  let total = 0

  for (const bracket of IRPF_AHORRO_BRACKETS) {
    const bracketSize = bracket.limit - previousLimit
    const taxableInBracket = Math.min(remaining, bracketSize)
    if (taxableInBracket <= 0) break
    total += taxableInBracket * bracket.rate
    remaining -= taxableInBracket
    previousLimit = bracket.limit
    if (remaining <= 0) break
  }

  return total
}

export type IrpfVentaInput = {
  precioCompra: number
  gastosCompra: number
  precioVenta: number
  gastosVenta: number
  esViviendaHabitual: boolean
  tiene65oMas: boolean
}

export type IrpfVentaResult = {
  valorAdquisicion: number
  valorTransmision: number
  ganancia: number
  exento: boolean
  cuotaIrpf: number
}

export function calculateIrpfVenta(input: IrpfVentaInput): IrpfVentaResult {
  const valorAdquisicion = input.precioCompra + input.gastosCompra
  const valorTransmision = input.precioVenta - input.gastosVenta
  const ganancia = valorTransmision - valorAdquisicion

  if (ganancia <= 0) {
    return { valorAdquisicion, valorTransmision, ganancia, exento: false, cuotaIrpf: 0 }
  }

  const exento = input.esViviendaHabitual && input.tiene65oMas
  const cuotaIrpf = exento ? 0 : irpfAhorroProgressive(ganancia)

  return { valorAdquisicion, valorTransmision, ganancia, exento, cuotaIrpf }
}

// --- 3. Costes de comprar (Andalucía) --------------------------------------------------------

const ITP_RATE = 0.07
const IVA_OBRA_NUEVA_RATE = 0.1
const AJD_OBRA_NUEVA_RATE = 0.012

export type BuyerCostsInput = {
  precioCompra: number
  tipoVivienda: 'usada' | 'obra_nueva'
  necesitaHipoteca: boolean
}

export type BuyerCostsResult = {
  impuestoPrincipal: number
  impuestoPrincipalLabel: string
  itp: number | null
  iva: number | null
  ajd: number | null
  notaria: number
  registro: number
  gestoria: number
  tasacionHipoteca: number
  gestoriaHipoteca: number
  totalGastos: number
  totalConPrecio: number
}

export function calculateBuyerCosts(input: BuyerCostsInput): BuyerCostsResult {
  const notaria = Math.max(600, input.precioCompra * 0.003)
  const registro = Math.max(400, input.precioCompra * 0.002)
  const gestoria = 300
  const tasacionHipoteca = input.necesitaHipoteca ? 350 : 0
  const gestoriaHipoteca = input.necesitaHipoteca ? 300 : 0

  let itp: number | null = null
  let iva: number | null = null
  let ajd: number | null = null
  let impuestoPrincipal: number
  let impuestoPrincipalLabel: string

  if (input.tipoVivienda === 'usada') {
    itp = input.precioCompra * ITP_RATE
    impuestoPrincipal = itp
    impuestoPrincipalLabel = `ITP (${Math.round(ITP_RATE * 1000) / 10}%)`
  } else {
    iva = input.precioCompra * IVA_OBRA_NUEVA_RATE
    ajd = input.precioCompra * AJD_OBRA_NUEVA_RATE
    impuestoPrincipal = iva + ajd
    impuestoPrincipalLabel = `IVA (${Math.round(IVA_OBRA_NUEVA_RATE * 1000) / 10}%) + AJD (${Math.round(AJD_OBRA_NUEVA_RATE * 1000) / 10}%)`
  }

  const totalGastos = impuestoPrincipal + notaria + registro + gestoria + tasacionHipoteca + gestoriaHipoteca
  const totalConPrecio = totalGastos + input.precioCompra

  return {
    impuestoPrincipal, impuestoPrincipalLabel, itp, iva, ajd,
    notaria, registro, gestoria, tasacionHipoteca, gestoriaHipoteca,
    totalGastos, totalConPrecio,
  }
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
}
