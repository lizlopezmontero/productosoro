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
    cantidadCosto: number | null,
    idEtiqueta?: string,
    cantidadEtiquetas?: number,
    idBolsa?: string,
    cantidadBolsas?: number
}

export interface Categoria{
    id: string,
    nombre: string
}

export interface TaxInvoice{
    id: string,
    descripcion: string,
    categoria: string,
    monto: number
}