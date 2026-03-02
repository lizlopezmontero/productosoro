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
import { PrintService } from 'src/app/services/print.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as pdfMake from 'pdfmake/build/pdfMake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { docDefinition } from './order.component.print';
import { ProductoSimulado } from 'src/app/modelos/producto-simulado';


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
  simulado: boolean;
  productosSimulados: ProductoSimulado[] = [];
  excepcionesKg: string[] = ['S005', 'D001', 'S017'];

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
      if(this.simulado){
        const inventario = window.sessionStorage.getItem('inventario');
        if(inventario){
          this.productosSimulados = JSON.parse(inventario);
        }else{
          this.productosSimulados = data.map(p => { return {id: p.id, descripcion: p.descripcion, existencias: 0}});
        }
      }
      this.productos = data;
      this.loading = false;
    })
  }

  constructor(private service: ReportService, private lService: PlacesService, private pService: ProductsService, private config: PrimeNGConfig,
     private msjService: MessageService, private printService: PrintService, private router: ActivatedRoute){
      (window as any).pdfMake.vfs = pdfFonts.pdfMake.vfs;
    this.config.setTranslation(es);
    if(this.router.snapshot.paramMap.get('id')){
      this.simulado = this.router.snapshot.paramMap.get('id') == '1';
    }else{
      this.simulado = false;
    }
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
          const contiene = this.excepcionesKg.includes(p.id);
          const pSimulado = this.productosSimulados.find(h => h.id == p.id) ?? {id: p.id, descripcion: p.descripcion, existencias: 0};

          const suma = data.filter(el => el.codigoProducto == p.id).reduce((acc, o)=> acc + (o.ingreso - o.devolucion), 0);
          const faltante = this.simulado ? (pSimulado.existencias) - maximo  :  (p.existencias ?? 0) - maximo;
          const pesoPedido = contiene ? (faltante * p.cantidad) / (1000): faltante * p.cantidad / (p.cantidadCosto ?? 1);
          peds.push({
            codProducto: p.id, nombreProducto: p.descripcion, ventaMaximo: maximo, ventaTotal: suma, inventarioActual: this.simulado ? pSimulado.existencias : (p.existencias ?? 0),
            faltante: faltante, pedidoPesoUnidad: pesoPedido, unidad: contiene ? ' Kg': ' Paquetes'
          })
        }else{
          const contiene = this.excepcionesKg.includes(p.id);
          const pSimulado = this.productosSimulados.find(h => h.id == p.id) ?? {id: p.id, descripcion: p.descripcion, existencias: 0};
          const faltante = 0; 
          const pesoPedido = contiene ? (faltante * p.cantidad) / 1000: (faltante * p.cantidad) / (p.cantidadCosto ?? 1);
          peds.push({
            codProducto: p.id, nombreProducto: p.descripcion, ventaMaximo: 0, ventaTotal: 0, inventarioActual: this.simulado ? pSimulado.existencias : (p.existencias ?? 0),
            faltante: faltante, pedidoPesoUnidad: pesoPedido, unidad: contiene ? ' Kg': ' Paquetes'
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

  imprimir(){
    
    if(this.pedidos.length === 0 || this.lugaresSelected.length === 0 || !this.fechas[0] || !this.fechas[1]) return;

    const losLugares = this.lugares.filter(lg => this.lugaresSelected.includes(lg.id)).map(k => k.nombre);

    const definition = docDefinition(this.printFechas(), losLugares.join(', '), this.pedidos);

    const timestamp = (new Date()).toISOString().split(':').join('.')

    pdfMake.createPdf(definition).download('pedidos_'+timestamp+'.pdf')
  }

  printFechas(): string{
    const fechaInicio = this.fechas[0];
    const fechaFinal = this.fechas[1];
    return 'del '+ fechaInicio.toLocaleDateString() + ' al ' + fechaFinal.toLocaleDateString();
  }
}
