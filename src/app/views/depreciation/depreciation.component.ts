import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService, ConfirmEventType, PrimeNGConfig } from 'primeng/api';
import { Subscription, catchError, throwError } from 'rxjs';
import { MessageType } from 'src/app/enums/Message';
import { es } from 'src/app/functions/locale';
import { Depreciacion } from 'src/app/modelos/depreciacion';
import { DepreciationService } from 'src/app/services/depreciation.service';

function weeksBetweenDates(d1: Date, d2: Date) {
  const diff = Math.abs(d1.getTime() - d2.getTime());
  const oneDay = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneDay);
}

@Component({
  selector: 'app-depreciation',
  templateUrl: './depreciation.component.html',
  styleUrls: ['./depreciation.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class DepreciationComponent implements OnInit, OnDestroy {
  depreciaciones: Depreciacion[] = [];
  loading: boolean = false;
  visible: boolean = false;
  editando:boolean = false;
  costo: number = 0;
  vida: number = 1;
  residual: number = 0;
  id: string = '';
  fecha: Date;
  depreciacion: Depreciacion = { id: '', articulo: '', costo: 0, vida: 1, residual: 0, fecha: Timestamp.now() };
  w: number;
  
  form = this.buildForm();
  isMobile = false;

  private subscriptions: Subscription[] = [];
  constructor(private breakpointObserver: BreakpointObserver, private config: PrimeNGConfig,
              private formBuilder: FormBuilder, private service: DepreciationService,
              private msjService: MessageService, private cfService: ConfirmationService) { 
                const hoy = new Date();
                hoy.setHours(0,0,0,0);
                this.fecha = hoy;
                config.setTranslation(es);
                this.w = window.innerWidth;
              }

  ngOnInit(): void {
    this.getAll();
      this.subscriptions.push(this.breakpointObserver.observe([
          Breakpoints.XSmall,
          Breakpoints.Small,
          Breakpoints.Handset
      ]).subscribe(result => this.isMobile = result.matches));
      this.form = this.buildForm();
  }

  ngOnDestroy(): void {
      this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  nuevo(){
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    this.fecha = hoy;
    this.id = this.getId();
    this.resetValue('articulo');
    this.costo = 0;
    this.vida = 1;
    this.residual = 0;
    this.editando = false;
    this.visible = true;
  }

  editar(l: Depreciacion){
    this.form?.get('articulo')?.setValue(l.articulo);
    this.id = l.id;
    this.costo = l.costo;
    this.vida = l.vida;
    this.residual = l.residual;
    this.fecha = l.fecha.toDate();
    this.editando = true;
    this.visible = true;
  }

  currentDepreciacion(): Depreciacion{
    return {
      id: this.id,
      articulo: this.form?.get('articulo')?.value,
      costo: this.costo,
      vida: this.vida,
      residual: this.residual,
      fecha: Timestamp.fromDate(this.fecha)
    }
  }
  getId(): string{
    const max = Date.now();
    return 'DP'+ max;
  }

  getAll(){
    this.loading = true
    this.service.getAll().pipe(
      catchError(e =>{
        this.loading = false
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      this.depreciaciones = data
      this.loading = false
     })
  }

    // isRepeated(depre: Depreciacion): boolean{
    //   if(!this.editando){
    //     const selected = this.depreciaciones.find(l => l.id == depre.id);
    //     if(selected){
    //       return true;
    //     }
    //   }
    //   return false;
    // }

  guardar(){
    const depre = this.currentDepreciacion();
    if (this.form?.invalid) {
      this.form?.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.visible = false;
    this.service.save(depre).then(t => {
      this.getAll();
      this.imprimitMsj(this.editando ? 'Depreciacion editado con éxito': 'Depreciacion agregado con éxito', MessageType.Success, 'Mensaje');
    }).catch(err => {this.loading = false; console.log(err) })
    
  }

  imprimitMsj(msj: string, type: string, title: string){
    this.msjService.clear();
    this.msjService.add({
      severity: type, detail: msj, summary: title, life: 6000, closable: true, key: 'ts'
    })
  }

  confirm(depreciacion: Depreciacion){
    const place = depreciacion.articulo;
    this.cfService.confirm({
      message: `¿Realmente desea eliminar el artículo <b> ${place} </b> de la lista?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'No',
      acceptLabel: 'Sí',
      accept: () => {
          this.borrar(depreciacion.id);
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

  borrar(id: string) {
    this.service.delete(id).then(t => {
      this.getAll();
      this.imprimitMsj('Depreciacion eliminado de la lista', MessageType.Success, 'Mensaje');
    }).catch(err => {this.loading = false; console.log(err) })
  }

  showFecha(fecha: Timestamp): string{
    if(fecha){
      const miFecha = fecha.toDate();
      return miFecha.toLocaleDateString();
    }
    return '';
  }

  showDepreciationDate(depre: Depreciacion): string{
    if(depre){
      const miFecha = depre.fecha.toDate();
      miFecha.setFullYear(miFecha.getFullYear() + depre.vida);
      return miFecha.toLocaleDateString();
    }
    return '';
  }
  showDepreciationAmount(depre: Depreciacion): string{
    if(depre){
      const amount = this.depreciationAmount(depre);
      return amount.toLocaleString(undefined, {maximumFractionDigits: 2});
    }
    return '';
  }
  totalDepreciation(): string{
    let total = 0;
    this.depreciaciones.forEach(depre => {
      total += this.depreciationAmount(depre);
    });
    return total.toLocaleString(undefined, {maximumFractionDigits: 2});	
  }

  depreciationAmount(depre: Depreciacion): number{
    if(depre){
      const miFecha = depre.fecha.toDate();
      const fechaActual = new Date();
      fechaActual.setHours(0,0,0,0);
      const depreciationWeeks = weeksBetweenDates(miFecha, fechaActual);
      const depreAnual = (depre.costo - ((depre.costo * depre.residual)/100)) / depre.vida;
      const depreSemanal = depreAnual / 52;
      return (depreSemanal* depreciationWeeks);
    }
    return 0;
  }

  resetValue(fieldControlName: string): void {
    this.form?.get(fieldControlName)?.reset(null);
  }

  private buildForm(): FormGroup {
      return this.formBuilder.group({
          articulo: [ null, [ Validators.required ]]
      });
  }
}


