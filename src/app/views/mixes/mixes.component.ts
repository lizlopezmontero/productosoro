import { Component, OnInit } from '@angular/core';
import { ConfirmEventType, ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { ProductsService } from 'src/app/services/products.service';
import { MixesService } from 'src/app/services/mixes.service';
import { es } from 'src/app/functions/locale';
import { Mezcla, MezclasProducto } from 'src/app/modelos/mezclas';
import { zeroPad } from 'src/app/functions/util';
import { MessageType } from 'src/app/enums/Message';
import { Producto } from 'src/app/modelos/producto';

@Component({
  selector: 'app-mixes',
  templateUrl: './mixes.component.html',
  styleUrls: ['./mixes.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class MixesComponent {

  mezclas: Mezcla[] = [];
  mezclasProductos: MezclasProducto[] = [];
  productos: Producto[] = [];	
  loading: boolean = false;
  selectedMezcla: Mezcla = { id: '', nombre: '', gramaje: 0 };	
  selectedMezclaProducto: MezclasProducto = { id: '', cantidad: 0, mezcla: '', producto: '' };
  nextId: string = ''
  visible: boolean = false;
  visible2: boolean = false;
  editando: boolean = false;
  selectedMixId: string = '';

  constructor(private service: MixesService, private productsService: ProductsService,
     private msjService: MessageService, private cfService: ConfirmationService,
      private config: PrimeNGConfig){
      this.config.setTranslation(es)
     }

  ngOnInit(): void {
    this.get()
    this.getMezclasProductos()
    this.getProductos()
  }

  get(){
    this.loading = true;
    this.service.getAll().pipe(
      catchError(e =>{
        return throwError(()=> e)
      })
    ).subscribe(res => {
      this.mezclas = res
      this.loading = false
    })
  }
  getProductos(){
    this.productsService.getAll().pipe(
      catchError(e =>{
        return throwError(()=> e)
      })
    ).subscribe(data => this.productos = data);
  }

  getMezclasProductos(){
    this.loading = true;
    this.service.getAllDetalles().pipe(
      catchError(e =>{
        return throwError(()=> e)
      })
    ).subscribe(res => {
      this.mezclasProductos = res
      this.loading = false
    })
  }

  imprimitMsj(msj: string, type: string, title: string){
    this.msjService.clear();
    this.msjService.add({
      severity: type, detail: msj, summary: title, life: 6000, closable: true, key: 'ts'
    })
  }

  productMix(m: Mezcla): MezclasProducto[] {
    const filtered = this.mezclasProductos.filter(f => f.mezcla == m.id);
    return filtered;
  }

  nuevo(){
    this.editando = false;
    this.selectedMezcla = { id: '', nombre: '', gramaje: 0 };
    this.visible = true
  }
  nuevo2(id: string){
    this.selectedMixId = id;
    this.editando = false;
    this.selectedMezclaProducto = { id: '', cantidad: 0, mezcla: id, producto: '' };
    this.visible2 = true
  }

  calculateMixTotal(m: Mezcla): string {
    const filtered = this.mezclasProductos.filter(f => f.mezcla == m.id);
    let total = 0
    filtered.forEach(f => {
      total += f.cantidad
    })
    return total.toLocaleString()
  }

  guardar(){
    if(this.validar()){
      this.loading = true;
      if(!this.editando){
        this.selectedMezcla.id = this.getId();
      }
      this.service.save(this.selectedMezcla).then(res => {
        this.get()
        this.imprimitMsj('Se guardo correctamente', MessageType.Success, 'Exito')
        this.visible = false
        this.loading = false
      }).catch(err => {
        console.log(err)
        this.loading = false
      })
    }
  }

  isGramajeValid(m: Mezcla, cant: number): boolean {
    const filtered = this.mezclasProductos.filter(f => f.mezcla == m.id);
    let total = 0
    filtered.forEach(f => {
      if(f.id !== this.selectedMezclaProducto.id)
        total += f.cantidad
    });
    console.log('Total actual:', total, ' Cantidad nueva:', cant, ' Gramaje maximo:', m.gramaje);
    return total + cant <= m.gramaje;
  }

  guardar2(){
    if(this.validar2()){
      const currentMix = this.mezclas.find(f => f.id == this.selectedMezclaProducto.mezcla);
      if(currentMix){
        if(!this.isGramajeValid(currentMix, this.selectedMezclaProducto.cantidad)){
          this.imprimitMsj('El gramaje supera el maximo permitido', MessageType.Error, 'Error');
          return;
        }
      }
      
      this.loading = true;
      if(!this.editando){
        this.selectedMezclaProducto.id = this.getIdMezclaProd();
      }
      this.service.saveDetalles(this.selectedMezclaProducto).then(res => {
        this.get();
        this.getMezclasProductos();
        this.imprimitMsj('Se guardo correctamente', MessageType.Success, 'Exito')
        this.visible2 = false
        this.loading = false
      }).catch(err => {
        console.log(err)
        this.loading = false
      })
    }
  }
  validar(): boolean {
    if(this.selectedMezcla.nombre && this.selectedMezcla.gramaje)
      return true
    return false
  }
  validar2(): boolean {
    if(this.selectedMezclaProducto.producto && this.selectedMezclaProducto.cantidad && this.selectedMezclaProducto.mezcla)
      return true
    return false
  }

  getId(){
    const max = Math.max(...this.mezclas.map(o => parseInt(o.id.slice(1))));
    this.nextId = 'A'+ zeroPad(max + 1, 3)
    return this.nextId;
  }

  getIdMezclaProd(){
    this.visible = false
    this.loading = true
    const date = Date.now();
    return (date % 2 == 0 ? 'P' : 'I') + date;
  }

  editData(prest: Mezcla){
    this.editando = true;
    this.selectedMezcla = prest;
    this.visible = true;
  }
  editData2(prest: MezclasProducto, idMezcla: string){
    this.editando = true;
    this.selectedMixId = idMezcla;
    this.selectedMezclaProducto = prest;
    this.selectedMezclaProducto.mezcla = idMezcla;
    this.visible2 = true;
  }


  confirm(prest: Mezcla | MezclasProducto, tipo: number){
    this.cfService.confirm({
      message: `¿Realmente desea eliminar <b> esta operacion </b> de la lista? Esto es irreversible`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'No',
      acceptLabel: 'Sí',
      accept: () => {
        if(tipo == 0)
          this.borrar(prest.id);
        else
          this.borrar2(prest.id);
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
    var mezclasProd = this.mezclasProductos.filter(m => m.mezcla == id);
    this.service.delete(id, mezclasProd).then((res)=>{
      this.loading = false;
      this.get();
      this.getMezclasProductos();
    }).catch(err => {
      this.loading = false
      console.log(err)
    })
  }
  borrar2(id: string){
    this.loading = true;
    this.service.deleteDellates(id).then((res)=>{
      this.loading = false;
      this.get();
      this.getMezclasProductos();
    }).catch(err => {
      this.loading = false
      console.log(err)
    })
  }
  getProductInfo(id: string){
    const prod = this.productos.find(p => p.id == id);
    if(prod){
      return prod.descripcion
    }
    return id;
  }
  hide(){
    this.visible = false;
    this.get();
  }

  hide2(){
    this.visible2 = false;
    this.getMezclasProductos();
  }
}
