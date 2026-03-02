import { Component, OnInit } from '@angular/core';


export interface Tile {
  color: string,
  text: string,
  description: string,
  img: string,
  link: string[]
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  tiles: Tile[] = [
    {text: 'Facturacion', color: 'transparent', description: 'Facturación de ventas',img: '../../../assets/img/invoice.png', link: ['/app/facturacion']},
    {text: 'Compras', color: 'transparent', description: 'Rubros de compras por fecha',img: '../../../assets/img/purchase.png', link: ['/app/compras']},
    {text: 'Reporte Ventas', color: 'transparent', description: 'Ventas por rango de fechas',img: '../../../assets/img/sell-report.png', link: ['/app/reporte-ventas']},
    {text: 'Inventario', color: 'transparent', description: 'Ajustes de inventario',img: '../../../assets/img/inventory.png', link: ['/app/inventario']},
    {text: 'Estado de resultados', color: 'transparent', description: 'Reporte de estado de resultados por rango de fechas',img: '../../../assets/img/income.png', link: ['/app/estado-resultados']},
    // poner aca nuevo reporte (compras)
    {text: 'Pedidos', color: 'transparent', description: 'Pedidos por rango de fechas y lugares',img: '../../../assets/img/order.png', link: ['/app/pedidos','0']},
    {text: 'Ventas Productos', color: 'transparent', description: 'Reporte de ventas por producto',img: '../../../assets/img/chart.png', link: ['/app/ventas-productos']},
    {text: 'Pizarra Mezclas', color: 'transparent', description: 'Calcular gramaje de mezclas',img: '../../../assets/img/calculator2.png', link: ['/app/calculadora-mezclas']},
    {text: 'Precio Mezclas', color: 'transparent', description: 'Calculadora de precios de mezclas',img: '../../../assets/img/calculator_seed.png', link: ['/app/calculadora']},
    {text: 'Reporte Factura Tica', color: 'transparent', description: 'Reporte de facturación para impuestos',img: '../../../assets/img/tax.png', link: ['/app/reporte-impuestos']},
    {text: 'Ped. Simulados', color: 'transparent', description: 'Pedidos con inventario simulado',img: '../../../assets/img/order_sim.png', link: ['/app/inventario-simulado']},
    {text: 'Cat. Fact. IVA', color: 'transparent', description: 'Selección de productos con IVA',img: '../../../assets/img/invoice_category.png', link: ['/app/categorias-factura']},
    {text: 'Lugares', color: 'transparent', description: 'Listado de lugares', img: '../../../assets/img/map_icon.png', link: ['/app/lugares']}, 
    {text: 'Clientes', color: 'transparent', description: 'Listado de clientes',img: '../../../assets/img/avatar_cliente.png', link: ['/app/clientes']},
    {text: 'Mantenimiento Entradas / Salidas', color: 'transparent', description: 'Control de entradas / salidas',img: '../../../assets/img/calculator.png', link: ['/app/cierre-caja']},
    {text: 'Mezclas', color: 'transparent', description: 'Mantenimiento de productos mezclados',img: '../../../assets/img/mix.png', link: ['/app/mixes']},
    {text: 'Productos', color: 'transparent', description: 'Listado de producto',img: '../../../assets/img/producto.png', link: ['/app/productos']},
    {text: 'Materia Prima', color: 'transparent', description: 'Materia prima de productos',img: '../../../assets/img/raw-material.png', link: ['/app/materia-prima']},
    {text: 'Creditos',  color: 'transparent', description: 'Control de creditos a clientes', img: '../../../assets/img/money_icon.png', link: ['/app/prestamos']},
    {text: 'Depreciaciones', color: 'transparent', description: 'Depreciaciones de artículos',img: '../../../assets/img/depre.png', link: ['/app/depreciacion']},
    {text: 'Bolsas', color: 'transparent', description: 'Bolsas para empacar productos',img: '../../../assets/img/bag.png', link: ['/app/bolsas']},
    {text: 'Etiquetas', color: 'transparent', description: 'Etiquetas de productos',img: '../../../assets/img/label.png', link: ['/app/etiquetas']},
  ];

  constructor(){}

  ngOnInit(): void {
      
  }

  /*
  get(){
    this.service.getAll().subscribe(data =>{
      this.clientes = data
      console.log(data)
    });
    this.service.getLugar('esparza').pipe(
      catchError(
        error => {
          return throwError(error)
        }
      )
    ).subscribe(data => 
      console.log(data)
    );
  }*/

}
