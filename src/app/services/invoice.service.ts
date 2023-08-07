import { Injectable } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  setDoc,
  collection,
  deleteDoc,
  doc,
} from '@firebase/firestore';
import { Firestore, Timestamp, collectionData, docData, query, where, writeBatch } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { TipoCambio } from '../modelos/tipo-cambio';
import { Facturacion } from '../modelos/facturacion';
import { Observable } from 'rxjs';
import { DeleteInvoice } from '../modelos/delete-invoce';
import { Producto } from '../modelos/producto';
import { Rubro } from '../modelos/rubro';

const urlTipoCambio = 'https://tipodecambio.paginasweb.cr/api'

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private factCollection: CollectionReference<DocumentData>;
  private rubCollection: CollectionReference<DocumentData>;

  constructor(private readonly firestore: Firestore, private http: HttpClient) { 
    this.factCollection = collection(this.firestore, 'factura');
    this.rubCollection = collection(this.firestore, 'rubros');
  }

  getTipoCambio(){
    return this.http.get<TipoCambio>(urlTipoCambio)
  }

  getAll(fecha: Date, lugar: string, vendedor: string){
    //fecha.setHours(-6)
    const day = 60 * 60 * 24 * 1000;
    const endDate = new Date(fecha.getTime() + day)
    console.log(vendedor)
    let qry = query(this.factCollection, where('fecha', '>=', fecha), where('fecha', '<', endDate));
    if(lugar){
      qry = query(qry, where('lugar', '==', lugar))
    }
    if(vendedor){
      qry = query(qry, where('vendedor', '==', vendedor))
    }

    return collectionData(qry, {idField: 'id'}) as Observable<Facturacion[]>;
  }

  getAllRubros(){
    return collectionData(this.rubCollection, {idField: 'id'}) as Observable<Rubro[]>;
  }

  getRubros(fecha: Date, lugar: string, vendedor: string){
    const day = 60 * 60 * 24 * 1000;
    const endDate = new Date(fecha.getTime() + day)
    let qry = query(this.rubCollection, where('fecha', '>=', fecha), where('fecha', '<', endDate));
    if(lugar){
      qry = query(qry, where('lugar', '==', lugar))
    }
    if(vendedor){
      qry = query(qry, where('vendedor', '==', vendedor))
    }

    return collectionData(qry, {idField: 'id'}) as Observable<Rubro[]>;
  }

  getAllWithOutSeller(fecha: Date, lugar: string){
    //fecha.setHours(-6)
    const day = 60 * 60 * 24 * 1000;
    const endDate = new Date(fecha.getTime() + day)
    let qry = query(this.factCollection, where('fecha', '>=', fecha), where('fecha', '<', endDate));
    if(lugar){
      qry = query(qry, where('lugar', '==', lugar))
    }

    return collectionData(qry, {idField: 'id'}) as Observable<Facturacion[]>;
  }

  allInvoices(){
    return collectionData(this.factCollection, {idField: 'id'}) as Observable<Facturacion[]>;
  }

  insertMultipleRows(facturas: Facturacion[], prods: Producto[], deletes: DeleteInvoice[]){
    const batch = writeBatch(this.firestore);
    facturas.forEach(f =>{
      const facDocumentReference = doc(
        this.firestore,
        `factura/${f.id}`
      );
      const prod = prods.find(p => p.id == f.codigoProducto);
      if(prod){
        prod.existencias =  (prod.existencias ?? 0) - (f.ingreso - f.devolucion);
        const prodDocumentReference = doc(
          this.firestore, `productos/${prod.id}`
        )
        batch.set(prodDocumentReference, { ...prod });
      }

      batch.set(facDocumentReference, { ...f })
    })
    deletes.forEach(t => {
      const facDocumentReference = doc(
        this.firestore,
        `factura/${t.idFactura}`
      );
      
      const prodDocumentReference = doc(
        this.firestore, `productos/${t.producto.id}`
      )
      batch.set(prodDocumentReference, { ...t.producto });
      batch.delete(facDocumentReference)
    })
    return batch.commit();
  }

  storeRubros(updateRubros: Rubro[], deleteRubros: Rubro[]){
    const batch = writeBatch(this.firestore);
    updateRubros.forEach(u => {
      const rubDocumentReference = doc(
        this.firestore,
        `rubros/${u.id}`
      );
      setDoc(rubDocumentReference, { ...u })
    });
    deleteRubros.forEach(d => {
      const rubDocumentReference = doc(
        this.firestore,
        `rubros/${d.id}`
      );
      deleteDoc(rubDocumentReference);
    });
    return batch.commit();
  }

  delete(id: string){
    const documentReference = doc(
      this.firestore,
      `factura/${id}`
    );
    return deleteDoc(documentReference);
  }

}
