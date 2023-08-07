import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService, ConfirmEventType } from 'primeng/api';
import { Subscription, catchError, throwError } from 'rxjs';
import { MessageType } from 'src/app/enums/Message';
import { Lugar } from 'src/app/modelos/lugar';
import { PlacesService } from 'src/app/services/places.service';

@Component({
  selector: 'app-place',
  templateUrl: './place.component.html',
  styleUrls: ['./place.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class PlaceComponent implements OnInit, OnDestroy{
  lugares: Lugar[] = [];
  loading: boolean = false;
  visible: boolean = false;
  editando:boolean = false;
  lugar: Lugar = { id: '', nombre: '' }
  
  form = this.buildForm();
  isMobile = false;

  private subscriptions: Subscription[] = [];
  constructor(private breakpointObserver: BreakpointObserver,
              private formBuilder: FormBuilder, private service: PlacesService,
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
    this.resetValue('id');
    this.resetValue('name');
    this.editando = false;
    this.visible = true;
  }

  editar(l: Lugar){
    this.form?.get('id')?.setValue(l.id);
    this.form?.get('name')?.setValue(l.nombre);
    this.editando = true;
    this.visible = true;
  }

  currentLugar(): Lugar{
    return {
      id: this.form?.get('id')?.value,
      nombre: this.form?.get('name')?.value
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
      this.lugares = data
      this.loading = false
     })
  }

  isRepeated(place: Lugar): boolean{
    if(!this.editando){
      const selected = this.lugares.find(l => l.id == place.id);
      if(selected){
        return true;
      }
    }
    return false;
  }

  guardar(){
    const place = this.currentLugar();
    if (this.form?.invalid) {
      this.form?.markAllAsTouched();
      return;
    }
    if(this.isRepeated(place)){
      this.imprimitMsj("Ya existe un lugar con ese id", MessageType.Error, "Error");
      return;
    }
    this.loading = true;
    this.visible = false;
    this.service.save(place).then(t => {
      this.getAll();
      this.imprimitMsj(this.editando ? 'Lugar editado con éxito': 'Lugar agregado con éxito', MessageType.Success, 'Mensaje');
    }).catch(err => {this.loading = false; console.log(err) })
    
  }

  imprimitMsj(msj: string, type: string, title: string){
    this.msjService.clear();
    this.msjService.add({
      severity: type, detail: msj, summary: title, life: 6000, closable: true, key: 'ts'
    })
  }

  confirm(lugar: Lugar){
    const place = lugar.nombre;
    this.cfService.confirm({
      message: `¿Realmente desea eliminar a <b> ${place} </b> de la lista?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'No',
      acceptLabel: 'Sí',
      accept: () => {
          this.borrar(lugar.id);
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
      this.imprimitMsj('Lugar eliminado de la lista', MessageType.Success, 'Mensaje');
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
