import { Component, OnInit } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageType } from 'src/app/enums/Message';
import { Mezcla, MezclasProducto } from 'src/app/modelos/mezclas';
import { Producto } from 'src/app/modelos/producto';
import { MixesService } from 'src/app/services/mixes.service';
import { ProductsService } from 'src/app/services/products.service';

@Component({
  selector: 'app-mix-calculator',
  templateUrl: './mix-calculator.component.html',
  styleUrls: ['./mix-calculator.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class MixCalculatorComponent implements OnInit {
  productos: Producto[] = [];
  producto: string | undefined;
  cantidad: number | undefined;
  gramaje: number | undefined;
  data: Mezcla [] = [];
  productosMezcla: MezclasProducto[] = [];
  loading: boolean = false;
  w: number;
  constructor(private message: MessageService, private confirmationService: ConfirmationService, private service: MixesService, private productsService: ProductsService){ this.w = window.innerWidth; }
  ngOnInit(): void {
    this.getProductos();
    this.getMezclas();
  }
  getProductos(){
    this.loading = true;
    this.productsService.getAll().pipe(
      catchError(e =>{
        this.loading = false;
        return throwError(()=> e)
      })
    ).subscribe(data => {
      this.loading = false;
      this.productos = data;
    });
  }
  getMezclas(){
    this.loading = true;
    this.service.getAll().pipe(
      catchError(e =>{
        this.loading = false;
        return throwError(()=> e)
      })
    ).subscribe(data => {
      this.loading = false;
      this.data = data;
    });
  }
  getProductInfo(id: string){
    const prod = this.productos.find(p => p.id == id);
    if(prod){
      return prod.descripcion
    }
    return id;
  }
  get(id: string){
    this.loading = true;
    this.service.get(id).pipe(
      catchError(e =>{
        this.loading = false;
        return throwError(()=> e)
      })
    ).subscribe(data => {
      this.loading = false;
      if(this.gramaje && this.cantidad){
        this.productosMezcla = data.map(d => { return {id: d.id, producto: d.producto, mezcla: d.mezcla, cantidad: d.cantidad * ( (this.cantidad! * 1000) / this.gramaje! )} });
      }else
        this.productosMezcla = data;
    });
  }
  calcular(){
    if(this.producto && this.gramaje && this.cantidad){
      this.get(this.producto);
    }
  }
  changeProducto(value: any){
    const prod = this.data.find(d => d.id == value);
    if(prod){
      this.gramaje = prod.gramaje;
    }
  }
  total(): string{
    return this.productosMezcla.reduce((acc, obj) => acc + obj.cantidad, 0).toLocaleString() + ' gramos';
  }
}
