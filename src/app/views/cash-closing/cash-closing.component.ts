import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService, ConfirmEventType } from 'primeng/api';
import { Subscription, catchError, throwError } from 'rxjs';
import { MessageType } from 'src/app/enums/Message';
import { CierreCaja } from 'src/app/modelos/cierre-caja';
import { CashClosingService } from 'src/app/services/cash-closing.service';
@Component({
  selector: 'app-cash-closing',
  templateUrl: './cash-closing.component.html',
  styleUrls: ['./cash-closing.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class CashClosingComponent implements OnInit, OnDestroy {
  data: CierreCaja[] = [];
  loading: boolean = false;
  visible: boolean = false;
  editando: boolean = false;
  dolares: boolean = false;
  tipo: string = 'Ingreso';
  clasificacion: string = 'Ventas';

  cierreCaja: CierreCaja = { id: '', nombre: '', dolares: false, tipo: 'I', orden: 0, clasificacion: 'Ventas' }
  
  form = this.buildForm();
  isMobile = false;
  orden: number = 0;

  private subscriptions: Subscription[] = [];
  constructor(private breakpointObserver: BreakpointObserver,
              private formBuilder: FormBuilder, private service: CashClosingService,
              private msjService: MessageService, private cfService: ConfirmationService) { }

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
    this.form?.get('id')?.setValue(this.getNextRubro());
    this.resetValue('name');
    this.dolares = false;
    this.editando = false;
    this.tipo = 'Ingreso';
    this.clasificacion = 'Ventas';
    this.orden = this.getNextOrden();
    this.visible = true;
  }

  getNextOrden(): number{
    if(this.data.length === 0) return 0;
    const max = Math.max(...this.data.map(o => o.orden));
    return max + 1;
  }

  getNextRubro(): string{
    const ids = this.data.map(m => parseInt(m.id.substring(2)))
    const current = Math.max(... ids);
    const next = current + 1;
    return 'CJ'+ (next < 10 ? '0'+next: ''+next);
  }

  editar(l: CierreCaja){
    this.form?.get('id')?.setValue(l.id);
    this.form?.get('name')?.setValue(l.nombre);
    this.dolares = l.dolares;
    this.tipo = l.tipo;
    this.orden = l.orden;
    this.clasificacion = l.clasificacion;
    this.editando = true;
    this.visible = true;
  }

  currentCierreCaja(): CierreCaja{
    return {
      id: this.form?.get('id')?.value,
      nombre: this.form?.get('name')?.value,
      dolares: this.dolares,
      tipo: this.tipo,
      orden: this.orden,
      clasificacion: this.clasificacion
    }
  }

  getAll(){
    this.loading = true
    this.service.getAll().pipe(
      catchError(e =>{
        this.loading = false
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      this.data = data
      this.loading = false
     })
  }

  isRepeated(cj: CierreCaja): boolean{
    if(!this.editando){
      const selected = this.data.find(l => l.id == cj.id);
      if(selected){
        return true;
      }
    }
    return false;
  }

  guardar(){
    const place = this.currentCierreCaja();
    if (this.form?.invalid) {
      this.form?.markAllAsTouched();
      return;
    }
    if(this.isRepeated(place)){
      this.imprimitMsj("Ya existe un elemento con ese id", MessageType.Error, "Error");
      return;
    }
    this.loading = true;
    this.visible = false;
    this.service.save(place).then(t => {
      this.getAll();
      this.imprimitMsj(this.editando ? 'Elemento editado con éxito': 'Elemento agregado con éxito', MessageType.Success, 'Mensaje');
    }).catch(err => {this.loading = false; console.log(err) })
    
  }

  imprimitMsj(msj: string, type: string, title: string){
    this.msjService.clear();
    this.msjService.add({
      severity: type, detail: msj, summary: title, life: 6000, closable: true, key: 'ts'
    })
  }

  confirm(cierreCaja: CierreCaja){
    const place = cierreCaja.nombre;
    this.cfService.confirm({
      message: `¿Realmente desea eliminar a <b> ${place} </b> de la lista?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'No',
      acceptLabel: 'Sí',
      accept: () => {
          this.borrar(cierreCaja.id);
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
      this.imprimitMsj('Elemento eliminado de la lista', MessageType.Success, 'Mensaje');
    }).catch(err => {this.loading = false; console.log(err) })
  }

  resetValue(fieldControlName: string): void {
    this.form?.get(fieldControlName)?.reset(null);
  }

  private buildForm(): FormGroup {
      return this.formBuilder.group({
          id: [ null, [ Validators.required ]],
          name: [ null, [ Validators.required ]]
      });
  }
}
