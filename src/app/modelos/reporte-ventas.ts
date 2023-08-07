export interface ReporteVentas{
    fecha: Date,
    lugar: string,
    neto: number,
    bruto: number,
    inversion: number,
    ganancia: number,
    credito: number,
    costoFijo: number,
    codLugar: string
}

export interface AgrupadorVentas{
    fecha: Date,
    lugar: string
}