import { Prestamo } from "./prestamo";

export interface HistoricoPrestamo{
    id: string, nombre:string, vendedor: string, descripcion: string,
    prestamos?: Prestamo[]
}