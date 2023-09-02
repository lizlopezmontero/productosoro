import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Facturacion } from 'src/app/modelos/facturacion';
import { InvoiceService } from 'src/app/services/invoice.service';
import { es } from 'src/app/functions/locale';
import { zeroPad, compareDatesSimple } from 'src/app/functions/util';
import { ConfirmEventType, ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';
import { Timestamp } from '@angular/fire/firestore';
import { CreditService } from 'src/app/services/credit.service';
import { Vendedor } from 'src/app/modelos/vendedor';
import { PlacesService } from 'src/app/services/places.service';
import { Lugar } from 'src/app/modelos/lugar';
import { MessageType } from 'src/app/enums/Message';
import { ComponentCanDeactivate } from 'src/app/guards/pending-changes';
import { DeleteInvoice } from 'src/app/modelos/delete-invoce';
import { Producto } from 'src/app/modelos/producto';
import { ProductsService } from 'src/app/services/products.service';
import { getMesDelAno, getDiaSemana } from 'src/app/functions/listas';
import { Rubro } from 'src/app/modelos/rubro';
import { CierreCaja } from 'src/app/modelos/cierre-caja';
import { CashClosingService } from 'src/app/services/cash-closing.service';
import { GeneralService } from 'src/app/services/general.service';
import { Tarjeta } from 'src/app/modelos/tarjeta';

function beforeunload(e: BeforeUnloadEvent){
  var confirmationMessage = "\o/";
  e.returnValue = confirmationMessage;     // Gecko, Trident, Chrome 34+
  return confirmationMessage;              // Gecko, WebKit, Chrome <34
}

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class InvoiceComponent implements OnInit, OnDestroy, ComponentCanDeactivate{
  vendedores: Vendedor[] =[];
  lugares: Lugar[] = [];
  lugarNombre: string = '';
  vendedor: string = 'v01';
  tipoCambioActual: number = 500;
  tipoCambio: number = 500;
  fecha: Date;
  lugar: string = '';
  codigoProducto: string = '';
  descripcionProducto: string = '';
  precioProducto: number = 0;
  ingreso: number = NaN;
  devolucion: number = NaN;
  nextInvoiceId: number = 1;
  nextConsecutivo: number = 1;
  facturas: Facturacion[] = [];
  loading: boolean = false;
  visible: boolean = false;
  visible2: boolean = false;
  visible3: boolean = false;
  send: boolean = false;
  editando: boolean = false;
  currentFactura: Facturacion;
  deletes: DeleteInvoice[] = [];
  productos: Producto[] = [];
  pendantChanges: boolean = false;
  w: number;
  sumaTotal: number = 0;
  fechas: Date[] = [];
  vendedorFilter: string = 'v01';
  lugarFilter: string = '';
  fechaFilter: Date;
  allData: Facturacion[] = [];
  rubros: Rubro[] = [];
  allRubros: CierreCaja[] = [];
  combinedRubros: Rubro[] = [];
  nextRubro: number = 1
  cantidad: number = 0;
  cantidadCompra: number = 0;
  precioCompra: number = 0;
  unidadMedida: string = 'Peso';
  costoFijo: number = 50;
  tarjeta: Tarjeta = { id: '' , fecha: Timestamp.fromDate(new Date()), monto: 0};
  tarjetaChange: boolean = false;
  
  ngOnInit(): void {

    window.addEventListener("beforeunload", beforeunload);

    this.getCostoFijo();
    this.getVendedores();
    this.getLugares();
    this.getAllRubros();  
    this.getProductos();
    this.getCurrentExchageRate();
    this.getNextInvoce();
    this.getNextRubro();
  }

  getCombinedRubros(rubros: Rubro[]){
    this.combinedRubros = [];
    // this.combinedRubros.push(...this.rubros);
    // const rubs = this.allRubros.filter(a => !this.combinedRubros.some(j => j.idRubro == a.id));
    this.allRubros.forEach(r => {
      const rub = rubros.find(rb => rb.idRubro == r.id);
      if(rub){
        this.combinedRubros.push(rub);
      }else{
        this.combinedRubros.push({
          id: 'r'+ zeroPad(this.nextRubro, 17), vendedor: this.vendedor, tipoCambio: this.tipoCambioActual,
          fecha: Timestamp.fromDate(this.fecha), idRubro: r.id, nombreRubro: r.nombre,
          dolares: r.dolares, lugar: this.lugar, monto: 0, check: false, tipo: r.tipo
        });
        this.nextRubro = this.nextRubro + 1;
      }
    });
  }

  getNextRubro(){
    this.service.getAllRubros().pipe(
      catchError(e =>{
        return throwError(()=> e)
      })
    ).subscribe(data => {
      const max = Math.max(...data.map(o => parseInt(o.id.slice(1))));
      this.nextRubro = max + 1;
    });
  }

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    return !this.pendantChanges
  }

  constructor(private service: InvoiceService, private config: PrimeNGConfig, private cService: CreditService,
     private lService: PlacesService, private message: MessageService, private cfService: ConfirmationService,
     private pService: ProductsService, private rService: CashClosingService, private gService: GeneralService){
    const date = new Date();
    date.setHours(0,0,0,0);
    this.config.setTranslation(es);
    this.fecha = date;
    this.fechaFilter = date;
    this.currentFactura = {id: '', vendedor: this.vendedor, lugar: this.lugar, nombreLugar: '',
     tipoCambio: this.tipoCambioActual, codigoProducto: '', descripcionProducto: '',
     precioProducto: 0, fecha: Timestamp.fromDate(this.fecha), ingreso: NaN, devolucion: NaN,
     consecutivo: this.nextConsecutivo, cantidad: 0, cantidadCompra: 0, precioCompra: 0, unidadMedida: 'Peso', costoFijo: 50
    }
    this.w = window.innerWidth;
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', beforeunload);
  }

  getVendedores(){
    this.cService.getSellers().pipe(
      catchError(e =>{
        return throwError(()=> e)
      })
    ).subscribe(data => this.vendedores = data);
  }

  getCostoFijo(){
    this.gService.getVariable('v01').pipe(
      catchError(e =>{
        return throwError(()=> e)
      })
    ).subscribe(data => {
      if(data.length > 0){
        this.costoFijo = parseInt(data[0].valor)
      }
    });
  }

  getAllRubros(){
    this.rService.getAll().pipe(
      catchError(e =>{
        return throwError(()=> e)
      })
    ).subscribe(data => this.allRubros = data);
  }

  selectLugar(val:string){
    this.fechas = [];
    const fechasReps = this.allData.filter(d => d.lugar == val).map(g => g.fecha.toDate());
    for(let i = 0, size = fechasReps.length; i < size; i++){
      if(!this.fechas.some(f => f.getDay() === fechasReps[i].getDay() && f.getMonth() === fechasReps[i].getMonth() && f.getFullYear() === fechasReps[i].getFullYear())){
        this.fechas.push(fechasReps[i])
      }
    }
    this.fechas = this.fechas.sort((a,b) => compareDatesSimple(a,b));
  }

  selectedLugar(val: string){
    const lug = this.lugares.find(l => l.id == val);
    if(lug){
      this.lugarNombre = lug.nombre;
    }
  }

  apply(){
    if(!this.lugarFilter){
      this.imprimitMsj("Seleccionar un lugar primero", MessageType.Warn, "Aviso")
      return
    }
    if(!this.fechaFilter){
      this.imprimitMsj("Seleccionar una fecha", MessageType.Warn, "Aviso")
      return
    }
    this.vendedor = this.vendedorFilter;
    this.lugar = this.lugarFilter;
    this.fecha = this.fechaFilter;
    this.visible2 = false;
    this.getAll();
  }

  selectProduct(val: string){
    const prd = this.productos.find(p => p.id == val);
    if(prd){
      this.currentFactura.descripcionProducto = prd.descripcion;
      this.currentFactura.precioProducto = prd.precioVenta;
      this.currentFactura.precioCompra = prd.precioCosto ?? 0;
      this.currentFactura.cantidad = prd.cantidad;
      this.currentFactura.cantidadCompra = prd.cantidadCosto ?? 0;
      this.currentFactura.unidadMedida = prd.seVendeComo;
      this.currentFactura.costoFijo = this.costoFijo;
    }
  }

  getLugares(){
    this.lService.getAll().pipe(
      catchError(e =>{
        return throwError(()=> e)
      })
    ).subscribe(data => this.lugares = data);
  }

  getProductos(){
    this.pService.getAll().pipe(
      catchError(e =>{
        return throwError(()=> e)
      })
    ).subscribe(data => this.productos = data);
  }

  getNextInvoce(){
    this.service.allInvoices().pipe(
      catchError(e =>{
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      if(data.length > 0){
        this.allData = data;
        const max = Math.max(...data.map(o => parseInt(o.id.slice(1))));
        const conse = Math.max(...data.map(o => o.consecutivo));
        this.nextInvoiceId = max + 1;
        this.nextConsecutivo = conse + 1;
      }
    })
  }

  nuevo(){
    if(!this.lugar){
      this.imprimitMsj("Primero seleccionar un lugar", MessageType.Warn, 'Advertencia')
      return;
    }
    this.currentFactura = {id: '', vendedor: this.vendedor, lugar: this.lugar,
     tipoCambio: this.tipoCambioActual, codigoProducto: '', descripcionProducto: '',
     precioProducto: 0, fecha: Timestamp.fromDate(this.fecha), ingreso: 1, devolucion: 0,
     consecutivo: this.nextConsecutivo, cantidad: 0, cantidadCompra: 0, precioCompra: 0, unidadMedida: 'Peso', costoFijo: 50,
     nombreLugar: this.lugarNombre
    };
    this.editando = false;
    this.send = false;
    this.visible = true;
  }

  nuevo3(){
    if(!this.lugar){
      this.imprimitMsj("Primero seleccionar un lugar", MessageType.Warn, 'Advertencia')
      return;
    }
    if(this.combinedRubros.length === 0){
      this.getAll();
    }
    this.visible3 = true;
  }

  editar(f: Facturacion){
    this.currentFactura = f;
    this.editando = true;
    this.send = false;
    this.visible = true;
  }

  guardar(){
    this.send = true;
    if(!this.currentFactura.codigoProducto || !this.currentFactura.ingreso){
      return;
    }

    if(this.facturas.some(f => f.codigoProducto == this.currentFactura.codigoProducto)){
      this.imprimitMsj('Ya se agrego este producto a la factura', MessageType.Warn, 'Aviso');
      return;
    }

    if(this.editando){
      const findIndex = this.facturas.findIndex(f => f.id == this.currentFactura.id);
      if(findIndex >= 0){
        this.facturas[findIndex] = this.currentFactura
      }
    }else{
      this.facturas.push(this.currentFactura)
    }
    this.visible = false;
    this.pendantChanges = true;
  }

  getCurrentExchageRate(){
    this.service.getTipoCambio().pipe(
      catchError(e =>{
        return throwError(()=> e)
      })
    ).subscribe(data => this.tipoCambioActual = Math.round(data.compra))
  }

  fillInvoices(fact: Facturacion[]){
    for(let i = 0, size = fact.length; i< size; i++){ 
      fact[i].id = 'f'+zeroPad(this.nextInvoiceId, 17);
      fact[i].tipoCambio = this.tipoCambioActual;
      this.nextInvoiceId++;      
    }
  }

  getFecha(date: Date){
    if(date){
      return getDiaSemana(date.getDay()) + date.getDate() + ' de ' + getMesDelAno(date.getMonth()) + ', '+date.getFullYear();
    }
    return '';
  }

  guardarFacturas(){
    const newFacturas = this.facturas.filter(f => f.id === '' && f.ingreso > 0);
    if(newFacturas.length == 0 && this.deletes.length == 0){
      if(this.tarjetaChange){
        this.service.storeOnlyCard(this.tarjeta).then(
          _=> this.imprimitMsj("Monto de tarjeta actualizado con exito", MessageType.Success, "Mensaje")
        ).catch(err => console.log(err));;
      }else{
        this.imprimitMsj("No hay cambios pendientes para guardar", MessageType.Warn, "");
        return;
      }
    }else{
      this.fillInvoices(newFacturas);
      this.service.insertMultipleRows(newFacturas,this.productos, this.deletes, this.tarjeta).then(
        _ => this.getAll()
      ).catch(err => console.log(err));
    }
  }

  parseDate(date: Date): string{
    const mes = date.getMonth() + 1;
    const dia = date.getDate();
    return date.getFullYear() + '-' + (mes > 9 ? ''+mes: '0'+mes) + '-' + (dia > 9 ? ''+dia: '0'+dia);
  }

  getAll(){
    if(!this.lugar){
      this.imprimitMsj("Debe seleccionar un lugar", MessageType.Warn, "");
      return;
    }
    this.deletes = [];
    this.pendantChanges = false;
    this.getNextRubro();
    this.getNextInvoce();
    this.getAllWithOutSeller();
    this.loading = true;
    this.service.getTarjetas(this.fecha).pipe(
      catchError(e =>{
        this.loading = false;
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      if(data){
        if(data.length > 0){
          this.tarjeta = data[0];
        }else{
          this.tarjeta = {id: this.parseDate(this.fecha), monto: 0, fecha: Timestamp.fromDate(this.fecha) };
        }
      }else{
        this.tarjeta = {id: this.parseDate(this.fecha), monto: 0, fecha: Timestamp.fromDate(this.fecha) };
      }
    });
    this.service.getAll(this.fecha, this.lugar, this.vendedor).pipe(
      catchError(e =>{
        this.loading = false;
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      this.loading = false;
      this.facturas = [];
      this.productos.forEach(p =>{
        const prodta = data.find(k => k.codigoProducto == p.id);
        if(prodta){
          this.facturas.push(prodta)
        }else{
          this.facturas.push({
            id: '', vendedor: this.vendedor, lugar: this.lugar,
            tipoCambio: this.tipoCambioActual, codigoProducto: p.id, descripcionProducto: p.descripcion,
            precioProducto: p.precioVenta, fecha: Timestamp.fromDate(this.fecha), ingreso: 0, devolucion: 0,
            consecutivo: this.nextConsecutivo, cantidad: p.cantidad, cantidadCompra: p.cantidadCosto ?? 0,
            precioCompra: p.precioCosto ?? 0, unidadMedida: p.seVendeComo, costoFijo: this.costoFijo,
            nombreLugar: this.lugarNombre
          })
        }
      })
      //this.facturas = data
    })
    this.service.getRubros(this.fecha, this.lugar, this.vendedor).pipe(
      catchError(e =>{
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      this.rubros = data;
      this.getCombinedRubros(data);
    })
  }

  getAllWithOutSeller() {
    this.service.getAllWithOutSeller(this.fecha, this.lugar).pipe(
      catchError(e =>{
        this.loading = false;
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      const suma = data.reduce((acc, o) => acc + ((o.ingreso - o.devolucion)* o.precioProducto), 0);
      this.sumaTotal = suma;
    })
  }

  confirm(fact: Facturacion, i: number){
    this.cfService.confirm({
      message: `¿Realmente desea eliminar al producto <b> ${fact.descripcionProducto} </b> de la lista?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'No',
      acceptLabel: 'Sí',
      accept: () => {
          this.borrar(fact, i);
      },
      reject: (type: any) => {
          switch (type) {
              case ConfirmEventType.REJECT:
                  break;
              case ConfirmEventType.CANCEL:
                  this.imprimitMsj("Ha cancelado la transacción", MessageType.Warn, "Operación cancelada");
                  break;
          }
      }
    })
  }

  borrar(fac: Facturacion, idx: number) {
    if(fac.id){
      const p = this.productos.find(a => a.id == fac.codigoProducto);
      if(p){
        if(p.existencias)
          p.existencias = p.existencias + (fac.ingreso - fac.devolucion)
        this.deletes.push({idFactura: fac.id, producto: p});
      }
    }
    this.facturas.splice(idx, 1);
    this.pendantChanges = true;
  }

  ventaTotal(): string{
    const sum = this.facturas.reduce((acc, obj)=>  acc + (obj.ingreso - obj.devolucion), 0);
    return sum.toLocaleString();
  }

  diferencial(): string{
    const colones = this.combinedRubros.filter(r => !r.dolares).reduce((acc, obj)=>  acc + obj.monto, 0);
    const dolares = this.combinedRubros.filter(r => r.dolares).reduce((acc, obj)=>  acc + obj.monto, 0);
    const sum = this.facturas.reduce((acc, obj)=>  acc + ( (obj.ingreso - obj.devolucion) * obj.precioProducto), 0);

    return ((colones + (dolares * this.tipoCambioActual)) - sum).toLocaleString();
  }

  totalCierre(): string{
    const colones = this.combinedRubros.filter(r => r.dolares == false).reduce((acc, obj)=>  acc + obj.monto, 0);
    const dolares = this.combinedRubros.filter(r => r.dolares == true).reduce((acc, obj)=>  acc + obj.monto, 0);
    return (colones + (dolares * this.tipoCambioActual)).toLocaleString();
  }

  ganaciaTotal(): string{
    const sum = this.facturas.reduce((acc, obj)=>  acc + ( (obj.ingreso - obj.devolucion) * obj.precioProducto), 0);
    return "₡ "+ sum.toLocaleString();
  }

  guardarCierre(){
    this.loading = true;
    for(let i = 0, size = this.combinedRubros.length; i < size; i++){
      if(this.combinedRubros[i].check){
        if(!this.combinedRubros[i].monto){
          if(!this.lugar){
            this.loading = false;
            this.imprimitMsj("El rubro "+ this.combinedRubros[i].nombreRubro + ' esta marcado pero no tiene un valor valido', MessageType.Warn, "Error");
            return;
          }
        }
      }
    }
    const checkedElements = this.combinedRubros.filter(g => g.check == true);
    const deleteElements = this.rubros.filter(r => !checkedElements.some(c => c.id == r.id));
    this.service.storeRubros(checkedElements, deleteElements, this.tarjeta).then(
      _ => { this.visible3 = false; this.getAll() }
    ).catch(err => console.log(err));
  }

  imprimitMsj(msj: string, type: string, title: string){
    this.message.clear();
    this.message.add({
      severity: type, detail: msj, summary: title, life: 6000, closable: true, key: 'ts'
    })
  }
}
