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
    {text: 'Lugares', color: 'transparent', description: 'Listado de lugares', img: '../../../assets/img/map_icon.png', link: ['/app/lugares']}, 
    {text: 'Clientes', color: 'transparent', description: 'Listado de clientes',img: '../../../assets/img/avatar_cliente.png', link: ['/app/clientes']},
    {text: 'Cierre de caja', color: 'transparent', description: 'Rubros del cierre de caja',img: '../../../assets/img/calculator.png', link: ['/app/cierre-caja']},
    {text: 'Inventario', color: 'transparent', description: 'Ajustes de inventario',img: '../../../assets/img/inventory.png', link: ['/app/inventario']},
    {text: 'Productos', color: 'transparent', description: 'Listado de producto',img: '../../../assets/img/producto.png', link: ['/app/productos']},
    {text: 'Materia Prima', color: 'transparent', description: 'Materia prima de productos',img: '../../../assets/img/raw-material.png', link: ['/app/materia-prima']},
    {text: 'Facturacion', color: 'transparent', description: 'Facturación de ventas',img: '../../../assets/img/invoice.png', link: ['/app/facturacion']},
    {text: 'Creditos',  color: 'transparent', description: 'Control de creditos a clientes', img: '../../../assets/img/money_icon.png', link: ['/app/prestamos']},
    {text: 'Reporte Ventas', color: 'transparent', description: 'Ventas por rango de fechas',img: '../../../assets/img/sell-report.png', link: ['/app/reporte-ventas']},
    {text: 'Pedidos', color: 'transparent', description: 'Pedidos por rango de fechas y lugares',img: '../../../assets/img/order.png', link: ['/app/pedidos']}
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
