import { Timestamp } from "@angular/fire/firestore";

export interface Depreciacion {
    id: string,
    articulo: string,
    costo: number,
    vida: number,
    residual: number,
    fecha: Timestamp
}