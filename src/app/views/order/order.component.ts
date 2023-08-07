import { Component, OnInit } from '@angular/core';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { es } from 'src/app/functions/locale';
import { AgrupadorVentas } from 'src/app/modelos/reporte-ventas';
import { ReportService } from 'src/app/services/report.service';
import { MessageType } from 'src/app/enums/Message';
import { PlacesService } from 'src/app/services/places.service';
import { ProductsService } from 'src/app/services/products.service';
import { Producto } from 'src/app/modelos/producto';
import { Lugar } from 'src/app/modelos/lugar';
import { Pedido } from 'src/app/modelos/pedido';
import { Orden } from 'src/app/modelos/orden';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  providers: [ MessageService ]
})
export class OrderComponent implements OnInit{
  fechas: Date[] = [];
  productos: Producto[] = [];
  lugares: Lugar[] = [];
  pedidos: Pedido[] = [];
  loading: boolean = false;
  totalBruto: number = 0;
  totalNeto: number = 0;
  totalGanancia: number = 0;
  totalInversion: number = 0;
  totalCreditos: number = 0;
  lugaresSelected: string[] = [];

  ngOnInit(): void {
    this.getProductos();
    this.getLugares();
  }

  getLugares(){
    this.loading = true;
    this.lService.getAll().pipe(
      catchError(e =>{
        this.loading = false;
        return throwError(()=> e)
      })
    ).subscribe(data => {
      this.lugares = data;
      this.loading = false;
    })
  }
  getProductos(){
    this.loading = true;
    this.pService.getAll().pipe(
      catchError(e =>{
        this.loading = false;
        return throwError(()=> e)
      })
    ).subscribe(data => {
      this.productos = data;
      this.loading = false;
    })
  }

  constructor(private service: ReportService, private lService: PlacesService, private pService: ProductsService, private config: PrimeNGConfig, private msjService: MessageService){
    this.config.setTranslation(es);
  }

  get(){

    if(!this.fechas[0]){
      this.imprimitMsj('No ha seleccionado fechas', MessageType.Warn, 'Advertencia');
      return;
    }
    if(!this.fechas[0] || !this.fechas[1]){
      this.imprimitMsj('Debe seleccionar 2 fechas en el calendario', MessageType.Warn, 'Advertencia');
      return;
    }
    if(!this.lugaresSelected){
      this.imprimitMsj('No selecciono ningun lugar', MessageType.Warn, 'Advertencia');
      return;
    }
    if(this.lugaresSelected.length === 0){
      this.imprimitMsj('No selecciono ningun lugar', MessageType.Warn, 'Advertencia');
      return;
    }

    this.loading = true;
    this.service.getFacturasConLugares(this.fechas[0], this.fechas[1], this.lugaresSelected).pipe(
      catchError(e =>{
        this.loading = false;
        return throwError(()=> e)
      })
    ).subscribe(data => {
      const peds: Pedido[] = [];
      //const productosTabla = this.productos.filter(p => data.some(f => f.codigoProducto == p.id));
      this.productos.forEach(p => {
        if(data.some(f => f.codigoProducto == p.id)){
          let maximo = 0;//Math.max(...data.filter(el => el.codigoProducto == p.id).map(n => n.ingreso - n.devolucion));
          const agrupador: Orden[] = data.filter(el => el.codigoProducto == p.id).map(m => { return {fecha: m.fecha.toDate(), lugar: m.lugar, cantidad: 0, producto: m.codigoProducto }});
          const unique = agrupador.filter((obj, index) => {
            return index === agrupador.findIndex(o => obj.fecha.getDate() == o.fecha.getDate() && obj.fecha.getMonth() == o.fecha.getMonth() &&
            obj.fecha.getFullYear() == o.fecha.getFullYear() && obj.lugar == o.lugar && obj.producto == o.producto);
          });
          unique.forEach(u => {
            const sum = data.filter(f => f.codigoProducto == u.producto && f.fecha.toDate().getDate() === u.fecha.getDate() && f.fecha.toDate().getMonth() == u.fecha.getMonth()
            && f.fecha.toDate().getFullYear() == u.fecha.getFullYear() && f.lugar == u.lugar).
                        reduce((acc, o)=> acc + (o.ingreso - o.devolucion), 0);
            u.cantidad = sum
          });

          this.lugaresSelected.forEach(
            el => {
              const filtered = unique.filter(u => u.lugar == el);
              if(filtered.length > 0){
                const mx = Math.max(...filtered.map(m => m.cantidad))
                maximo += mx
              }
            }
          )

          const suma = data.filter(el => el.codigoProducto == p.id).reduce((acc, o)=> acc + (o.ingreso - o.devolucion), 0);
          const faltante = (p.existencias ?? 0) - maximo;
          const pesoPedido = p.seVendeComo == 'Peso' ? (faltante * p.cantidad) / 1000: faltante * p.cantidad;
          peds.push({
            codProducto: p.id, nombreProducto: p.descripcion, ventaMaximo: maximo, ventaTotal: suma, inventarioActual: p.existencias ?? 0,
            faltante: faltante, pedidoPesoUnidad: pesoPedido, unidad: p.seVendeComo == 'Peso' ? ' Kg': ' Unidades'
          })
        }else{
          const faltante = (p.existencias ?? 0); 
          const pesoPedido = p.seVendeComo == 'Peso' ? (faltante * p.cantidad) / 1000: faltante * p.cantidad;
          peds.push({
            codProducto: p.id, nombreProducto: p.descripcion, ventaMaximo: 0, ventaTotal: 0, inventarioActual: p.existencias ?? 0,
            faltante: faltante, pedidoPesoUnidad: pesoPedido, unidad: p.seVendeComo == 'Peso' ? ' Kg': ' Unidades'
          })
        }
      });
      this.pedidos = peds;
      this.loading = false;
    })
  }


  imprimitMsj(msj: string, type: string, title: string){
    this.msjService.clear();
    this.msjService.add({
      severity: type, detail: msj, summary: title, life: 6000, closable: true, key: 'ts'
    })
  }
}
