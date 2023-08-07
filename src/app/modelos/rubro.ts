import { Timestamp } from "@angular/fire/firestore";

export interface Rubro{
    id: string,
    vendedor: string,
    tipoCambio: number,
    fecha: Timestamp,
    lugar: string,
    idRubro: string,
    nombreRubro: string,
    dolares: boolean,
    monto: number,
    tipo: string,
    check: boolean
}