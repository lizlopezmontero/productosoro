import { Tarjeta } from "./tarjeta"

export interface ReporteVentas{
    fecha: Date,
    lugar: string,
    neto: number,
    bruto: number,
    inversion: number,
    ganancia: number,
    credito: number,
    costoFijo: number,
    impuesto: number,
    etiquetas: number,
    bolsas: number,
    codLugar: string,
    tarjeta?: Tarjeta
}

export interface AgrupadorVentas{
    fecha: Date,
    lugar: string
}