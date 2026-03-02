import { Component, OnInit } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageType } from 'src/app/enums/Message';
import { Calculadora } from 'src/app/modelos/calculadora';
import { Producto } from 'src/app/modelos/producto';
import { ProductsService } from 'src/app/services/products.service';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class CalculatorComponent implements OnInit{

  constructor(private service: ProductsService, private message: MessageService){ this.w = window.innerWidth; }

  productos: Producto[] = [];
  producto: Producto | undefined;
  cantidad: number | undefined;
  data: Calculadora [] = [];
  loading: boolean = false;
  w: number;
  
  ngOnInit(): void {
    this.service.getAll().pipe(
      catchError(e =>{
        return throwError(()=> e)
      })
    ).subscribe(data => {
      this.productos = data;
    });
  }

  containsElement(calc: Calculadora): number{
    for (let index = 0, size = this.data.length; index < size; index++) {
      const element = this.data[index];
      if(element.producto.id == calc.producto.id) return index;
    }
    return -1;
  }

  agregarProducto(){
    if(this.producto){
      if(this.cantidad){
        const element = {producto: this.producto!, cantidad: this.cantidad!, editando: false};
        const index = this.containsElement(element);
        if(index < 0){
          this.data.push(element);
        }else{
          this.data[index].cantidad += this.cantidad;
        }
        this.producto = undefined;
        this.cantidad = undefined;
      }else{
        this.imprimitMsj("Coloque una cantidad valida", MessageType.Warn, "Error al agregar");
      }
    }else{
      this.imprimitMsj("Seleccione un producto de la lista", MessageType.Warn, "Error al agregar");
    }
  }

  del(index: number){
    this.data.splice(index, 1);
  }

  totalCantidad(): string{
    return this.data.reduce((acc, obj) => acc + obj.cantidad, 0).toLocaleString();
  }

  ventaTotal(): string{
    const sum = this.data.reduce((acc, obj)=>  acc + ((obj.producto.precioVenta * obj.cantidad) / obj.producto.cantidad), 0);
    return sum.toLocaleString();
  }

  compraTotal(): string{
    const sum = this.data.reduce((acc, obj)=>  acc + (((obj.producto.precioCosto ?? 0) * obj.cantidad ) / (obj.producto.cantidadCosto ?? 1)), 0);
    return sum.toLocaleString();
  }

  gananciaTotal(): string{
    const venta = this.data.reduce((acc, obj)=>  acc + ((obj.producto.precioVenta * obj.cantidad) / obj.producto.cantidad), 0);
    const compra = this.data.reduce((acc, obj)=>  acc + (((obj.producto.precioCosto ?? 0) * obj.cantidad ) / (obj.producto.cantidadCosto ?? 1)), 0);
    return (venta - compra).toLocaleString();
  }

  imprimitMsj(msj: string, type: string, title: string){
    this.message.clear();
    this.message.add({
      severity: type, detail: msj, summary: title, life: 6000, closable: true, key: 'ts'
    })
  }

}
