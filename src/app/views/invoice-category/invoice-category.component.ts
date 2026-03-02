import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService, ConfirmEventType } from 'primeng/api';
import { Subscription, catchError, throwError } from 'rxjs';
import { MessageType } from 'src/app/enums/Message';
import { CategoriaFacturacion } from 'src/app/modelos/categoria-facturacion';
import { Producto } from 'src/app/modelos/producto';
import { InvoiceCategoryService } from 'src/app/services/invoice-category.service';
import { ProductsService } from 'src/app/services/products.service';

@Component({
  selector: 'app-invoice-category',
  templateUrl: './invoice-category.component.html',
  styleUrls: ['./invoice-category.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class InvoiceCategoryComponent implements OnInit, OnDestroy{
  categoriasFactura: CategoriaFacturacion[] = [];
  loading: boolean = false;
  visible: boolean = false;
  editando:boolean = false;
  catFacturacion: CategoriaFacturacion = { id: '', descripcion: '', categoria: '', orden: 0 };
  listas: string[] = [];
  productos: Producto[] = [];
  
  form = this.buildForm();
  isMobile = false;
  send: boolean = false;

  private subscriptions: Subscription[] = [];
  constructor(private breakpointObserver: BreakpointObserver, private productosService: ProductsService,
              private formBuilder: FormBuilder, private service: InvoiceCategoryService,
              private msjService: MessageService, private cfService: ConfirmationService) { }

  ngOnInit(): void {
    this.getProductos();
    this.getAll();
      this.subscriptions.push(this.breakpointObserver.observe([
          Breakpoints.XSmall,
          Breakpoints.Small,
          Breakpoints.Handset
      ]).subscribe(result => this.isMobile = result.matches));
      this.form = this.buildForm();
  }

  getProductos(){
    this.productosService.getAll().pipe(
      catchError(e =>{
        this.loading = false
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      this.productos = data
      this.loading = false
     })
  }
  ngOnDestroy(): void {
      this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  nuevo(){
    this.catFacturacion = { id: '', descripcion: '', categoria: '', orden: 0 };
    this.editando = false;
    this.visible = true;
  }

  seleccionarProducto(p: string){
    const prod = this.productos.find(pr => pr.id == p);
    if(prod){
      this.catFacturacion.descripcion = prod.descripcion;
      this.catFacturacion.orden = prod.orden;
    }
  }

  editar(l: CategoriaFacturacion){
    this.catFacturacion = l;
    this.seleccionarProducto(l.categoria);
    this.editando = true;
    this.visible = true;
  }

  currentCategory(): CategoriaFacturacion{
    return this.catFacturacion;
  }

  getAll(){
    this.loading = true
    this.service.getAll().pipe(
      catchError(e =>{
        this.loading = false
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      this.categoriasFactura = data
      const elements = this.categoriasFactura.map(c => c.categoria)
      this.listas = elements.filter(this.onlyUnique);
      this.loading = false
     })
  }

  onlyUnique(value: string, index : number, array : string[]) {
    return array.indexOf(value) === index;
  }

  isRepeated(place: CategoriaFacturacion): boolean{
    if(!this.editando){
      const selected = this.categoriasFactura.find(l => l.id == place.id);
      if(selected){
        return true;
      }
    }
    return false;
  }

  guardar(){
    const place = this.currentCategory();
    this.send = true;
    if(this.isRepeated(place)){
      this.imprimitMsj("Ya existe ese registro", MessageType.Error, "Error");
      return;
    }
    if(this.isValid()){
      this.loading = true;
      this.visible = false;
      this.service.save(place).then(t => {
        this.getAll();
        this.imprimitMsj(this.editando ? 'Lugar editado con éxito': 'Lugar agregado con éxito', MessageType.Success, 'Mensaje');
      }).catch(err => {this.loading = false; console.log(err) })
    }
  }

  isValid(): boolean{
    return this.catFacturacion.id != '' && this.catFacturacion.descripcion != '' && this.catFacturacion.categoria != '' && this.catFacturacion.orden != 0;
  }

  imprimitMsj(msj: string, type: string, title: string){
    this.msjService.clear();
    this.msjService.add({
      severity: type, detail: msj, summary: title, life: 6000, closable: true, key: 'ts'
    })
  }

  confirm(catFact: CategoriaFacturacion){
    const place = catFact.descripcion;
    this.cfService.confirm({
      message: `¿Realmente desea eliminar a <b> ${place} </b> de la lista?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'No',
      acceptLabel: 'Sí',
      accept: () => {
          this.borrar(catFact.id);
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
    this.service.detete(id).then(t => {
      this.getAll();
      this.imprimitMsj('Elemento eliminado de la lista', MessageType.Success, 'Mensaje');
    }).catch(err => {this.loading = false; console.log(err) })
  }

  resetValue(fieldControlName: string): void {
    this.form?.get(fieldControlName)?.reset(null);
  }

  private buildForm(): FormGroup {
      return this.formBuilder.group({
          id: [ null],
          desc: [ null],
          cat: [ null],
          orden: [ null]
      });
  }
}
