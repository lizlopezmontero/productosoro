import { Component, OnInit } from '@angular/core';
import { ConfirmEventType, ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { Cliente } from 'src/app/modelos/cliente';
import { HistoricoPrestamo } from 'src/app/modelos/historico-prestamo';
import { Vendedor } from 'src/app/modelos/vendedor';
import { ClientsService } from 'src/app/services/clients.service';
import { CreditService } from 'src/app/services/credit.service';
import { es } from 'src/app/functions/locale';
import { compareDates, zeroPad } from 'src/app/functions/util';
import { Prestamo } from 'src/app/modelos/prestamo';
import { Timestamp } from '@angular/fire/firestore';
import { MessageType } from 'src/app/enums/Message';
import { Lugar } from 'src/app/modelos/lugar';
import { PlacesService } from 'src/app/services/places.service';


@Component({
  selector: 'app-credit',
  templateUrl: './credit.component.html',
  styleUrls: ['./credit.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class CreditComponent implements OnInit{

  prestamos: HistoricoPrestamo[] = [];
  vendedores: Vendedor[] = [];
  clientes: Cliente[] = [];
  clientesFiltered: Cliente[] = [];
  loading: boolean = false;
  selectedSeller: string = '';
  selectedClient: string = '';
  selectedAmount: number = 0;
  selectedFecha: Date = new Date();
  tipoMonto: string = 'Credito';
  nextId: string = ''
  visible: boolean = false;
  filtrar: boolean = false;
  lugares: Lugar[] = [];
  lugarId: string = '';
  nombreVendedor: string = ''
  nombreCliente: string = ''
  descripcionCliente: string = ''
  lugar: string = ''
  nombreLugar: string = ''
  lugarAdd: string = '';
  currentId: string = '';
  editando: boolean = false;

  constructor(private service: CreditService, private clienteService: ClientsService,
     private msjService: MessageService, private cfService: ConfirmationService,
      private config: PrimeNGConfig, private lugarService: PlacesService){
      this.config.setTranslation(es)
     }

  ngOnInit(): void {
    this.service.getSellers().pipe(
      catchError(e =>{
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      this.vendedores = data
     })
     this.clienteService.getAll().pipe(
      catchError(e =>{
        return throwError(()=> e)
      })
     ).subscribe(data => { this.clientes = data, this.clientesFiltered = data })
     this.lugarService.getAll().pipe(
      catchError(e =>{
        return throwError(()=> e)
      })
     ).subscribe(data => { this.lugares = data })
  }

  onFilter(value: string){
    this.getNombreVendedor(value);
    this.clientesFiltered = this.clientes.filter(f => f.vendedor == value)
  }

  imprimitMsj(msj: string, type: string, title: string){
    this.msjService.clear();
    this.msjService.add({
      severity: type, detail: msj, summary: title, life: 6000, closable: true, key: 'ts'
    })
  }

  filterer(){
    if(this.nextId === ''){
      this.imprimitMsj('Primero seleccione un vendedor', MessageType.Warn, 'Atencion')
      return
    }
    this.filtrar = true
  }

  nuevo(){
    this.editando = false;
    if(this.nextId === ''){
      this.imprimitMsj('Primero seleccione un vendedor', MessageType.Warn, 'Atencion')
      return
    }
    this.selectedClient = '';
    this.selectedAmount = 0;
    this.selectedFecha = new Date();
    this.tipoMonto = 'Credito';
    this.visible = true
  }

  guardar(){
    
    if(this.validar()){
      this.getMaxPrestamo()
    }
    
  }
  validar(): boolean {
    if(this.selectedClient && this.selectedSeller && this.selectedAmount)
      return true
    return false
  }

  calculateClientTotal(id: string): string{
    let total = 0;
    const current = this.prestamos.find(h => h.id == id)
    if(current){
      if(current.prestamos){
        for(let t=0, size = current.prestamos.length; t< size; t++){
          if(current.prestamos[t].abono)
            total = total - current.prestamos[t].monto
          else
            total = total + current.prestamos[t].monto
        }
      }
    }
    return ''+total.toLocaleString()
  }

  getId(){
    this.service.getAllCredits().pipe(
      catchError(e =>{
        this.loading = false
        return throwError(()=> e)
      })
     ).subscribe(data => {
        const max = Math.max(...data.map(o => parseInt(o.id.slice(1))))
        this.nextId = 'p'+ zeroPad(max + 1, 18)
     })
  }

  getMaxPrestamo(){
    this.visible = false
    this.loading = true
    // this.service.getAllCredits().pipe(
    //   catchError(e =>{
    //     this.loading = false
    //     return throwError(()=> e)
    //   })
    //  ).subscribe(data => {
    //     const max = Math.max(...data.map(o => parseInt(o.id.slice(1))))
    //     let idp = 'p'+ zeroPad(max + 1, 18)
    //     const prestam: Prestamo = {
    //       id: idp, monto: this.selectedAmount, cliente: this.selectedClient, vendedor: this.selectedSeller,
    //       abono: this.tipoMonto == 'Abono', fecha: Timestamp.fromDate(this.selectedFecha)
    //     }
    //     // this.service.storeCredit(prestam).then((res)=>{
    //     //   this.loading = false
    //     //   //this.onSelected(this.selectedSeller)
    //     // }).catch(err => {
    //     //   this.loading = false
    //     //   console.log(err)
    //     // })
    //     this.loading = false
    //     console.log(prestam)
    //  })
    const prestam: Prestamo = {
      id: this.editando ? this.currentId : this.nextId, monto: this.selectedAmount, cliente: this.selectedClient, vendedor: this.selectedSeller,
      abono: this.tipoMonto == 'Abono', fecha: Timestamp.fromDate(this.selectedFecha), lugar: this.lugarAdd,
      nombreLugar: this.nombreLugar, nombreCliente: this.nombreCliente, descripcionCliente: this.descripcionCliente,
      nombreVendedor: this.nombreVendedor
    }
    this.service.storeCredit(prestam).then((res)=>{
      this.loading = false
      this.onSelected(this.selectedSeller)
    }).catch(err => {
      this.loading = false
      console.log(err)
    })
  }

  editData(prest: Prestamo){
    this.editando = true;
    this.selectedAmount = prest.monto;
    this.selectedClient = prest.cliente;
    this.selectedSeller = prest.vendedor;
    this.selectedFecha = prest.fecha.toDate();
    this.currentId = prest.id;
    this.tipoMonto = prest.abono ? 'Abono': 'Credito';
    this.onFilter(prest.vendedor);
    this.getCliente(prest.cliente);
    this.visible = true;
  }

  getTipo(data: boolean):string {
    return data? 'Abono': 'Credito'
  }

  aplicar(){
    this.onSelected(this.selectedSeller)
    this.filtrar = false
  }

  onSelected(value: string){
    this.getId()
    this.loading = true;
    this.selectedSeller = value;
    this.getNombreVendedor(value);
    this.prestamos = []
    var data = this.service.getDataBySeller(value, this.lugarId)
    data.then(j => 
      j.docs.map(l => l.data() as Cliente)
    ).then(k => {
      this.prestamos = k
      this.prestamos.forEach(p => {
        //let pres: HistoricoPrestamo = { id: p.id, nombre: p.nombre, vendedor: p.vendedor };
        this.service.getCredits(p.id).subscribe(k => {
          p.prestamos = k.sort((a, b)=> compareDates(a.fecha.toDate(), b.fecha.toDate(), a.id.substring(1), b.id.substring(1)))
        })  
      });
      this.loading = false;
    })
  }

  getNombreVendedor(cod: string){
    const vende = this.vendedores.find(v => v.id == cod);
    if(vende){
      this.nombreVendedor = vende.nombre;
    }
  }

  getCliente(cod: string){
    const cli = this.clientes.find(c => c.id == cod);
    if(cli){
      this.nombreCliente = cli.nombre;
      this.descripcionCliente = cli.descripcion;
      this.lugarAdd = cli.lugar
      this.getLugar(cli.lugar)
    }
  }

  getLugar(cod: string){
    const lug = this.lugares.find(l => l.id == cod);
    if(lug){
      this.nombreLugar = lug.nombre;
    }
  }

  selectCliente(val: string){
    this.getCliente(val);
    this.getLugar(this.lugarAdd)
  }

  confirm(prest: Prestamo){
    this.cfService.confirm({
      message: `¿Realmente desea eliminar <b> esta operacion </b> de la lista? Esto es irreversible`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'No',
      acceptLabel: 'Sí',
      accept: () => {
          this.borrar(prest.id);
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

  borrar(id: string){
    this.loading = true;
    this.service.delete(id).then((res)=>{
      this.loading = false
      this.onSelected(this.selectedSeller)
    }).catch(err => {
      this.loading = false
      console.log(err)
    })
  }
}
