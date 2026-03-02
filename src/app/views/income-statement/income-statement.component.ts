import {  Component, OnInit } from '@angular/core';
import { ConfirmEventType, ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';
import { es } from 'src/app/functions/locale';
import { Facturacion } from 'src/app/modelos/facturacion';
import { ReportService } from 'src/app/services/report.service';
import { MessageType } from 'src/app/enums/Message';
import { InvoiceService } from 'src/app/services/invoice.service';
import { ProductsService } from 'src/app/services/products.service';
import { Tarjeta } from 'src/app/modelos/tarjeta';
import { IncomeStatementService } from 'src/app/services/income-statement.service';
import { AgrupadorEstadoResultados, EstadoResultados } from 'src/app/modelos/EstadoResultados';
import { Depreciacion } from 'src/app/modelos/depreciacion';
import { getDiaSemana, getMesDelAno } from 'src/app/functions/listas';
import { Rubro } from 'src/app/modelos/rubro';
import { catchError, throwError } from 'rxjs';
function daysBetweenDates(d1: Date, d2: Date) {
  const diff = Math.abs(d1.getTime() - d2.getTime());
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

@Component({
  selector: 'app-income-statement',
  templateUrl: './income-statement.component.html',
  styleUrls: ['./income-statement.component.scss'],
  providers: [ MessageService, ConfirmationService ]
})
export class IncomeStatementComponent implements OnInit {

  fechas: Date[] = [];
  loading: boolean = false;
  loaded: boolean = false;
  excepcionesImpuestos: string[] = ['M001','M002','M003','M004','M005','M006','M007','M008','s001','s002','S003','S004','S005','S006','S007','S009']; 
  costosVentas: EstadoResultados[] = [];
  totalCostosVentas: number = 0;
  costosCompras: EstadoResultados[] = [];
  totalCostosCompras: number = 0;
  gastosVentas: EstadoResultados[] = [];
  totalGastosVentas: number = 0;
  gastosCompras: EstadoResultados[] = [];
  totalGastosCompras: number = 0;
  creditos: EstadoResultados[] = [];
  totalCreditos: number = 0;
  ingresosCompras : EstadoResultados[] = [];
  totalIngresosCompras: number = 0;
  impuestos: EstadoResultados[] = [];
  totalImpuestos: number = 0;
  totalTarjetas: number = 0;
  tasaImpuesto: number = 13;
  betweenDates: string = '';

  //subtotales
  utilidadBruta: number = 0;
  ventasBrutas: number = 0;
  totalGastos: number = 0;
  utilidadOperacion: number = 0;
  utilidadPeriodo: number = 0;

  // depreciaciones
  totalDepreciaciones: number = 0;

  //otra información
  totalBolsas: number = 0;
  totalEtiquetas: number = 0;
  totalInversiones: number = 0;
  totalCostoFijo: number = 0;
  //ahorro
  totalAhorro: number = 0;
  utilidadNetaPeriodo: number = 0;
  ngOnInit(): void {
    //this.service.getCompras(new Date(2024, 10, 29, 0, 0, 0, 0), new Date(2024, 11, 1, 6, 0, 0, 0)).then(r => console.log(r))
  }

  constructor(private service: IncomeStatementService, private config: PrimeNGConfig, private msjService: MessageService){
    this.config.setTranslation(es);
  }

  reload: boolean = false;

  get(){
    if(!this.fechas[0]){
      return;
    }

    if(!this.fechas[0] || !this.fechas[1]){
      this.imprimitMsj('Debe seleccionar 2 fechas en el calendario', MessageType.Warn, 'Advertencia');
      return;
    }
    this.loading = true;
    this.betweenDates = 'Del '+ this.getFecha(this.fechas[0]) + ' al ' + this.getFecha(this.fechas[1]);	
    this.clearData();
    this.service.getDataWc(this.fechas[0], this.fechas[1]).then(datos => {
      
      const tarjetas = datos[0];
      const rubros = datos[1];
      const data = datos[2];
      const depreciaciones = datos[3];
      this.reload = true;
      this.createData(tarjetas, rubros, data, depreciaciones);

    }).catch(error => {
      this.loading = false;
      console.log(error)
    })
  }

  createData(tarjetas: Tarjeta[], rubros: Rubro[], data: Facturacion[],depreciaciones: Depreciacion[]){
    
    this.service.getComprasObs(this.fechas[0], this.fechas[1]).pipe(
      catchError(error => {
        return throwError(()=> error)
      })
    ).subscribe((compras)=>{
      if(!this.reload) return;
      this.reload = false;
      this.loaded = tarjetas.length > 0 || rubros.length > 0 || data.length > 0 || compras.length > 0 || depreciaciones.length > 0;
      // Ventas brutas
      this.ventasBrutas = data.reduce((acc, o)=> acc + ((o.ingreso - o.devolucion)*o.precioProducto), 0);

      // Creditos
      //console.log(depreciaciones)
      const agrupadorCreditos: AgrupadorEstadoResultados[] = rubros.filter(r => r.tipo=='Credito').map(r => { return { rubro: r.nombreRubro,  monto: r.monto } });
      const uniqueCreditos = agrupadorCreditos.filter((value, index, self) => index === self.findIndex((t) =>  t.rubro === value.rubro ));
      uniqueCreditos.forEach(element => {
        const montoRubro = agrupadorCreditos.filter(r => r.rubro == element.rubro).reduce((acc, o)=> acc + o.monto, 0);
        this.creditos.push({descripcion: element.rubro, monto: montoRubro});
        this.totalCreditos += montoRubro;
      });

      // Costos de ventas
      const agrupadorCostosVentas: AgrupadorEstadoResultados[] = rubros.filter(r => r.tipo=='Costo').map(r => { return { rubro: r.nombreRubro,  monto: r.monto } });
      const uniqueCostosVentas = agrupadorCostosVentas.filter((value, index, self) => index === self.findIndex((t) =>  t.rubro === value.rubro ));
      uniqueCostosVentas.forEach(element => {
        const montoRubro = agrupadorCostosVentas.filter(r => r.rubro == element.rubro).reduce((acc, o)=> acc + o.monto, 0);
        this.costosVentas.push({descripcion: element.rubro, monto: montoRubro});
        this.totalCostosVentas += montoRubro;
      });

      // Costos de compras
      const agrupadorCostosCompras: AgrupadorEstadoResultados[] = compras.filter(r => r.tipo=='Costo').map(r => { return { rubro: r.nombreRubro,  monto: r.monto } });
      const uniqueCostosCompras = agrupadorCostosCompras.filter((value, index, self) => index === self.findIndex((t) =>  t.rubro === value.rubro ));
      uniqueCostosCompras.forEach(element => {
        const montoRubro = agrupadorCostosCompras.filter(r => r.rubro == element.rubro).reduce((acc, o)=> acc + o.monto, 0);
        this.costosCompras.push({descripcion: element.rubro, monto: montoRubro});
        this.totalCostosCompras += montoRubro;
      });

      // Gastos de ventas
      const agrupadorGastosVentas: AgrupadorEstadoResultados[] = rubros.filter(r => r.tipo=='Gasto').map(r => { return { rubro: r.nombreRubro,  monto: r.monto } });
      const uniqueGastosVentas = agrupadorGastosVentas.filter((value, index, self) => index === self.findIndex((t) =>  t.rubro === value.rubro ));
      uniqueGastosVentas.forEach(element => {
        const montoRubro = agrupadorGastosVentas.filter(r => r.rubro == element.rubro).reduce((acc, o)=> acc + o.monto, 0);
        this.gastosVentas.push({descripcion: element.rubro, monto: montoRubro});
        this.totalGastosVentas += montoRubro;
      });

      // Gastos de compras
      const agrupadorGastosCompras: AgrupadorEstadoResultados[] = compras.filter(r => r.tipo=='Gasto').map(r => { return { rubro: r.nombreRubro,  monto: r.monto } });
      const uniqueGastosCompras = agrupadorGastosCompras.filter((value, index, self) => index === self.findIndex((t) =>  t.rubro === value.rubro ));
      uniqueGastosCompras.forEach(element => {
        const montoRubro = agrupadorGastosCompras.filter(r => r.rubro == element.rubro).reduce((acc, o)=> acc + o.monto, 0);
        this.gastosCompras.push({descripcion: element.rubro, monto: montoRubro});
        this.totalGastosCompras += montoRubro;
      });

      // Gastos tarjeta
      this.totalTarjetas = tarjetas.reduce((sum, c) => sum + c.monto, 0);

      // Depreciaciones
      this.totalDepreciaciones = depreciaciones.reduce((sum, c) => sum + this.depreciationAmount(c, this.fechas[0], this.fechas[1]), 0);

      // Utilidad Bruta
      this.utilidadBruta = this.ventasBrutas - this.totalCreditos - this.totalCostosVentas - this.totalCostosCompras;

      // Gastos totales
      this.totalGastos = this.totalGastosCompras + this.totalGastosVentas + this.totalTarjetas + this.totalDepreciaciones;

      // Utilidad operativa
      this.utilidadOperacion = this.utilidadBruta - this.totalGastos;

      // Impuestos
      const brutoExcepcion = data.filter(r => this.excepcionesImpuestos.includes(r.codigoProducto)).reduce((acc, o)=> acc + ((o.ingreso - o.devolucion)*o.precioProducto), 0);
      this.totalImpuestos = (brutoExcepcion * this.tasaImpuesto) / 100;

      // Ingresos Compras
      const agrupadorIngresosCompras: AgrupadorEstadoResultados[] = compras.filter(r => r.tipo=='Ingreso').map(r => { return { rubro: r.nombreRubro,  monto: r.monto } });
      const uniqueIngresosCompras = agrupadorIngresosCompras.filter((value, index, self) => index === self.findIndex((t) =>  t.rubro === value.rubro ));
      uniqueIngresosCompras.forEach(element => {
        const montoRubro = agrupadorIngresosCompras.filter(r => r.rubro == element.rubro).reduce((acc, o)=> acc + o.monto, 0);
        this.ingresosCompras.push({descripcion: element.rubro, monto: montoRubro});
        this.totalIngresosCompras += montoRubro;
      });
      
      this.utilidadPeriodo = this.utilidadOperacion - this.totalImpuestos + this.totalIngresosCompras;

      // Ahorros
      const ahorro = this.utilidadPeriodo > 0 ? (this.utilidadPeriodo * 5) / 100 : 0;
      this.totalAhorro = Math.round(ahorro);
      this.utilidadNetaPeriodo = Math.round(this.utilidadPeriodo - ahorro);

      // otros datos
      this.totalInversiones = Math.round(data.reduce((sum, c) => sum + this.getInversion(c), 0));
      this.totalBolsas = Math.round(data.reduce((acc, o) => acc + (o.montoBolsas ?? 0), 0));
      this.totalEtiquetas = Math.round(data.reduce((acc, o) => acc + (o.montoEtiquetas ?? 0), 0));
      this.totalCostoFijo = data.reduce((acc, o) => acc + (o.costoFijo * (o.ingreso - o.devolucion)), 0);

      this.loading = false;
    })
  }

  depreciationAmount(depre: Depreciacion, fechaInicio: Date, fechaFin: Date): number{
    if(depre){
      const depreciationDays = daysBetweenDates(fechaInicio, fechaFin) + 1;
      const depreAnual = (depre.costo - ((depre.costo * depre.residual)/100)) / depre.vida;
      const depreDiarios = depreAnual / 365;
      return  Math.round(depreDiarios* depreciationDays);
    }
    return 0;
  }

  getFecha(date: Date): string{
    if(date){
      return getDiaSemana(date.getDay()) + date.getDate() + ' de ' + getMesDelAno(date.getMonth()) + ', '+date.getFullYear();
    }
    return '';
  }

  getInversion(f: Facturacion): number{
    const cantidadVendida = f.cantidad * (f.ingreso - f.devolucion);
    return (cantidadVendida * (f.precioCompra / f.cantidadCompra)) //+ f.costoFijo
  }

  clearData(){
    this.loaded = false;
    this.costosVentas = [];
    this.totalCostosVentas = 0;
    this.costosCompras = [];
    this.totalCostosCompras = 0;
    this.gastosVentas = [];
    this.totalGastosVentas = 0;
    this.gastosCompras = [];
    this.totalGastosCompras = 0;
    this.creditos = [];
    this.totalCreditos = 0;
    this.ingresosCompras = [];
    this.totalIngresosCompras = 0;
    this.impuestos = [];
    this.totalImpuestos = 0;
    this.totalTarjetas = 0;
      //subtotales
    this.utilidadBruta = 0;
    this.ventasBrutas = 0;
    this.totalGastos = 0;
    this.utilidadOperacion = 0;
    this.utilidadPeriodo = 0;
    // depreciaciones
    this.totalDepreciaciones = 0;
    // informativo
    this.totalInversiones =0;
    this.totalBolsas = 0;
    this.totalEtiquetas = 0;
    this.totalCostoFijo = 0;
    //ahorros
    this.totalAhorro = 0;
    this.utilidadNetaPeriodo = 0;
  }

  imprimitMsj(msj: string, type: string, title: string){
    this.msjService.clear();
    this.msjService.add({
      severity: type, detail: msj, summary: title, life: 6000, closable: true, key: 'ts'
    })
  }

}
