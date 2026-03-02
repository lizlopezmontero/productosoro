import { Injectable } from '@angular/core';
import {
  collection
} from '@firebase/firestore';
import { Firestore, collectionData, query, where } from '@angular/fire/firestore';
import { firstValueFrom, Observable } from 'rxjs';
import { Tarjeta } from '../modelos/tarjeta';
import { Facturacion } from '../modelos/facturacion';
import { Rubro } from '../modelos/rubro';
import { Compras } from '../modelos/compras';
import { Depreciacion } from '../modelos/depreciacion';

@Injectable({
  providedIn: 'root'
})
export class IncomeStatementService {

  constructor(private readonly firestore: Firestore) { }

  async getData(fechaInicio: Date, fechaFin: Date){
    fechaFin.setHours(fechaFin.getHours() + 6);
    var promises = await Promise.all([this.getTarjetas(fechaInicio, fechaFin), this.getRubros(fechaInicio, fechaFin), this.getFacturas(fechaInicio, fechaFin), this.getCompras(fechaInicio, fechaFin), this.getDepreciaciones()]);
    return promises
  }
  async getDataWc(fechaInicio: Date, fechaFin: Date){
    fechaFin.setHours(fechaFin.getHours() + 6);
    var promises = await Promise.all([this.getTarjetas(fechaInicio, fechaFin), this.getRubros(fechaInicio, fechaFin), this.getFacturas(fechaInicio, fechaFin), this.getDepreciaciones()]);
    return promises
  }

  getTarjetas(fechaInicio: Date, fechaFin: Date){
    if(fechaInicio.getTime() == fechaFin.getTime()){
      fechaFin.setTime(fechaFin.getTime() + 60* 60 *1000);
    }
    let qry = query(collection(this.firestore, 'tarjeta'), where('fecha', '>=', fechaInicio), where('fecha', '<=', fechaFin));
    return firstValueFrom(collectionData(qry, {idField: 'id'}) as Observable<Tarjeta[]>);
  }

  getRubros(fechaInicio: Date, fechaFin: Date){
    if(fechaInicio.getTime() == fechaFin.getTime()){
      fechaFin.setTime(fechaFin.getTime() + 60* 60 *1000);
    }
    let qry = query(collection(this.firestore, 'rubros'), where('fecha', '>=', fechaInicio), where('fecha', '<=', fechaFin));
    return  firstValueFrom(collectionData(qry, {idField: 'id'}) as Observable<Rubro[]>);
  }

  getFacturas(fechaInicio: Date, fechaFin: Date){
    if(fechaInicio.getTime() == fechaFin.getTime()){
      fechaFin.setTime(fechaFin.getTime() + 60* 60 *1000);
    }
    let qry = query(collection(this.firestore, 'factura'), where('fecha', '>=', fechaInicio), where('fecha', '<=', fechaFin));
    return  firstValueFrom(collectionData(qry, {idField: 'id'}) as Observable<Facturacion[]>);
  }

  getCompras(fechaInicio: Date, fechaFin: Date){
    if(fechaInicio.getTime() == fechaFin.getTime()){
      fechaFin.setTime(fechaFin.getTime() + 60* 60 *1000);
    }
    let qry = query(collection(this.firestore, 'rubros-compras'), where('fecha', '>=', fechaInicio), where('fecha', '<', fechaFin));

    return firstValueFrom (collectionData(qry, {idField: 'id'}) as Observable<Compras[]>);
  }
  getComprasObs(fechaInicio: Date, fechaFin: Date){
    if(fechaInicio.getTime() == fechaFin.getTime()){
      fechaFin.setTime(fechaFin.getTime() + 60* 60 *1000);
    }
    let qry = query(collection(this.firestore, 'rubros-compras'), where('fecha', '>=', fechaInicio), where('fecha', '<', fechaFin));

    return collectionData(qry, {idField: 'id'}) as Observable<Compras[]>;
  }
  getDepreciaciones(){
    let qry = query(collection(this.firestore, 'depreciacion'));
    return  firstValueFrom(collectionData(qry, {idField: 'id'}) as Observable<Depreciacion[]>);
  }
}
