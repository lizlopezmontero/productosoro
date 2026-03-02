import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { PrimeNGConfig, MessageService, ConfirmationService } from 'primeng/api';
import { catchError, Observable, throwError } from 'rxjs';
import { MessageType } from 'src/app/enums/Message';
import { es } from 'src/app/functions/locale';
import { ComponentCanDeactivate } from 'src/app/guards/pending-changes';
import { CierreCaja } from 'src/app/modelos/cierre-caja';
import { Compras } from 'src/app/modelos/compras';
import { CashClosingService } from 'src/app/services/cash-closing.service';
import { PurchaseService } from 'src/app/services/purchase.service';

function beforeunload(e: BeforeUnloadEvent){
  var confirmationMessage = "\o/";
  e.returnValue = confirmationMessage;     // Gecko, Trident, Chrome 34+
  return confirmationMessage;              // Gecko, WebKit, Chrome <34
}

function createRandomString(length: number) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class PurchaseComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  
  data: Compras[] = [];
  cierres: CierreCaja[] = [];
  fecha: Date;
  tipoCambio: number = 500;
  loading: boolean = false;
  pendantChanges: boolean = false;

  getId(): string{  
    const max = createRandomString(18);
    return 'CR'+ max;
  }

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    return !this.pendantChanges
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', beforeunload);
  }

  getAll(){
    if(this.loading) return
    this.loading = true;
    this.service.getAll(this.fecha).pipe(
      catchError(err => {
        this.loading = false
          return throwError(() => new Error(err))
      })).subscribe(res => {
        let compras: Compras[] = this.cierres.map(cierre => {
          return {
            ...res.find(compra => compra.idRubro === cierre.id),
            ...cierre, 
            fecha: Timestamp.fromDate(this.fecha),
            idRubro: cierre.id, monto: 0,
            nombreRubro: cierre.nombre, 
            tipoCambio: this.tipoCambio,
            id: ''
          }
        })
        const aditionalData = res.filter(fl => compras.findIndex(compra => compra.idRubro === fl.idRubro) === -1);
        for(let i = 0; i < compras.length; i++){
          const element = res.findIndex(res => res.idRubro === compras[i].idRubro);
          if(element !== -1) {
            compras[i] = res[element]
          }
        }
        
      this.data = compras.concat(aditionalData);
      this.loading = false
    })
  }

  presionar(){
    this.pendantChanges = true;
  }

  fillIds(compras: Compras[]){
    compras.forEach(compra => {
      if(!compra.id)
        compra.id = this.getId();
    })
  }

  totalCompras(){
    return "₡ "+ this.data.reduce((sum, c) => sum + c.monto, 0).toLocaleString();
  }

  save(){
    const filterData = this.data.filter(compra => compra.monto > 0);
    if(filterData.length === 0){ 
      this.imprimitMsj('No hay compras registradas', MessageType.Warn, 'Error')
      return;
    }
    this.fillIds(filterData);
    this.loading = true
    this.service.save(filterData).then(() => {
      this.loading = false
      this.imprimitMsj('Compras registradas', MessageType.Success, 'Operacion exitosa');
      this.pendantChanges = false
      this.getAll();
    }).catch(err => {
      this.loading = false
      this.imprimitMsj(err, MessageType.Error, 'Error')
    })
  }

  confirm(id: string){
    this.confirmationService.confirm({
      message: '¿Desea eliminar la compra?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.delete(id)
      },
      reject: () => {}
    });
  }

  delete(id: string){
    this.loading = true
    this.service.delete(id).then(() => {
      this.loading = false
      this.imprimitMsj('Compras eliminadas', MessageType.Success, 'Operacion exitosa');
      this.getAll();
    }).catch(err => {
      this.loading = false
      this.imprimitMsj(err, MessageType.Error, 'Error')
    })
  }

  imprimitMsj(msj: string, type: string, title: string){
    this.message.clear();
    this.message.add({
      severity: type, detail: msj, summary: title, life: 6000, closable: true, key: 'ts'
    })
  }
  
  ngOnInit(): void {
    this.getCierres();
   }

  constructor(private cierreService: CashClosingService, private service: PurchaseService,  private config: PrimeNGConfig, private message: MessageService, private confirmationService: ConfirmationService){
    this.config.setTranslation(es); 
    const date = new Date();
    date.setHours(0,0,0,0);
    this.fecha = date;
  }

  getCierres(){
    this.loading = true
    this.cierreService.getAllCompras().pipe(
      catchError(err => {this.loading = false; return throwError(() => new Error(err))})
    )
    .subscribe(res => {this.loading = false; this.cierres = res});
  }
}

