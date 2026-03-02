import { Injectable } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  setDoc,
  collection,
  deleteDoc,
  doc,
} from '@firebase/firestore';
import { Firestore, Timestamp, collectionData, docData, orderBy, query, where, writeBatch } from '@angular/fire/firestore';
import { Categoria, Producto } from '../modelos/producto';
import { Observable } from 'rxjs';
import { HistoricoInventario } from '../modelos/historico-inventario';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  updateAll(productos: Producto[], productosViejos: Producto[]) {
    const fechaActual = new Date();
    const batch = writeBatch(this.firestore);
    productos.forEach(prod => {
      const prodDocumentReference = doc(
        this.firestore, `productos/${prod.id}`
      );
      batch.set(prodDocumentReference, { ...prod });
    });
    productos.forEach(prod => {
      const productoViejo = productosViejos.find(pr => pr.id == prod.id);
      if(productoViejo){
        //console.log(productoViejo)
        //console.log(prod)
        if(productoViejo.existencias != prod.existencias){
          //console.log(productoViejo)
          const idInventario = prod.id +'.'+ fechaActual.getTime()
          const historyReferences = doc(
            this.firestore, `historico-inventario/${idInventario}`
          );
          const history: HistoricoInventario = { id: idInventario, fecha: Timestamp.fromDate(fechaActual), codProducto: prod.id, descProducto: prod.descripcion,
            cantidadNueva: prod.existencias ?? 0, cantidadAnterior: productoViejo.existencias ?? 0 };
          batch.set(historyReferences, { ...history });
        }
      }
    })
    return batch.commit();
  }
  updatePrices(productos: Producto[]){
    const batch = writeBatch(this.firestore);
    productos.forEach(prod => {
      const prodDocumentReference = doc(
        this.firestore, `productos/${prod.id}`
      );
      batch.set(prodDocumentReference, { ...prod });
    });
    return batch.commit();
  }

  private productosCollection: CollectionReference<DocumentData>;

  constructor(private readonly firestore: Firestore) { 
    this.productosCollection = collection(this.firestore, 'productos');
  }

  getAll(){
    const qry = query(this.productosCollection, orderBy('orden'));
    return collectionData(qry, {idField: 'id'}) as Observable<Producto[]>;
  }

  getAllOrderByName(){
    const qry = query(this.productosCollection, orderBy('descripcion'));
    return collectionData(qry, {idField: 'id'}) as Observable<Producto[]>;
  }

  getCategorias(){
    const collect = collection(this.firestore, 'categorias');
    return collectionData(collect, {idField: 'id'}) as Observable<Categoria[]>;
  }

  save(producto: Producto){
    const clienteDocumentReference = doc(
      this.firestore,
      `productos/${producto.id}`
    );
    return setDoc(clienteDocumentReference, { ...producto });
  }

  /*
  checkIfUsed(id: string){
   const checkIfInventario = collection(this.firestore, 'facturacion');
   const filteredData = query(checkIfInventario, where('producto', '==', id))
   return collectionData(filteredData, {idField: 'id'}) as Observable<Facturacion[]>;
  }
  */

  delete(id: string){
    const clienteDocumentReference = doc(
      this.firestore,
      `productos/${id}`
    );
    return deleteDoc(clienteDocumentReference);
  }
}
