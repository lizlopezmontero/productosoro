import { Timestamp } from "@angular/fire/firestore";

export interface Compras{
    dolares: boolean,
    fecha: Timestamp,
    id: string,
    idRubro: string,
    monto: number,
    nombreRubro: string,
    tipo: string,
    tipoCambio: number
}