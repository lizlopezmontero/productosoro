import { Component, OnInit, HostListener } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { MessageService } from 'primeng/api';
import { Observable, catchError, throwError } from 'rxjs';
import { MessageType } from 'src/app/enums/Message';
import { HistoricoInventario } from 'src/app/modelos/historico-inventario';
import { Producto } from 'src/app/modelos/producto';
import { InventoryHistoryService } from 'src/app/services/inventory-history.service';
import { ProductsService } from 'src/app/services/products.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
  providers: [MessageService]
})
export class InventoryComponent implements OnInit {
  productos: Producto[] = [];
  productoViejos: Producto[] = [];
  loading: boolean = false;
  pendantChanges: boolean = false;
  w: number;
  historico: HistoricoInventario = {id: '', descProducto: '', codProducto: '', cantidadAnterior: 0, cantidadNueva: 0, fecha: Timestamp.fromDate(new Date())};
  showHistorico: boolean = false;

  constructor(private serviceProducto: ProductsService,
    private msjService: MessageService, private historyService: InventoryHistoryService){ this.w = window.innerWidth; }

  ngOnInit(): void {
    this.get();
  }

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    return !this.pendantChanges
  }

  get() {
    this.loading = true;
    this.pendantChanges = false;
    this.serviceProducto.getAll().pipe(
      catchError(e =>{
        this.loading = false
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      this.productos = data
      this.productoViejos = JSON.parse(JSON.stringify(data))
      this.loading = false
     })
  }

  onShowData(event: Event, id: string){
    event.preventDefault();
    this.loading = true;
    this.historyService.obtenerPorProducto(id).pipe(
      catchError(e =>{
        this.loading = false
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      this.loading = false
      console.log(data)
      if(data.length > 0){
        this.historico = data[0];
        this.showHistorico = true;
      }else{
        this.showHistorico = false;
      }
     })
  }

  convertFecha(ts: Timestamp): string{
   const date = ts.toDate().toLocaleDateString('en-GB');
   const time = ts.toDate().toLocaleTimeString('en-GB')
   return date + ' '+ time;
  }

  presionar(){
    this.pendantChanges = true;
  }

  guardar(){
    for(let i = 0, size = this.productos.length; i< size; i++){
      const ex = this.productos[i].existencias;
      if(ex == null || ex == undefined || isNaN(ex)){
        this.imprimitMsj("El producto <b>"+ this.productos[i].descripcion +" </b> no tiene existencias definidas",
        MessageType.Error, "Error");
        return;
      }
    }
    this.serviceProducto.updateAll(this.productos, this.productoViejos).then(_ => {
      this.get();
      this.imprimitMsj("Cambios guardados con éxito", MessageType.Success, "");
    }).catch(err => console.log(err));
  }

  imprimitMsj(msj: string, type: string, title: string){
    this.msjService.clear();
    this.msjService.add({
      severity: type, detail: msj, summary: title, life: 6000, closable: true, key: 'ts'
    })
  }

  subtotales(cat: string): string{
    if(cat === '') return this.productos.reduce((acc, o)=> acc + (o.existencias ?? 0), 0).toLocaleString();
    return this.productos.filter(p => p.categoria == cat).reduce((acc, o)=> acc + (o.existencias ?? 0), 0).toLocaleString();
  }

  costoTotal(): string{
    return this.productos.reduce((acc, o)=> acc + (((o.precioCosto ?? 0)/(o.cantidadCosto ?? 1) * o.cantidad) * (o.existencias ?? 0)), 0).toLocaleString();
  }
}
