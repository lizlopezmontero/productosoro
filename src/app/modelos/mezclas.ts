export interface Mezcla {
    id: string;
    nombre: string;
    gramaje: number;
}

export interface MezclasProducto {
    id: string;
    cantidad: number;
    mezcla: string;
    producto: string;
}