import { Lugar } from "./lugar";

export interface Cliente{
    id: string,
    nombre: string,
    descripcion: string,
    telefono: string,
    lugar: string,
    vendedor: string,
    refLugar?: Lugar
}