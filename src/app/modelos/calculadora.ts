import { Producto } from "./producto";

export interface Calculadora{
    producto: Producto,
    cantidad: number,
    editando: boolean
}