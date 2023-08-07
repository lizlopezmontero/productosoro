export interface Pedido{
    codProducto: string,
    nombreProducto: string,
    ventaMaximo: number,
    ventaTotal: number,
    inventarioActual: number,
    faltante: number,
    pedidoPesoUnidad: number,
    unidad: string
}