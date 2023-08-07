export interface Producto{
    id: string,
    descripcion: string,
    seVendeComo: string,
    cantidad: number,
    precioVenta: number,
    categoria: string,
    orden: number,
    precioCosto: number | null,
    existencias: number | null,
    cantidadCosto: number | null
}

export interface Categoria{
    id: string,
    nombre: string
}