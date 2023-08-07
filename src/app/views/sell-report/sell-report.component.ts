import {  Component, OnInit } from '@angular/core';
import { ConfirmEventType, ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { es } from 'src/app/functions/locale';
import { Facturacion } from 'src/app/modelos/facturacion';
import { AgrupadorVentas, ReporteVentas } from 'src/app/modelos/reporte-ventas';
import { ReportService } from 'src/app/services/report.service';
import { getDiaSemana } from 'src/app/functions/listas';
import { MessageType } from 'src/app/enums/Message';
import { InvoiceService } from 'src/app/services/invoice.service';
import { ProductsService } from 'src/app/services/products.service';
import { Producto } from 'src/app/modelos/producto';

@Component({
  selector: 'app-sell-report',
  templateUrl: './sell-report.component.html',
  styleUrls: ['./sell-report.component.scss'],
  providers: [ MessageService, ConfirmationService ]
})
export class SellReportComponent implements OnInit{

  fechas: Date[] = [];
  reporte: ReporteVentas[] = [];
  productos: Producto[] = [];
  loading: boolean = false;
  totalBruto: number = 0;
  totalNeto: number = 0;
  totalGanancia: number = 0;
  totalInversion: number = 0;
  totalCostoFijo: number = 0;
  totalCreditos: number = 0;
  terminado: boolean = true;
  w: number;

  ngOnInit(): void {
    this.loading = true;
    this.pService.getAll().pipe(catchError(e =>{
      this.loading = false;
      return throwError(()=> e)
    })).subscribe(elements => {this.productos = elements; this.loading = false;})
  }

  diaSemana(f: Date){
    const dia = f.getDay();
    return getDiaSemana(dia)
  }

  calcularTotales(){
    this.totalBruto = this.reporte.reduce((acc, o)=> acc + o.bruto, 0);
    this.totalNeto = this.reporte.reduce((acc, o)=> acc + o.neto, 0);
    this.totalInversion = this.reporte.reduce((acc, o)=> acc + o.inversion, 0);
    this.totalGanancia = this.reporte.reduce((acc, o)=> acc + o.ganancia, 0);
    this.totalCreditos = this.reporte.reduce((acc, o)=> acc + o.credito, 0);
    this.totalCostoFijo = this.reporte.reduce((acc, o)=> acc + o.costoFijo, 0);
  }

  constructor(private service: ReportService, private config: PrimeNGConfig, private msjService: MessageService,
     private iService: InvoiceService,  private cfService: ConfirmationService, private pService: ProductsService){
    this.config.setTranslation(es);
    this.w = window.innerWidth;
  }

  getInversion(f: Facturacion): number{
    const cantidadVendida = f.cantidad * (f.ingreso - f.devolucion);
    return (cantidadVendida * (f.precioCompra / f.cantidadCompra)) //+ f.costoFijo
  }

  get(){

    if(!this.fechas[0]){
      return;
    }

    if(!this.fechas[0] || !this.fechas[1]){
      this.imprimitMsj('Debe seleccionar 2 fechas en el calendario', MessageType.Warn, 'Advertencia');
      return;
    }

    this.loading = true;
    this.service.getFacturas(this.fechas[0], this.fechas[1]).pipe(
      catchError(e =>{
        this.loading = false;
        return throwError(()=> e)
      })
    ).subscribe(data => {
      const agrupador: AgrupadorVentas[] = data.map(m => { return {fecha: m.fecha.toDate(), lugar: m.lugar }});
      const unique = agrupador.filter((obj, index) => {
        return index === agrupador.findIndex(o => obj.fecha.getFullYear() == o.fecha.getFullYear() && obj.fecha.getDate() == o.fecha.getDate()
        && obj.fecha.getMonth() == o.fecha.getMonth() && obj.lugar == o.lugar);
      });
      console.log(data.map(m => { return {fecha: m.fecha.toDate(), vendedor: m.vendedor}}));
      this.service.getRubros(this.fechas[0], this.fechas[1]).pipe(
        catchError(e =>{
          this.loading = false;
          return throwError(()=> e)
        })
      ).subscribe(rubros => {
        const reps: ReporteVentas[] = [];
        unique.forEach(el => {
          const rubrosFiltrados = rubros.filter(r => r.fecha.toDate().getDate() === el.fecha.getDate() && r.fecha.toDate().getMonth() == el.fecha.getMonth()
           && r.fecha.toDate().getFullYear() == el.fecha.getFullYear() && r.lugar === el.lugar);
          const bruto = data.filter(r => r.fecha.toDate().getDate() === el.fecha.getDate() && r.fecha.toDate().getMonth() == el.fecha.getMonth()
          && r.fecha.toDate().getFullYear() == el.fecha.getFullYear() && r.lugar === el.lugar).
          reduce((acc, o) => acc + ((o.ingreso - o.devolucion)*o.precioProducto), 0); //rubrosFiltrados.reduce((acc, obj) => acc + (obj.dolares? obj.monto * obj.tipoCambio : obj.monto), 0);
          const gasto = rubrosFiltrados.filter(rb => rb.tipo == 'Gasto').reduce((acc, obj) => acc + (obj.dolares? obj.monto * obj.tipoCambio : obj.monto), 0);
          const credito = rubrosFiltrados.filter(rb => rb.tipo == 'Credito').reduce((acc, obj) => acc + (obj.dolares? obj.monto * obj.tipoCambio : obj.monto), 0);
          const inversion = data.filter(r => r.fecha.toDate().getDate() === el.fecha.getDate() && r.fecha.toDate().getMonth() == el.fecha.getMonth()
          && r.fecha.toDate().getFullYear() == el.fecha.getFullYear() && r.lugar === el.lugar).reduce((acc, o) => acc + this.getInversion(o), 0);
          const bolsas = data.filter(r => r.fecha.toDate().getDate() === el.fecha.getDate() && r.fecha.toDate().getMonth() == el.fecha.getMonth()
          && r.fecha.toDate().getFullYear() == el.fecha.getFullYear() && r.lugar === el.lugar).
          reduce((acc, o) => acc + (o.costoFijo * (o.ingreso - o.devolucion)), 0);
          const ganancia = (bruto - gasto) - inversion - credito;
          const lug = data.find(e => e.lugar == el.lugar);
          const lugar = lug?.nombreLugar ?? el.lugar;
          reps.push({
            fecha: el.fecha, lugar: lugar, bruto: bruto, neto: bruto - gasto, inversion: inversion, ganancia: ganancia, credito: credito, codLugar: el.lugar, costoFijo: bolsas
          })
        });
        this.reporte = reps;
        this.calcularTotales();
        this.loading = false
      });
    })
  }

  confirm(evt: Event, fact: ReporteVentas){
    evt.stopPropagation();
    evt.preventDefault();
    const nombreBorrar = fact.fecha.toLocaleDateString('en-GB') + ' para ' + fact.lugar;
    this.cfService.confirm({
      message: `¿Realmente desea eliminar toda la factura del dia <b> ${nombreBorrar} </b>?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'No',
      acceptLabel: 'Sí',
      accept: () => {
        this.eliminar(evt, fact);
      },
      reject: (type: any) => {
          switch (type) {
              case ConfirmEventType.REJECT:
                  console.log('rejected')
                  break;
              case ConfirmEventType.CANCEL:
                  this.imprimitMsj("Ha cancelado la transacción", MessageType.Warn, "Operación cancelada");
                  break;
          }
      }
    })
  }

  
  confirm2(evt: Event, fact: ReporteVentas){
    evt.stopPropagation();
    evt.preventDefault();
    const nombreBorrar = fact.fecha.toLocaleDateString('en-GB') + ' para ' + fact.lugar;
    this.cfService.confirm({
      message: `¿Realmente desea actualizar los precios y cantidades de la factura del dia <b> ${nombreBorrar} </b>?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'No',
      acceptLabel: 'Sí',
      accept: () => {
        this.actualizar(evt, fact);
      },
      reject: (type: any) => {
          switch (type) {
              case ConfirmEventType.REJECT:
                  console.log('rejected')
                  break;
              case ConfirmEventType.CANCEL:
                  this.imprimitMsj("Ha cancelado la transacción", MessageType.Warn, "Operación cancelada");
                  break;
          }
      }
    })
  }

  eliminar(event: Event, facts: ReporteVentas){
    this.terminado = false;
    this.loading = true;
    this.iService.getAllWithOutSeller(facts.fecha, facts.codLugar).pipe(
      catchError(e =>{
        this.loading = false;
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      this.iService.getRubros(facts.fecha, facts.codLugar, '').pipe(catchError(e =>{
        this.loading = false;
        return throwError(()=> e)
      })).subscribe(rubs => {
        event.stopPropagation();
        event.preventDefault();
        if(this.terminado) return;
        if(data.length > 0 || rubs.length > 0){
          const productosModificados = this.productos.filter(p => data.some(f => f.codigoProducto == p.id));
          productosModificados.forEach(prod => {
            const retornar = data.filter(g => g.codigoProducto == prod.id).reduce((acc, o) => acc + (o.ingreso - o.devolucion), 0);
            if(prod.existencias){
              prod.existencias = prod.existencias + retornar
            }
          })
          this.terminado = true;
          this.service.removeFacturas(data.map(f => f.id), rubs.map(r => r.id), productosModificados).then(_ => this.get()).catch(e => console.log(e))
          this.loading = false;
        }else{
          this.loading = false;
        }
      })
      
    })
  }

  actualizar(event: Event, facts: ReporteVentas){
    this.terminado = false;
    this.loading = true;
    this.iService.getAllWithOutSeller(facts.fecha, facts.codLugar).pipe(
      catchError(e =>{
        this.loading = false;
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      event.stopPropagation();
      event.preventDefault();
      if(this.terminado) return;
      if(data.length > 0){
        this.terminado = true;
        this.service.updateDataToCurrentValues(data, this.productos).then(_ => this.get()).catch(e => console.log(e));
      }else{
        this.loading = false;
      }
    })
  }


  imprimitMsj(msj: string, type: string, title: string){
    this.msjService.clear();
    this.msjService.add({
      severity: type, detail: msj, summary: title, life: 6000, closable: true, key: 'ts'
    })
  }
}
