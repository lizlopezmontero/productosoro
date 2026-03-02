import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService, ConfirmEventType } from 'primeng/api';
import { Subscription, catchError, throwError } from 'rxjs';
import { MessageType } from 'src/app/enums/Message';
import { Producto, Categoria } from 'src/app/modelos/producto';
import { GeneralService } from 'src/app/services/general.service';
import { ProductsService } from 'src/app/services/products.service';

@Component({
  selector: 'app-raw-material',
  templateUrl: './raw-material.component.html',
  styleUrls: ['./raw-material.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class RawMaterialComponent {
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
  existencias: number = 0;
  precioCosto: number | null = null;
  cantidadCosto: number | null = null;
  costoFijo: number = 50;
  orden: number = 0;
  idBolsa: string | null = null;
  idEtiqueta: string | null = null;
  cantidadBolsas: number | null = null;
  cantidadEtiquetas: number | null = null;
  
  form = this.buildForm();
  isMobile = false;
  filtrar: boolean = false;

  private subscriptions: Subscription[] = [];
  constructor(private breakpointObserver: BreakpointObserver, private serviceGeneral: GeneralService,
              private formBuilder: FormBuilder, private serviceProducto: ProductsService,
              private msjService: MessageService, private cfService: ConfirmationService) { }

  ngOnInit(): void {
    this.getVariable();
    this.getCategorias();
    this.getAll();
      this.subscriptions.push(this.breakpointObserver.observe([
          Breakpoints.XSmall,
          Breakpoints.Small,
          Breakpoints.Handset
      ]).subscribe(result => this.isMobile = result.matches));
      this.form = this.buildForm();
  }

  getCantidad(vende: string, cant: number | null): string{
    if(!cant) return '';
    return vende == 'Peso'? cant.toLocaleString() + ' gramos' : cant.toLocaleString() + (cant === 1 ? ' unidad': ' unidades')
  }

  ngOnDestroy(): void {
      this.subscriptions.forEach(subscription => subscription.unsubscribe());
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
    this.idBolsa = l.idBolsa ?? null;
    this.idEtiqueta = l.idEtiqueta ?? null;
    this.cantidadBolsas = l.cantidadBolsas ?? null;
    this.cantidadEtiquetas = l.cantidadEtiquetas ?? null;
    this.orden = l.orden;
    this.editando = true;
    this.visible = true;
  }


  currentProducto(): Producto{

    var prod: Producto = {
      id: this.form?.get('id')?.value,
      descripcion: this.form?.get('desc')?.value,
      seVendeComo: this.seVendeComo,
      cantidad:  this.cantidad,
      precioVenta: this.precioVenta,
      categoria: this.selectedCategoria,
      precioCosto: this.precioCosto,
      existencias: this.existencias,
      cantidadCosto: this.cantidadCosto,
      orden: this.orden,
    }

    if(this.idBolsa){
      prod.idBolsa = this.idBolsa
    }
    if(this.idEtiqueta){
      prod.idEtiqueta = this.idEtiqueta
    }
    if(this.cantidadBolsas){
      prod.cantidadBolsas = this.cantidadBolsas
    }
    if(this.cantidadEtiquetas){
      prod.cantidadEtiquetas = this.cantidadEtiquetas
    }
    return prod;
  }

  costoXKilo(p: Producto): string{
    if(!p.cantidadCosto || !p.precioCosto){
      return ''
    }
    const total = (p.precioCosto / p.cantidadCosto) * 1000;
    return p.seVendeComo == 'Peso' ? total.toLocaleString(undefined, {maximumFractionDigits: 2}) : '------';
  }

  costoUnitario(p: Producto): string{
    if(!p.cantidadCosto || !p.precioCosto){
      return ''
    }
    const total = (p.precioCosto / (p.cantidadCosto / p.cantidad)) + this.costoFijo;
    return total.toLocaleString(undefined, {maximumFractionDigits: 2});
  }

  postVariable(){
    if(isNaN(this.costoFijo) || this.costoFijo === undefined){
      return
    }
    const vari = {id: 'v01', desc: 'Otros gastos', valor: ''+this.costoFijo}
    this.serviceGeneral.saveVariable(vari).then((_)=> { 
      this.getVariable();
      this.getAll();
       this.imprimitMsj('Nuevo valor guardado', MessageType.Success, 'Exito al guardar') }).
       catch(e => console.log(e))
  }

  getVariable(){
    this.serviceGeneral.getVariable('v01').pipe(
      catchError(e =>{
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      if(data.length > 0){
        const costoFijo = data[0].valor
        if(!Number.isNaN(costoFijo)){
          this.costoFijo = parseFloat(costoFijo)
        }
      }
     })
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

  guardar(){
    const place = this.currentProducto();
    if (this.form?.invalid) {
      this.form?.markAllAsTouched();
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
      this.existencias = 0
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
