import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Observable, catchError, throwError } from 'rxjs';
import { MessageType } from 'src/app/enums/Message';
import { ProductoSimulado } from 'src/app/modelos/producto-simulado';
import { ProductsService } from 'src/app/services/products.service';

@Component({
  selector: 'app-simulated-order',
  templateUrl: './simulated-order.component.html',
  styleUrls: ['./simulated-order.component.scss'],
  providers: [MessageService]
})
export class SimulatedOrderComponent {
  productos: ProductoSimulado[] = [];
  loading: boolean = false;
  pendantChanges: boolean = false;
  w: number;

  constructor(private serviceProducto: ProductsService,
    private msjService: MessageService, private route: Router){ this.w = window.innerWidth; }

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
      this.productos = data.map(p => {return {id: p.id, descripcion: p.descripcion, existencias: 0}});
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
    window.sessionStorage.setItem('inventario', JSON.stringify(this.productos));
    this.route.navigate(['/app/pedidos','1'])

  }

  imprimitMsj(msj: string, type: string, title: string){
    this.msjService.clear();
    this.msjService.add({
      severity: type, detail: msj, summary: title, life: 6000, closable: true, key: 'ts'
    })
  }

}
