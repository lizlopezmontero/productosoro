import { Timestamp } from "@angular/fire/firestore";

export interface Prestamo{
    id: string, vendedor: string,
    fecha: Timestamp,
    monto: number, abono: boolean,
    cliente: string, nombreVendedor: string,
    nombreCliente: string, descripcionCliente: string,
    lugar: string, nombreLugar: string
}



