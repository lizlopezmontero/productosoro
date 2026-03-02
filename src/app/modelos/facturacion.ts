import { Timestamp } from "@angular/fire/firestore";

export interface Facturacion{
    id: string,
    vendedor: string,
    tipoCambio: number,
    fecha: Timestamp,
    lugar: string,
    nombreLugar: string,
    codigoProducto: string,
    descripcionProducto: string,
    ingreso: number,
    devolucion: number,
    precioProducto: number,
    consecutivo: number,
    precioCompra: number,
    cantidadCompra: number,
    cantidad: number,
    unidadMedida: string,
    costoFijo: number,
    categoriaFacturacion?: string,
    idEtiqueta?: string,
    etiqueta?: string,
    montoEtiquetas?: number,
    idBolsa?: string,
    bolsa?: string,
    montoBolsas?: number
}