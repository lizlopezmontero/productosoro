import { Timestamp } from "@angular/fire/firestore";

export interface Tarjeta{
    id: string,
    fecha: Timestamp,
    monto: number
}