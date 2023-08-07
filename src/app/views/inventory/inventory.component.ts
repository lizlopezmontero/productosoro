import { Component, OnInit, HostListener } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Observable, catchError, throwError } from 'rxjs';
import { MessageType } from 'src/app/enums/Message';
import { Producto } from 'src/app/modelos/producto';
import { ProductsService } from 'src/app/services/products.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
  providers: [MessageService]
})
export class InventoryComponent implements OnInit {
  productos: Producto[] = [];
  loading: boolean = false;
  pendantChanges: boolean = false;


  constructor(private serviceProducto: ProductsService,
    private msjService: MessageService){}

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
      this.loading = false
     })
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
    this.serviceProducto.updateAll(this.productos).then(_ => {
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
}
