import { Injectable } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  setDoc,
  collection,
  deleteDoc,
  doc,
} from '@firebase/firestore';
import { Firestore, collectionData, docData, orderBy, query, where, writeBatch } from '@angular/fire/firestore';
import { Categoria, Producto } from '../modelos/producto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  updateAll(productos: Producto[]) {
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
