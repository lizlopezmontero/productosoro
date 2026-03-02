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
import { Tarjeta } from '../modelos/tarjeta';
import { HistoricoInventario } from '../modelos/historico-inventario';

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

  getTarjetas(fecha: Date){
    const day = 60 * 60 * 24 * 1000;
    const endDate = new Date(fecha.getTime() + day)
    let qry = query(collection(this.firestore, 'tarjeta'), where('fecha', '>=', fecha), where('fecha', '<', endDate));
    return collectionData(qry, {idField: 'id'}) as Observable<Tarjeta[]>;
  }

  getAll(fecha: Date, lugar: string, vendedor: string){
    //fecha.setHours(-6)
    const day = 60 * 60 * 24 * 1000;
    const endDate = new Date(fecha.getTime() + day)
    let qry = query(this.factCollection, where('fecha', '>=', fecha), where('fecha', '<', endDate));
    if(lugar){
      qry = query(qry, where('lugar', '==', lugar))
    }
    if(vendedor){
      qry = query(qry, where('vendedor', '==', vendedor))
    }

    return collectionData(qry, {idField: 'id'}) as Observable<Facturacion[]>;
  }

  getFacturas(){
    const fecha: Date = new Date(2024,4,15,0,0,0);
    const endDate = new Date(2024,4,25,0,0,0);
    let qry = query(this.factCollection, where('fecha', '>=', fecha), where('fecha', '<', endDate));
    return collectionData(qry, {idField: 'id'}) as Observable<Facturacion[]>
  }

  updateFacturas(facturas: Facturacion[]){
    const batch = writeBatch(this.firestore);
    facturas.forEach(factura => {
      const docRef = doc(this.firestore, `factura/${factura.id}`);
      batch.set(docRef, {...factura});
    });
    return batch.commit();
  }

  getAllMultipleSellers(fecha: Date, lugar: string, vendedor: string[]){
    //fecha.setHours(-6)
    const day = 60 * 60 * 24 * 1000;
    const endDate = new Date(fecha.getTime() + day)
    let qry = query(this.factCollection, where('fecha', '>=', fecha), where('fecha', '<', endDate));
    if(lugar){
      qry = query(qry, where('lugar', '==', lugar))
    }
    if(vendedor){
      qry = query(qry, where('vendedor', 'in', vendedor))
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

  getRubrosWithoutSeller(fecha: Date, lugar: string){
    const day = 60 * 60 * 24 * 1000;
    const endDate = new Date(fecha.getTime() + day)
    let qry = query(this.rubCollection, where('fecha', '>=', fecha), where('fecha', '<', endDate));
    if(lugar){
      qry = query(qry, where('lugar', '==', lugar))
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
    const fecha = new Date(0);
    fecha.setUTCMilliseconds(Date.now()-15780000000);

    let qry = query(this.factCollection, where('fecha', '>=', fecha));
    return collectionData(qry, {idField: 'id'}) as Observable<Facturacion[]>;
  }

  getInvoiceByVendedorAndLugar(lugar: string, vendedor: string){
    let qry = query(this.factCollection, where('lugar', '==', lugar));
    if(vendedor){
      qry = query(qry, where('vendedor', '==', vendedor))
    }

    return collectionData(qry, {idField: 'id'}) as Observable<Facturacion[]>;
  }

  insertMultipleRows(facturas: Facturacion[], prods: Producto[], deletes: DeleteInvoice[], tarjeta: Tarjeta){
    const fechaActual = new Date();
    const batch = writeBatch(this.firestore);
    facturas.forEach(f =>{
      const facDocumentReference = doc(
        this.firestore,
        `factura/${f.id}`
      );
      const prod = prods.find(p => p.id == f.codigoProducto);
      if(prod){
        const prodAnt: Producto = JSON.parse(JSON.stringify(prod));
        prod.existencias =  (prod.existencias ?? 0) - (f.ingreso - f.devolucion);
        const prodDocumentReference = doc(
          this.firestore, `productos/${prod.id}`
        )
        batch.set(prodDocumentReference, { ...prod });
        if(f.ingreso - f.devolucion !== 0){
          const fechaActual = new Date();
          const idInventario = prod.id +'.'+ fechaActual.getTime();
          const historyReferences = doc(
            this.firestore, `historico-inventario/${idInventario}`
          );
          const history: HistoricoInventario = { id: idInventario, fecha: Timestamp.fromDate(fechaActual), codProducto: prod.id, descProducto: prod.descripcion,
            cantidadNueva: prod.existencias ?? 0, cantidadAnterior: prodAnt.existencias ?? 0 };
          batch.set(historyReferences, { ...history });
        }
      }

      batch.set(facDocumentReference, { ...f })
    })
    deletes.forEach(t => {
      const facDocumentReference = doc(
        this.firestore,
        `factura/${t.idFactura}`
      );
       
      if(t.producto.existencias){
        const idInventario = t.producto.id +'.'+ fechaActual.getTime()
          const historyReferences = doc(
            this.firestore, `historico-inventario/${idInventario}`
          );
          const history: HistoricoInventario = { id: idInventario, fecha: Timestamp.fromDate(fechaActual), codProducto: t.producto.id, descProducto: t.producto.descripcion,
            cantidadNueva: t.producto.existencias ?? 0, cantidadAnterior: t.existenciaAnt };
          batch.set(historyReferences, { ...history });
      }
      const prodDocumentReference = doc(
        this.firestore, `productos/${t.producto.id}`
      )
      batch.set(prodDocumentReference, { ...t.producto });
      batch.delete(facDocumentReference)
    })
    
    const tarjDocumentReference = doc(
      this.firestore,
      `tarjeta/${tarjeta.id}`
    );
    batch.set(tarjDocumentReference, { ...tarjeta });
    return batch.commit();
  }

  storeOnlyCard(t: Tarjeta){
    const tarjDocumentReference = doc(
      this.firestore,
      `tarjeta/${t.id}`
    );
    return setDoc(tarjDocumentReference, { ...t });
  }

  storeRubros(updateRubros: Rubro[], deleteRubros: Rubro[], tarjeta: Tarjeta){
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
    const tarjDocumentReference = doc(
      this.firestore,
      `tarjeta/${tarjeta.id}`
    );
    batch.set(tarjDocumentReference, { ...tarjeta });
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
