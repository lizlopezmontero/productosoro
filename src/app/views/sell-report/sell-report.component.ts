import {  Component, OnInit } from '@angular/core';
import { ConfirmEventType, ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { es } from 'src/app/functions/locale';
import { Facturacion } from 'src/app/modelos/facturacion';
import { AgrupadorVentas, ReporteVentas } from 'src/app/modelos/reporte-ventas';
import { ReportService } from 'src/app/services/report.service';
import { getDiaSemana, getMesDelAno } from 'src/app/functions/listas';
import { MessageType } from 'src/app/enums/Message';
import { InvoiceService } from 'src/app/services/invoice.service';
import { ProductsService } from 'src/app/services/products.service';
import { Producto } from 'src/app/modelos/producto';
import { Tarjeta } from 'src/app/modelos/tarjeta';

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
  totalBolsas: number = 0;
  totalEtiquetas: number = 0;
  totalTC: number = 0;
  terminado: boolean = true;
  w: number;
  tarjetas: Tarjeta[] = [];
  tasaImpuesto: number = 13;
  totalImpuesto: number = 0;
  excepcionesImpuestos: string[] = ['M001','M002','M003','M004','M005','M006','M007','M008','s001','s002','S003','S004','S005','S006','S007','S009'];
  currentFechaReport: Date = new Date();
  currentPlaceReport: string = '';
  newFechaReport: Date | null = null;
  openChangeDatePicker: boolean = false; 

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
    this.totalImpuesto = this.reporte.reduce((acc, o)=> acc + o.impuesto, 0);
    this.totalNeto = this.reporte.reduce((acc, o)=> acc + o.neto, 0);
    this.totalInversion = this.reporte.reduce((acc, o)=> acc + o.inversion, 0);
    this.totalGanancia = this.reporte.reduce((acc, o)=> acc + o.ganancia, 0);
    this.totalCreditos = this.reporte.reduce((acc, o)=> acc + o.credito, 0);
    this.totalCostoFijo = this.reporte.reduce((acc, o)=> acc + o.costoFijo, 0);
    this.totalBolsas = this.reporte.reduce((acc, o)=> acc + o.bolsas, 0);
    this.totalEtiquetas = this.reporte.reduce((acc, o)=> acc + o.etiquetas, 0);
    this.totalTC = this.reporte.reduce((acc, o)=> acc + (o.tarjeta?.monto ?? 0), 0);
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
    this.service.getTarjetas(this.fechas[0], this.fechas[1]).pipe(
      catchError(e =>{
        this.loading = false;
        return throwError(()=> e)
      })
    ).subscribe(tarjs => {
      this.tarjetas = tarjs;
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
            const costo = rubrosFiltrados.filter(rb => rb.tipo == 'Costo').reduce((acc, obj) => acc + (obj.dolares? obj.monto * obj.tipoCambio : obj.monto), 0);
            const inversion = data.filter(r => r.fecha.toDate().getDate() === el.fecha.getDate() && r.fecha.toDate().getMonth() == el.fecha.getMonth()
            && r.fecha.toDate().getFullYear() == el.fecha.getFullYear() && r.lugar === el.lugar).reduce((acc, o) => acc + this.getInversion(o), 0);
            const bolsas = data.filter(r => r.fecha.toDate().getDate() === el.fecha.getDate() && r.fecha.toDate().getMonth() == el.fecha.getMonth()
            && r.fecha.toDate().getFullYear() == el.fecha.getFullYear() && r.lugar === el.lugar).
            reduce((acc, o) => acc + (o.costoFijo * (o.ingreso - o.devolucion)), 0);
            const tarjeta = this.tarjetas.find(t => t.id == this.parseDate(el.fecha));
            const brutoExcepcion = data.filter(r => r.fecha.toDate().getDate() === el.fecha.getDate() && r.fecha.toDate().getMonth() == el.fecha.getMonth()
            && r.fecha.toDate().getFullYear() == el.fecha.getFullYear() && r.lugar === el.lugar && this.excepcionesImpuestos.includes(r.codigoProducto)).
            reduce((acc, o) => acc + ((o.ingreso - o.devolucion)*o.precioProducto), 0); 
            const impuesto = (brutoExcepcion * this.tasaImpuesto) / 100; 
            const ganancia = (bruto - gasto - costo) - inversion - credito - bolsas - impuesto - (tarjeta?.monto ?? 0);
            const costoBolsas =  data.filter(r => r.fecha.toDate().getDate() === el.fecha.getDate() && r.fecha.toDate().getMonth() == el.fecha.getMonth()
            && r.fecha.toDate().getFullYear() == el.fecha.getFullYear() && r.lugar === el.lugar).
            reduce((acc, o) => acc + (o.montoBolsas ?? 0), 0);
            const costoEtiquetas =  data.filter(r => r.fecha.toDate().getDate() === el.fecha.getDate() && r.fecha.toDate().getMonth() == el.fecha.getMonth()
            && r.fecha.toDate().getFullYear() == el.fecha.getFullYear() && r.lugar === el.lugar).
            reduce((acc, o) => acc + (o.montoEtiquetas ?? 0), 0);
            const lug = data.find(e => e.lugar == el.lugar);
            const lugar = lug?.nombreLugar ?? el.lugar;
            
            
            reps.push({
              fecha: el.fecha, lugar: lugar, bruto: bruto, neto: bruto - gasto, inversion: inversion, ganancia: ganancia, credito: credito, bolsas: costoBolsas, etiquetas: costoEtiquetas,
              impuesto: impuesto, codLugar: el.lugar, costoFijo: bolsas, tarjeta
            })
          });
          this.reporte = reps;
          this.calcularTotales();
          this.loading = false
        });
      })
    });
    
  }

  getValorTarjeta(fact: ReporteVentas): string{
    if(fact.tarjeta){
      return '₡'+fact.tarjeta.monto.toLocaleString();
    }
    return "₡0";
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

  onOpenSelectionReport($event: Event, rep: ReporteVentas){
    $event.stopPropagation();
    $event.preventDefault();
    this.newFechaReport = null;
    this.currentFechaReport = rep.fecha;
    this.currentPlaceReport = rep.codLugar;
    this.openChangeDatePicker = true;
  }

  onChangeDate($event: Event){
    $event.stopPropagation();
    $event.preventDefault();
    if(this.loading) return;
    if(!this.newFechaReport){
      this.imprimitMsj('Debe seleccionar una nueva fecha', MessageType.Warn, 'Advertencia');
      return;
    }
     this.loading = true;
    this.iService.getAllWithOutSeller(this.currentFechaReport, this.currentPlaceReport).pipe(
      catchError(e =>{
        this.loading = false;
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      this.iService.getRubrosWithoutSeller(this.currentFechaReport, this.currentPlaceReport).pipe(catchError(e =>{
        this.loading = false;
        return throwError(()=> e)
      })).subscribe(rubs => {
        this.loading = false;
        console.log(this.currentFechaReport, this.currentPlaceReport, this.newFechaReport);
        // this.openChangeDatePicker = false;
        //console.log(data, rubs, this.newFechaReport);
        this.service.updateDataToNewDate(data, rubs, this.newFechaReport!).then(_ => { this.openChangeDatePicker = false; this.get(); this.imprimitMsj('Datos actualizados', MessageType.Success, 'Operación exitosa'); }).catch(e => console.log(e));
      });
    })
  }

  getFecha(date: Date | null): string{
    if(date){
      return getDiaSemana(date.getDay()) + date.getDate() + ' de ' + getMesDelAno(date.getMonth()) + ', '+date.getFullYear();
    }
    return '';
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
            }else{
              prod.existencias = retornar
            }
          })
          this.terminado = true;
          this.service.removeFacturas(data.map(f => f.id), rubs.map(r => r.id), productosModificados, this.tarjetas.filter(t => t.id == this.parseDate(facts.fecha))
          ).then(_ => this.get()).catch(e => console.log(e))
          this.loading = false;
        }else{
          this.loading = false;
        }
      })
      
    })
  }

  parseDate(date: Date): string{
    const mes = date.getMonth() + 1;
    const dia = date.getDate();
    return date.getFullYear() + '-' + (mes > 9 ? ''+mes: '0'+mes) + '-' + (dia > 9 ? ''+dia: '0'+dia);
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
