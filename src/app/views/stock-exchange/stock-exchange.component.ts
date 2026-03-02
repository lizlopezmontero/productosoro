import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService, ConfirmEventType } from 'primeng/api';
import { Subscription, catchError, throwError } from 'rxjs';
import { MessageType } from 'src/app/enums/Message';
import { Bolsa } from 'src/app/modelos/bolsa';
import { StockExchangeService } from 'src/app/services/stock-exchange.service';

@Component({
  selector: 'app-stock-exchange',
  templateUrl: './stock-exchange.component.html',
  styleUrls: ['./stock-exchange.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class StockExchangeComponent implements OnInit {
  bolsas: Bolsa[] = [];
  loading: boolean = false;
  visible: boolean = false;
  editando:boolean = false;
  unidadKilo: number = 1;
  precioKilo: number = 0;

  
  form = this.buildForm();
  isMobile = false;
  filtrar: boolean = false;

  private subscriptions: Subscription[] = [];
  constructor(private breakpointObserver: BreakpointObserver,
              private formBuilder: FormBuilder, private service: StockExchangeService,
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

  aplicar(){
    this.getAll();
    this.filtrar = false
  }

  ngOnDestroy(): void {
      this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  nuevo(){
    this.form?.get('id')?.setValue(this.getNextId());
    this.resetValue('desc');
    this.unidadKilo = 500;
    this.precioKilo = 5000;
    this.editando = false;
    this.visible = true;
  }

  editar(l: Bolsa){
    this.form?.get('id')?.setValue(l.id);
    this.form?.get('desc')?.setValue(l.descripcion);
    this.unidadKilo = l.unidadKilo;
    this.precioKilo = l.precioKilo;
    this.editando = true;
    this.visible = true;
  }


  currentProducto(): Bolsa{
    return {
      id: this.form?.get('id')?.value,
      descripcion: this.form?.get('desc')?.value,
      unidadKilo:  this.unidadKilo,
      precioKilo: this.precioKilo
    }
  }

  getNextId() : string{
    const id = Date.now().toString();
    return "B" + id
  }

  getAll(){
    this.loading = true
    this.service.getAll().pipe(
      catchError(e =>{
        this.loading = false
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      this.bolsas = data
      this.loading = false
     })
  }

  isRepeated(product: Bolsa): boolean{
    if(!this.editando){
      const selected = this.bolsas.find(l => l.id == product.id);
      if(selected){
        return true;
      }
    }
    return false;
  }

  guardar(){
    const place = this.currentProducto();
    if (this.form?.invalid) {
      this.form?.markAllAsTouched();
      return;
    }
    if(this.isRepeated(place)){
      this.imprimitMsj("Ya existe una bolsa con ese codigo", MessageType.Error, "Error");
      return;
    }
    if(!this.precioKilo){
      this.imprimitMsj("Debe seleccionar un precio para el kilo", MessageType.Error, "Error");
      return
    }
    if(!this.unidadKilo){
      this.imprimitMsj("Debe seleccionar una cantidad por kilo", MessageType.Error, "Error");
      return
    }
    this.loading = true;
    this.visible = false;
    this.service.save(place).then(t => {
      this.getAll();
      this.imprimitMsj(this.editando ? 'Bolsa editada con éxito': 'Bolsa agregada con éxito', MessageType.Success, 'Mensaje');
    }).catch(err => {this.loading = false; console.log(err) })
    
  }

  imprimitMsj(msj: string, type: string, title: string){
    this.msjService.clear();
    this.msjService.add({
      severity: type, detail: msj, summary: title, life: 6000, closable: true, key: 'ts'
    })
  }

  confirm(producto: Bolsa){
    const prod = producto.descripcion;
    this.cfService.confirm({
      message: `¿Realmente desea eliminar a <b> ${prod} </b> de la lista?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'No',
      acceptLabel: 'Sí',
      accept: () => {
          this.borrar(producto.id);
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
    // this.serviceProducto.checkIfUsed(id).pipe(
    //   catchError(e =>{
    //     this.loading = false
    //     return throwError(()=> e)
    //   })
    // ).subscribe(data =>{
    //   if(data.length > 0){
    //     this.imprimitMsj("No se puede eliminar porque hay prestamos asociados", MessageType.Warn, "No se pudo eliminar");
    //   }else{
        this.service.delete(id).then(t => {
          this.getAll();
          this.imprimitMsj('Cliente eliminado de la lista', MessageType.Success, 'Mensaje');
        }).catch(err => {this.loading = false; console.log(err) })
    //   }
    // })
    
  }

  resetValue(fieldControlName: string): void {
    this.form?.get(fieldControlName)?.reset(null);
  }

  private buildForm(): FormGroup {
      return this.formBuilder.group({
          id: [ null, [ Validators.required ]],
          desc: [ null, [ Validators.required ]]
      });
  }
}
