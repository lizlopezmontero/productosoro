import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService, ConfirmEventType } from 'primeng/api';
import { Subscription, catchError, throwError } from 'rxjs';
import { MessageType } from 'src/app/enums/Message';
import { Categoria, Producto } from 'src/app/modelos/producto';
import { ProductsService } from 'src/app/services/products.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class ProductComponent {
  productos: Producto[] = [];
  loading: boolean = false;
  visible: boolean = false;
  editando:boolean = false;
  categorias: Categoria[] = [];
  vendeComo: string[] = ['Peso','Cantidad'];
  seVendeComo: string = 'Peso';
  cantidad: number = 1;
  precioVenta: number = 0;
  selectedCategoria: string = 'Maní';
  existencias: number = 1;
  precioCosto: number | null = null;
  cantidadCosto: number | null = null;
  orden: number = 0;

  
  form = this.buildForm();
  isMobile = false;
  filtrar: boolean = false;

  private subscriptions: Subscription[] = [];
  constructor(private breakpointObserver: BreakpointObserver,
              private formBuilder: FormBuilder, private serviceProducto: ProductsService,
              private msjService: MessageService, private cfService: ConfirmationService) { }

  ngOnInit(): void {
    this.getCategorias();
    this.getAll();
      this.subscriptions.push(this.breakpointObserver.observe([
          Breakpoints.XSmall,
          Breakpoints.Small,
          Breakpoints.Handset
      ]).subscribe(result => this.isMobile = result.matches));
      this.form = this.buildForm();
  }

  getCantidad(vende: string, cant: number): string{
    return vende == 'Peso'? cant.toLocaleString() + ' gramos' : cant.toLocaleString() + (cant === 1 ? ' unidad': ' unidades')
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
    this.seVendeComo = 'Peso';
    this.cantidad = 1;
    this.precioVenta = 1500;
    this.selectedCategoria = 'Maní';
    this.existencias = 1;
    this.precioCosto = null
    this.editando = false;
    this.visible = true;
    this.orden = this.getNextOrden();
  }

  onChangeCategoria(val: string){
    this.form?.get('id')?.setValue(this.getNextId(val));
  }

  editar(l: Producto){
    this.form?.get('id')?.setValue(l.id);
    this.form?.get('desc')?.setValue(l.descripcion);
    this.existencias = l.existencias ?? 0;
    this.seVendeComo = l.seVendeComo;
    this.cantidad = l.cantidad;
    this.precioVenta = l.precioVenta;
    this.selectedCategoria = l.categoria;
    this.precioCosto = l.precioCosto;
    this.cantidadCosto = l.cantidadCosto;
    this.orden = l.orden;
    this.editando = true;
    this.visible = true;
  }


  currentProducto(): Producto{
    return {
      id: this.form?.get('id')?.value,
      descripcion: this.form?.get('desc')?.value,
      seVendeComo: this.seVendeComo,
      cantidad:  this.cantidad,
      precioVenta: this.precioVenta,
      categoria: this.selectedCategoria,
      precioCosto: this.precioCosto,
      existencias: this.existencias,
      cantidadCosto: this.cantidadCosto,
      orden: this.orden
    }
  }

  getNextOrden(): number{
    const max = Math.max(...this.productos.map(p => p.orden));
    return max + 1;
  }

  getNextId(cat: string = 'Maní') : string{
    const filteredData = this.productos.filter(f => f.categoria === cat);
    let nId = 1;
    if(filteredData.length > 0){
      const ids = filteredData.map(j => parseInt(j.id.substring(1)));
      const max = Math.max(...ids);
      nId = max + 1;
    }
    const id = nId > 99 ? ''+nId: (nId > 9 ? '0'+nId:'00'+nId);
    return cat.charAt(0) + id
  }

  getCategorias(){
    this.serviceProducto.getCategorias().pipe(
      catchError(e =>{
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      this.categorias = data
     })
  }

  getAll(){
    this.loading = true
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

  isRepeated(product: Producto): boolean{
    if(!this.editando){
      const selected = this.productos.find(l => l.id == product.id);
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
      this.imprimitMsj("Ya existe un producto con ese codigo", MessageType.Error, "Error");
      return;
    }
    if(!this.precioVenta){
      this.imprimitMsj("Debe seleccionar un precio de venta", MessageType.Error, "Error");
      return
    }
    if(!this.cantidad){
      this.imprimitMsj("Debe seleccionar una cantidad", MessageType.Error, "Error");
      return
    }
    if(!this.existencias){
      this.imprimitMsj("Debe seleccionar una cantidad de existencias inicial", MessageType.Error, "Error");
      return
    }
    this.loading = true;
    this.visible = false;
    this.serviceProducto.save(place).then(t => {
      this.getAll();
      this.imprimitMsj(this.editando ? 'Producto editado con éxito': 'Producto agregado con éxito', MessageType.Success, 'Mensaje');
    }).catch(err => {this.loading = false; console.log(err) })
    
  }

  imprimitMsj(msj: string, type: string, title: string){
    this.msjService.clear();
    this.msjService.add({
      severity: type, detail: msj, summary: title, life: 6000, closable: true, key: 'ts'
    })
  }

  confirm(producto: Producto){
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
        this.serviceProducto.delete(id).then(t => {
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
