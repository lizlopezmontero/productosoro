import { TDocumentDefinitions } from "pdfmake/interfaces";
import { Pedido } from "src/app/modelos/pedido";

export const docDefinition = (fechas: string, lugares: string, pedidos: Pedido[]) : TDocumentDefinitions => { 
    let body: any[][] = [[{text: 'Producto', fontSize: 12, bold: true}, {text: 'Maximo Venta', fontSize: 12, bold: true}, {text: 'Existencias Actuales', fontSize: 12, bold: true},
    {text: 'Faltante', fontSize: 12, bold: true}, {text: 'Pedido Peso / Unidad', fontSize: 12, bold: true}]];
    pedidos.forEach(p => body.push([{text: p.nombreProducto, fontSize: 12},{ text: p.ventaMaximo.toLocaleString(), fontSize: 12 },
     {text: p.inventarioActual.toLocaleString(), fontSize: 12 },
     {text: p.faltante.toLocaleString(), bold: true, color: p.faltante < 0 ? 'red': 'green', fontSize: 12},
     {text: p.pedidoPesoUnidad.toLocaleString(), bold: true, color: p.pedidoPesoUnidad < 0 ? 'red': 'green', fontSize: 12}]));
    return {
        pageSize: 'LETTER',
        pageMargins: [ 20, 60, 40, 60 ],
        content:[
            { text: 'Reporte de pedidos '+fechas, style: 'header', marginBottom: 20 },
            { text: '' },
            { text: 'Lugares: '+ lugares, marginBottom: 8 },
            { text: '' },
            {
                table: { // optional,
                    headerRows: 0,
                    //widths: [ '*', 'auto', 100, '*' ],
                    body: body
                }
            }
        ],
        styles: {
            header:{
                fontSize: 22,
                bold: true,
                alignment: 'center'
            },
            defaultStyle: {
                fontSize: 15
            }
        }
    }
}