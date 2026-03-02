import { Timestamp } from "@angular/fire/firestore";

export interface HistoricoInventario{
    id: string,
    fecha: Timestamp,
    codProducto: string,
    descProducto: string,
    cantidadAnterior: number,
    cantidadNueva: number
}