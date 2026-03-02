import { Component, OnInit } from '@angular/core';
import { MenuItem, MessageService, PrimeNGConfig } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { es } from 'src/app/functions/locale';
import { ReportService } from 'src/app/services/report.service';
import { MessageType } from 'src/app/enums/Message';
import { Lugar } from 'src/app/modelos/lugar';
import { PlacesService } from 'src/app/services/places.service';
import { EstadoResultados } from 'src/app/modelos/EstadoResultados';
import { ChartData } from 'chart.js';
import { Chart } from 'chart.js/auto';
import { Facturacion } from 'src/app/modelos/facturacion';
import  ChartDataLabels from 'chartjs-plugin-datalabels';
import { Categoria } from 'src/app/modelos/producto';

@Component({
  selector: 'app-sells-by-products',
  templateUrl: './sells-by-products.component.html',
  styleUrls: ['./sells-by-products.component.scss'],
  providers: [ MessageService ]
})
export class SellsByProductsComponent implements OnInit{
  fechas: Date[] = [];
  lugares: Lugar[] = [];
  categorias: Categoria[] =[];
  loading: boolean = false;
  lugaresSelected: string[] = [];
  dataPlaces: ChartData<'pie', {key: string, value: number}> = { datasets:[] }
  documentStyle: CSSStyleDeclaration;
  dataLoaded: boolean = false;
  facturacion: Facturacion[] =[];
  backColors: string[];
  chartLugares: any;
  chartCategorias: any;
  chartProductos: any;
  nivel: number = 1;
  soloTotales: boolean = false;
  verTotales: boolean = false;
  ventas: boolean = false;
  verVentas: boolean = false;
  currentCategoria: string = '';
  currentLugar: string = '';
  items: MenuItem[] = [];
  dataFour: EstadoResultados[] = [];
  totalDataFour: number = 0;
  home: MenuItem = {icon: 'pi pi-arrow-left', command: ()=> this.backToPreviousLevel() }

  constructor(private service: ReportService, private lService: PlacesService, private config: PrimeNGConfig,
    private msjService: MessageService){
      this.config.setTranslation(es);
      this.documentStyle = getComputedStyle(document.documentElement);
      this.backColors = [ this.documentStyle.getPropertyValue('--yellow-400'), this.documentStyle.getPropertyValue('--cyan-400'),
        this.documentStyle.getPropertyValue('--pink-400'), this.documentStyle.getPropertyValue('--indigo-400'),
        this.documentStyle.getPropertyValue('--teal-400'), this.documentStyle.getPropertyValue('--orange-400'),
        this.documentStyle.getPropertyValue('--surface-400'), this.documentStyle.getPropertyValue('--yellow-700'),
         this.documentStyle.getPropertyValue('--blue-400'), this.documentStyle.getPropertyValue('--green-400'),   
         this.documentStyle.getPropertyValue('--bluegray-400'), this.documentStyle.getPropertyValue('--purple-400'),
         this.documentStyle.getPropertyValue('--red-500'), this.documentStyle.getPropertyValue('--primary-400'),
         this.documentStyle.getPropertyValue('--gray-700'), this.documentStyle.getPropertyValue('--orange-600')
        ]
    }
  ngOnInit(): void {
    this.documentStyle = getComputedStyle(document.documentElement);
    this.getLugares();
  }

  getLugares(){
    this.loading = true;
    this.lService.getAll().pipe(
      catchError(e =>{
        this.loading = false;
        return throwError(()=> e)
      })
    ).subscribe(data => {
      this.lugares = data;
      this.loading = false;
    })
  }
  get(){
    if(!this.fechas[0]){
      this.imprimitMsj('No ha seleccionado fechas', MessageType.Warn, 'Advertencia');
      return;
    }
    if(!this.fechas[0] || !this.fechas[1]){
      this.imprimitMsj('Debe seleccionar 2 fechas en el calendario', MessageType.Warn, 'Advertencia');
      return;
    }
    if(!this.lugaresSelected){
      this.imprimitMsj('No selecciono ningun lugar', MessageType.Warn, 'Advertencia');
      return;
    }
    if(this.lugaresSelected.length === 0){
      this.imprimitMsj('No selecciono ningun lugar', MessageType.Warn, 'Advertencia');
      return;
    }
    this.nivel = 0;
    this.loading = true;
    this.service.reportePorFechaLugar(this.fechas[0], this.fechas[1], this.lugaresSelected).then(data =>{
      this.loading = false;
      this.facturacion = data[0];
      this.categorias = data[1];
      this.soloTotales = this.verTotales;
      this.ventas = this.verVentas;
      if(this.soloTotales){
        this.nivel = 4;
        setTimeout(()=> this.showLevelFour(),500);
      }else{
        this.nivel = 1;
        setTimeout(()=>{    
          this.showLevelOne();
        },500)
      }
      
    }).catch( error=>
      console.log(error)
    )
  }

  getInversion(f: Facturacion): number{
    const cantidadVendida = f.cantidad * (f.ingreso - f.devolucion);
    return (cantidadVendida * (f.precioCompra / f.cantidadCompra)) - f.costoFijo - (f.montoBolsas ?? 0) - (f.montoEtiquetas ?? 0)
  }

  showLevelOne(){
    const agrupadorLugares = this.facturacion.filter((value, index, self) => index === self.findIndex((t) =>  t.nombreLugar === value.nombreLugar )).map(l => l.nombreLugar);
      const dataLugares: EstadoResultados[] = [];
      agrupadorLugares.forEach(el =>{
        const monto = this.ventas ?this.facturacion.filter(f => f.nombreLugar == el).reduce((acc, o)=> acc + this.getInversion(o),0) :
         this.facturacion.filter(f => f.nombreLugar == el).reduce((acc, o)=> acc + (o.ingreso - o.devolucion),0);
        dataLugares.push({ descripcion: el, monto: Math.round(monto) })
      });
        const labels: string[] = dataLugares.map(l => l.descripcion);
        const datos: number[] = dataLugares.map(l => l.monto);
        // this.dataPlaces = { datasets: dataSets, labels: labels }
      const graphArea = (document.getElementById('ChartLugares')! as HTMLCanvasElement).getContext('2d')!;
      const chart = new Chart(graphArea, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: this.ventas ? 'Ganancias ₡': 'Cant. Productos',
            data: datos,
            backgroundColor: this.backColors
          }]
        },
        options:{
          aspectRatio: window.innerWidth > 799 ? 2.5 : undefined,
          plugins:{
            title:{
              text: this.ventas ? 'Lugares Ganancias': 'Lugares Ventas',
              position: 'top'
            },
            legend:{
              labels:{
                usePointStyle: true,
                color: 'black'
              },
              position: 'top'
            },
            datalabels:{
              color: 'white',
              font:{
                size: this.ventas ? 14: 22,
                weight: 'bold'
              }
            }
          },
          responsive: true,
          maintainAspectRatio: true,
          onClick: (event, elements)=>{
            const clickedElement = elements[0];
            if(clickedElement){
              const datasetIndex = clickedElement.index;
              const label = labels[datasetIndex];
              //const labelValue = datos[datasetIndex];
              // Show an alert with information about the clicked segment
              //alert(`Clicked on: ${label} and it's value is ${labelValue}`);
              this.nivel = 2;
              this.currentLugar = label;
              this.items = [{label: label}]
              setTimeout(()=> this.showLevelTwo(label), 500)              
            }
          }
        },
        plugins:[
          ChartDataLabels
        ]
      })
      this.chartLugares = chart;
  }
  showLevelTwo(lugar: string){
    const agrupadorCat = this.facturacion.filter(f => f.nombreLugar === lugar).filter((value, index, self) => index === self.findIndex((t) =>  t.codigoProducto[0].toUpperCase() === value.codigoProducto[0].toUpperCase() )).map(l => l.codigoProducto[0].toUpperCase());
      const dataCategorias: EstadoResultados[] = [];
      agrupadorCat.forEach(el =>{
        const monto = this.ventas ? this.facturacion.filter(f => f.nombreLugar == lugar && f.codigoProducto[0].toUpperCase() === el).reduce((acc, o)=> acc + this.getInversion(o),0):
         this.facturacion.filter(f => f.nombreLugar == lugar && f.codigoProducto[0].toUpperCase() === el).reduce((acc, o)=> acc + (o.ingreso - o.devolucion),0);
        const categoria = this.categorias.find(c => c.nombre[0].toLocaleUpperCase() === el);
        if(categoria){
          dataCategorias.push({ descripcion: categoria.nombre, monto: Math.round(monto) })
        }else{
          dataCategorias.push({ descripcion: el, monto: Math.round(monto) })
        }    
      });
        const labels: string[] = dataCategorias.map(l => l.descripcion);
        const datos: number[] = dataCategorias.map(l => l.monto);

        // this.dataPlaces = { datasets: dataSets, labels: labels }
      const graphArea = (document.getElementById('ChartCategorias')! as HTMLCanvasElement).getContext('2d')!;

      const chart = new Chart(graphArea, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: this.ventas ? 'Ganancias ₡': 'Cant. Productos',
            data: datos,
            backgroundColor: this.backColors
          }]
        },
        options:{
          aspectRatio: window.innerWidth > 799 ? 2.5 : undefined,
          plugins:{ 
            title:{
              text: this.ventas ? 'Categorías Ganancias': 'Cantegorías Ventas',
              position: 'top'
            },
            legend:{
              labels:{
                usePointStyle: true,
                color: 'black'
              },
              position: 'top'
            },
            datalabels:{
              color: 'white',
              font:{
                size: this.ventas ? 14: 22,
                weight: 'bold'
              }
            }
          },
          responsive: true,
          maintainAspectRatio: true,
          onClick: (event, elements)=>{
            const clickedElement = elements[0];
            if(clickedElement){
              const datasetIndex = clickedElement.index;
              const label = labels[datasetIndex];
              //const labelValue = datos[datasetIndex];
              // Show an alert with information about the clicked segment
              //alert(`Clicked on: ${label} and it's value is ${labelValue}`);
              this.nivel = 3;
              this.currentCategoria = label;
              this.items = [{label: lugar},{label: label}];
              setTimeout(()=> this.showLevelThree(lugar, label), 500);
            }
          }
        },
        plugins:[
          ChartDataLabels
        ]
      })
      this.chartCategorias = chart;
  }

  showLevelThree(lugar: string, categoria: string){
    const agrupadorProd = this.facturacion.filter(f => f.nombreLugar === lugar && f.codigoProducto[0].toUpperCase() === categoria[0].toUpperCase()).filter((value, index, self) => index === self.findIndex((t) =>  t.codigoProducto === value.codigoProducto )).map(l => l.descripcionProducto);
    const dataProductos: EstadoResultados[] = [];
    agrupadorProd.forEach(el =>{
      const monto = this.ventas ? this.facturacion.filter(f => f.nombreLugar == lugar && f.codigoProducto[0].toUpperCase() === categoria[0].toUpperCase() && f.descripcionProducto === el).
      reduce((acc, o)=> acc + this.getInversion(o),0):
       this.facturacion.filter(f => f.nombreLugar == lugar && f.codigoProducto[0].toUpperCase() === categoria[0].toUpperCase() && f.descripcionProducto === el).
            reduce((acc, o)=> acc + (o.ingreso - o.devolucion),0);
      dataProductos.push({ descripcion: el, monto:  Math.round(monto) })       
    });
    dataProductos.sort((a, b)=> b.monto - a.monto).filter(t => t.monto > 0);
      const labels: string[] = dataProductos.map(l => l.descripcion);
      const datos: number[] = dataProductos.map(l => l.monto);

      // this.dataPlaces = { datasets: dataSets, labels: labels }
    const graphArea = (document.getElementById('ChartProductos')! as HTMLCanvasElement).getContext('2d')!;

    const chart = new Chart(graphArea, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: this.ventas ? 'Ganancias ₡': 'Cant. Productos',
          data: datos,
          backgroundColor: this.backColors
        }]
      },
      options:{
        indexAxis: 'y',
        elements:{
          bar: {
            borderWidth: 2
          }
        },
        scales:{
          y:{
            ticks:{
              font:{
                size: 7
              }
            }
          }
        },
        plugins:{ 
          title:{
            text: this.ventas ? 'Productos Ganancias': 'Productos Ventas',
            position: 'top'
          },
          legend:{
            labels:{
              usePointStyle: true,
              color: 'black'
            },
            position: 'top'
          },
          datalabels:{
            color: 'black',
            font:{
              size: 14,
              weight: 'bold'
            }
          }
        },
        responsive: true,
      },
      plugins:[
        ChartDataLabels
      ]
    })
    this.chartProductos = chart;
  }

  showLevelFour(){
    const agrupadorProd = this.facturacion.filter((value, index, self) => index === self.findIndex((t) =>  t.codigoProducto === value.codigoProducto )).map(l => l.descripcionProducto);
    const dataProductos: EstadoResultados[] = [];
    agrupadorProd.forEach(el =>{
      const monto = this.ventas ? this.facturacion.filter(f => f.descripcionProducto === el).
      reduce((acc, o)=> acc + this.getInversion(o),0): this.facturacion.filter(f => f.descripcionProducto === el).
            reduce((acc, o)=> acc + (o.ingreso - o.devolucion),0);
      dataProductos.push({ descripcion: el, monto: Math.round(monto) })       
    });
    dataProductos.sort((a, b)=> b.monto - a.monto);

    this.dataFour = dataProductos;
    this.totalDataFour = dataProductos.reduce((acc, o)=> acc + o.monto, 0);
    
    // const labels: string[] = dataProductos.map(l => l.descripcion);
    // const datos: number[] = dataProductos.map(l => l.monto);

    //   // this.dataPlaces = { datasets: dataSets, labels: labels }
    // const graphArea = (document.getElementById('ChartProductos2')! as HTMLCanvasElement).getContext('2d')!;

    // const chart = new Chart(graphArea, {
    //   type: 'bar',
    //   data: {
    //     labels: labels,
    //     datasets: [{
    //       label: 'Cant. Productos',
    //       data: datos,
    //       backgroundColor: this.backColors
    //     }]
    //   },
    //   options:{
    //     indexAxis: 'y',
    //     elements:{
    //       bar: {
    //         borderWidth: 2
    //       }
    //     },
    //     plugins:{ 
    //       legend:{
    //         labels:{
    //           usePointStyle: true,
    //           color: 'black'
    //         },
    //         position: 'top'
    //       },
    //       datalabels:{
    //         color: 'white',
    //         font:{
    //           size: 16,
    //           weight: 'bold'
    //         }
    //       },
    //       title:{
    //         display: true,
    //         text: 'Productos totales'
    //       }
    //     },
    //     responsive: true
    //   },
    //   plugins:[
    //     ChartDataLabels
    //   ]
    // })
    // this.chartProductos = chart;
  }

  imprimitMsj(msj: string, type: string, title: string){
    this.msjService.clear();
    this.msjService.add({
      severity: type, detail: msj, summary: title, life: 6000, closable: true, key: 'ts'
    })
  }

  backToPreviousLevel(){
    if(this.nivel === 3){
      this.nivel = 2;
      this.updateItems();
      setTimeout(()=> this.showLevelTwo(this.currentLugar), 500);
    }else if(this.nivel === 2){
      this.nivel = 1;
      this.updateItems();
      setTimeout(()=> this.showLevelOne(), 500);
    }
  }

  updateItems(){
    if(this.nivel === 1){
      this.items = []
    }else if(this.nivel === 2){
      this.items = [{label: this.currentLugar}]
    }else if(this.nivel === 3){
      this.items = [{label: this.currentLugar},{label: this.currentCategoria}]
    }
  }
}
