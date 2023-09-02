import { Injectable } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  collection,
  doc,
} from '@firebase/firestore';
import { Firestore, Timestamp, collectionData, docData, query, where, orderBy, writeBatch } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Facturacion } from '../modelos/facturacion';
import { Rubro } from '../modelos/rubro';
import { Producto } from '../modelos/producto';
import { Tarjeta } from '../modelos/tarjeta';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private factCollection: CollectionReference<DocumentData>;
  private rubCollection: CollectionReference<DocumentData>;

  constructor(private readonly firestore: Firestore) { 
    this.factCollection = collection(this.firestore, 'factura');
    this.rubCollection = collection(this.firestore, 'rubros');
  }

  getTarjetas(fechaInicio: Date, fechaFin: Date){

    fechaFin.setTime(fechaFin.getTime() + 60 * 60 * 1000);
    
    console.log(fechaFin)
    let qry = query(collection(this.firestore, 'tarjeta'), where('fecha', '>=', fechaInicio), where('fecha', '<=', fechaFin));
    return collectionData(qry, {idField: 'id'}) as Observable<Tarjeta[]>;
  }

  getRubros(fechaInicio: Date, fechaFin: Date){
    if(fechaInicio.getTime() == fechaFin.getTime()){
      fechaFin.setTime(fechaFin.getTime() + 60* 60 *1000);
    }
    let qry = query(this.rubCollection, where('fecha', '>=', fechaInicio), where('fecha', '<=', fechaFin), orderBy('fecha', 'asc'));
    return collectionData(qry, {idField: 'id'}) as Observable<Rubro[]>;
  }

  getFacturas(fechaInicio: Date, fechaFin: Date){
    if(fechaInicio.getTime() == fechaFin.getTime()){
      fechaFin.setTime(fechaFin.getTime() + 60* 60 *1000);
    }
    let qry = query(this.factCollection, where('fecha', '>=', fechaInicio), where('fecha', '<=', fechaFin), orderBy('fecha', 'asc'));
    return collectionData(qry, {idField: 'id'}) as Observable<Facturacion[]>;
  }

  getFacturasConLugares(fechaInicio: Date, fechaFin: Date, lugares: string[]){
    if(fechaInicio.getTime() == fechaFin.getTime()){
      fechaFin.setTime(fechaFin.getTime() + 60* 60 *1000);
    }
    let qry = query(this.factCollection, where('fecha', '>=', fechaInicio), where('fecha', '<=', fechaFin));
    qry = query(qry, where('lugar', 'in', lugares));
    return collectionData(qry, {idField: 'id'}) as Observable<Facturacion[]>;
  }

  updateDataToCurrentValues(facturas: Facturacion[], prods: Producto[]){
    const batch = writeBatch(this.firestore);
    facturas.forEach(f =>{
      const prod = prods.find(p => p.id == f.codigoProducto);
      if(prod){
        f.cantidad = prod.cantidad;
        f.precioCompra = prod.precioCosto ?? f.precioCompra;
        f.cantidadCompra = prod.cantidadCosto ?? f.cantidadCompra;
        f.precioProducto = prod.precioVenta;
        const facDocumentReference = doc(
          this.firestore,
          `factura/${f.id}`
        );
        batch.set(facDocumentReference, { ...f });
      }
    });
    return batch.commit();
  }

  removeFacturas(facturas: string[], rubros: string[], prods: Producto[], tarjs: Tarjeta[]){
    const batch = writeBatch(this.firestore);
    facturas.forEach(f =>{
      const facDocumentReference = doc(
        this.firestore,
        `factura/${f}`
      );
      batch.delete(facDocumentReference);
    });
    rubros.forEach(r =>{
      const robDocumentReference = doc(
        this.firestore,
        `rubros/${r}`
      );
      batch.delete(robDocumentReference);
    });
    prods.forEach(p =>{
      const prodDocumentReference = doc(
        this.firestore,
        `productos/${p.id}`
      );
      batch.set(prodDocumentReference, { ...p })
    });
    tarjs.forEach(t=> {
      const tarjDocumentReference = doc(
        this.firestore,
        `tarjeta/${t.id}`
      );
      batch.set(tarjDocumentReference, { ...t })
    });
    return batch.commit();
  }
}
