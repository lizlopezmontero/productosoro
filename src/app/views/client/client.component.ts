import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService, ConfirmEventType } from 'primeng/api';
import { Subscription, catchError, throwError } from 'rxjs';
import { MessageType } from 'src/app/enums/Message';
import { Lugar } from 'src/app/modelos/lugar';
import { Cliente } from 'src/app/modelos/cliente';
import { PlacesService } from 'src/app/services/places.service';
import { ClientsService } from 'src/app/services/clients.service';
import { Vendedor } from 'src/app/modelos/vendedor';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class ClientComponent implements OnInit, OnDestroy {
  clientes: Cliente[] = [];
  loading: boolean = false;
  visible: boolean = false;
  editando:boolean = false;
  lugares: Lugar[] = [];
  lugarId: string = ''
  vendedores: Vendedor[] = [];
  vendedorId: string = '';
  lugarFilter: string = '';
  
  form = this.buildForm();
  isMobile = false;
  filtrar: boolean = false;

  private subscriptions: Subscription[] = [];
  constructor(private breakpointObserver: BreakpointObserver,
              private formBuilder: FormBuilder, private serviceLugares: PlacesService, private serviceCliente: ClientsService,
              private msjService: MessageService, private cfService: ConfirmationService) { }

  ngOnInit(): void {
    this.getVendedores();
    this.getLugares();
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
    this.resetValue('id');
    this.resetValue('name');
    this.resetValue('desc');
    this.resetValue('phone');
    this.lugarId = '';
    this.vendedorId = '';
    this.editando = false;
    this.visible = true;
  }

  editar(l: Cliente){
    this.form?.get('id')?.setValue(l.id);
    this.form?.get('name')?.setValue(l.nombre);
    this.form?.get('desc')?.setValue(l.descripcion);
    this.form?.get('phone')?.setValue(l.telefono);
    this.lugarId = l.lugar;
    this.vendedorId = l.vendedor;
    this.editando = true;
    this.visible = true;
  }

  getLugar(plc: string): string{
    const lug = this.lugares.find(f => f.id == plc)
    if(lug) return lug.nombre;

    return '';
  }

  getVendedor(vd: string): string{
    const ven = this.vendedores.find(f => f.id == vd)
    if(ven) return ven.nombre;

    return '';
  }


  currentCliente(): Cliente{
    return {
      id: this.form?.get('id')?.value,
      nombre: this.form?.get('name')?.value,
      descripcion: this.form?.get('desc')?.value,
      telefono: this.form?.get('phone')?.value,
      lugar:  this.lugarId,
      vendedor: this.vendedorId
    }
  }

  getLugares(){
    this.serviceLugares.getAll().pipe(
      catchError(e =>{
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      this.lugares = data
     })
  }

  getVendedores(){
    this.serviceLugares.getVendedores().pipe(
      catchError(e =>{
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      this.vendedores = data
     })
  }

  getAll(){
    this.loading = true
    this.serviceCliente.getAll(this.lugarFilter).pipe(
      catchError(e =>{
        this.loading = false
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      this.clientes = data
      this.loading = false
     })
  }

  isRepeated(client: Cliente): boolean{
    if(!this.editando){
      const selected = this.clientes.find(l => l.id == client.id);
      if(selected){
        return true;
      }
    }
    return false;
  }

  guardar(){
    const place = this.currentCliente();
    if (this.form?.invalid) {
      this.form?.markAllAsTouched();
      return;
    }
    if(this.isRepeated(place)){
      this.imprimitMsj("Ya existe un cliente con ese id", MessageType.Error, "Error");
      return;
    }
    if(!this.lugarId){
      this.imprimitMsj("Debe seleccionar un lugar para el cliente", MessageType.Error, "Error");
      return
    }
    if(!this.vendedorId){
      this.imprimitMsj("Debe seleccionar un vendedor para el cliente", MessageType.Error, "Error");
      return
    }
    this.loading = true;
    this.visible = false;
    this.serviceCliente.save(place).then(t => {
      this.getAll();
      this.imprimitMsj(this.editando ? 'Cliente editado con éxito': 'Cliente agregado con éxito', MessageType.Success, 'Mensaje');
    }).catch(err => {this.loading = false; console.log(err) })
    
  }

  imprimitMsj(msj: string, type: string, title: string){
    this.msjService.clear();
    this.msjService.add({
      severity: type, detail: msj, summary: title, life: 6000, closable: true, key: 'ts'
    })
  }

  confirm(cliente: Cliente){
    const cli = cliente.nombre;
    this.cfService.confirm({
      message: `¿Realmente desea eliminar a <b> ${cli} </b> de la lista?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'No',
      acceptLabel: 'Sí',
      accept: () => {
          this.borrar(cliente.id);
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
    this.serviceCliente.checkIfUsed(id).pipe(
      catchError(e =>{
        this.loading = false
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      if(data.length > 0){
        this.imprimitMsj("No se puede eliminar porque hay prestamos asociados", MessageType.Warn, "No se pudo eliminar");
      }else{
        this.serviceCliente.delete(id).then(t => {
          this.getAll();
          this.imprimitMsj('Cliente eliminado de la lista', MessageType.Success, 'Mensaje');
        }).catch(err => {this.loading = false; console.log(err) })
      }
    })
    
  }

  getNextId(lug: string): string{
    const filteredData = this.clientes.filter(f => f.lugar === lug);
    let nId = 1;
    if(filteredData.length > 0){
      const ids = filteredData.map(j => parseInt(j.id.substring(lug.length)));
      const max = Math.max(...ids);
      nId = max + 1;
    }
    const id = nId > 9 ? ''+nId:'0'+nId;
    return lug + id;
  }

  onChangeLugar(val: string){
    this.form?.get('id')?.setValue(this.getNextId(val));
  }

  resetValue(fieldControlName: string): void {
    this.form?.get(fieldControlName)?.reset(null);
  }

  private buildForm(): FormGroup {
      return this.formBuilder.group({
          id: [ null, [ Validators.required ]],
          name: [ null, [ Validators.required ]],
          desc: [ null ],
          phone: [ null, [ Validators.required ]]
      });
  }
}
