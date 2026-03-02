import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';
import { Lugar } from 'src/app/modelos/lugar';
import { Vendedor } from 'src/app/modelos/vendedor';
import { InvoiceCategoryService } from 'src/app/services/invoice-category.service';
import { InvoiceService } from 'src/app/services/invoice.service';
import { es } from 'src/app/functions/locale';
import { Facturacion } from 'src/app/modelos/facturacion';
import { catchError, throwError } from 'rxjs';
import { CategoriaFacturacion } from 'src/app/modelos/categoria-facturacion';
import { getMesDelAno, getDiaSemana } from 'src/app/functions/listas';
import { MessageType } from 'src/app/enums/Message';
import { compareDatesSimple } from 'src/app/functions/util';
import { CreditService } from 'src/app/services/credit.service';
import { PlacesService } from 'src/app/services/places.service';
import { TaxInvoice } from 'src/app/modelos/producto';

@Component({
  selector: 'app-tax-report',
  templateUrl: './tax-report.component.html',
  styleUrls: ['./tax-report.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class TaxReportComponent implements OnInit {

  vendedores: Vendedor[] =[];
  lugares: Lugar[] = [];
  lugarNombre: string = '';
  vendedor: string = 'v01';
  tipoCambioActual: number = 500;
  tipoCambio: number = 500;
  fecha: Date;
  lugar: string = '';
  fechaFilter: Date;
  vendedorFilter: string = 'v01';
  lugarFilter: string = '';
  allData: Facturacion[] = [];
  facturas: Facturacion[] = [];
  loading: boolean = false;
  fechas: Date[] = [];
  categorias: CategoriaFacturacion[] = [];
  visible2: boolean = false;
  lista: string[] = [];
  vendedoresSelected: string[] = ['v01'];
  vendedoresFilterSelected: string[] = ['v01'];

  ngOnInit(): void {
    this.getVendedores();
    this.getLugares();
    this.getNextInvoce();
    this.getCategories();
  }

  constructor(private service: InvoiceService, private catService: InvoiceCategoryService, private config: PrimeNGConfig,private message: MessageService,
     private cfService: ConfirmationService, private cService: CreditService, private lService: PlacesService){
    const date = new Date();
    date.setHours(0,0,0,0);
    this.config.setTranslation(es);
    this.fecha = date;
    this.fechaFilter = date;
  }

  getVendedores(){
    this.cService.getSellers().pipe(
      catchError(e =>{
        return throwError(()=> e)
      })
    ).subscribe(data => this.vendedores = data);
  }

  getLugares(){
    this.lService.getAll().pipe(
      catchError(e =>{
        return throwError(()=> e)
      })
    ).subscribe(data => this.lugares = data);
  }

  selectedLugar(val: string){
    const lug = this.lugares.find(l => l.id == val);
    if(lug){
      this.lugarNombre = lug.nombre;
    }
  }

  getNextInvoce(){
    this.service.allInvoices().pipe(
      catchError(e =>{
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      if(data.length > 0){
        this.allData = data;
        console.log(data);
      }
    })
  }
  getCategories(){
    this.catService.getAll().pipe(
      catchError(e =>{
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      this.categorias = data
      const elements = data.map(c => c.categoria)
      this.lista = elements.filter(this.onlyUnique);
      console.log(data);
    })
  }
  onlyUnique(value: string, index : number, array : string[]) {
    return array.indexOf(value) === index;
  }
  getAll(){
    if(!this.lugar){
      this.imprimitMsj("Debe seleccionar un lugar", MessageType.Warn, "");
      return;
    }
    this.service.getAllMultipleSellers(this.fecha, this.lugar, this.vendedoresSelected).pipe(
      catchError(e =>{
        this.loading = false;
        return throwError(()=> e)
      })
    ).subscribe(data =>{
      console.log(data);
      this.loading = false;
      this.facturas = data
      //this.facturas = data
    })
  }

  getInvoicesByCategory(category: string): Facturacion[]{
    return this.facturas.filter(f => f.categoriaFacturacion == category);
  }

  getTaxesByCategory(category: string): TaxInvoice[]{
    const taxes = this.facturas.filter(f => f.categoriaFacturacion == category);
    const uniqueProducts = taxes.map(t => t.codigoProducto).filter((value, index, self) => self.indexOf(value) === index);
    let taxesByCategory: TaxInvoice[] = [];
    uniqueProducts.forEach(p =>{
      const taxesByProduct = taxes.filter(t => t.codigoProducto == p);
      let totalTax: number = 0;
      taxesByProduct.forEach(t =>{
        totalTax += (t.ingreso - t.devolucion);
      })
      taxesByCategory.push({
        id: p,
        descripcion: taxesByProduct[0].descripcionProducto,
        categoria: category,
        monto: totalTax
      })
    })
    return taxesByCategory;
  }

  getSubtotalByCategory(category: string): number{
    const taxes = this.facturas.filter(f => f.categoriaFacturacion == category);
    let totalTax: number = 0;
    taxes.forEach(t =>{
      totalTax += (t.ingreso - t.devolucion);
    })
    return totalTax;
  }

  getFecha(date: Date){
    if(date){
      return getDiaSemana(date.getDay()) + date.getDate() + ' de ' + getMesDelAno(date.getMonth()) + ', '+date.getFullYear();
    }
    return '';
  }

  selectLugar(val:string){
    this.fechas = [];
    const fechasReps = this.allData.filter(d => d.lugar == val).map(g => g.fecha.toDate());
    for(let i = 0, size = fechasReps.length; i < size; i++){
      if(!this.fechas.some(f => f.getDay() === fechasReps[i].getDay() && f.getMonth() === fechasReps[i].getMonth() && f.getFullYear() === fechasReps[i].getFullYear())){
        this.fechas.push(fechasReps[i])
      }
    }
    this.fechas = this.fechas.sort((a,b) => compareDatesSimple(a,b));
  }

  apply(){
    if(!this.lugarFilter){
      this.imprimitMsj("Seleccionar un lugar primero", MessageType.Warn, "Aviso")
      return
    }
    if(!this.fechaFilter){
      this.imprimitMsj("Seleccionar una fecha", MessageType.Warn, "Aviso")
      return
    }
    this.vendedoresSelected = this.vendedoresFilterSelected;
    this.lugar = this.lugarFilter;
    this.fecha = this.fechaFilter;
    this.visible2 = false;
    this.getAll();
  }

  imprimitMsj(msj: string, type: string, title: string){
    this.message.clear();
    this.message.add({
      severity: type, detail: msj, summary: title, life: 6000, closable: true, key: 'ts'
    })
  }
}
