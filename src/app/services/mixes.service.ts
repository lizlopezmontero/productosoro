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
import { Mezcla, MezclasProducto } from '../modelos/mezclas';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MixesService {

  private mezclasCollection: CollectionReference<DocumentData>;
  private mezclasProductosCollection: CollectionReference<DocumentData>;

  constructor(private readonly firestore: Firestore) { 
    this.mezclasCollection = collection(this.firestore, 'mezclas');
    this.mezclasProductosCollection = collection(this.firestore, 'mezclas-productos');
  }

  getAll(){
    const qry = query(this.mezclasCollection, orderBy('nombre'));
    return collectionData(qry, {idField: 'id'}) as Observable<Mezcla[]>;
  }

  get(id: string){
    const qry = query(this.mezclasProductosCollection, where('mezcla', '==', id));
    return collectionData(qry, {idField: 'id'}) as Observable<MezclasProducto[]>;
  }

  getAllDetalles(){
    const qry = query(this.mezclasProductosCollection, orderBy('producto'));
    return collectionData(qry, {idField: 'id'}) as Observable<MezclasProducto[]>;
  }
  save(mezcla: Mezcla){
    const mezclasDocumentReference = doc(
      this.firestore,
      `mezclas/${mezcla.id}`
    );
    return setDoc(mezclasDocumentReference, { ...mezcla });
  }
  delete(id: string, detalles: MezclasProducto[]) {
    const batch = writeBatch(this.firestore);
    const mezclasDocumentReference = doc(
      this.firestore,
      `mezclas/${id}`
    );
    batch.delete(mezclasDocumentReference);
    detalles.forEach(d => {
      const mezclasDocumentReference = doc(
        this.firestore,
        `mezclas-productos/${d.id}`
      );
      batch.delete(mezclasDocumentReference);
    });
    return batch.commit();
  }

  saveDetalles(detalles: MezclasProducto){
    const mezclasDocumentReference = doc(
        this.firestore,
        `mezclas-productos/${detalles.id}`
      );
    return setDoc(mezclasDocumentReference, { ...detalles });
  }
  deleteDellates(id: string) {
    const mezclasDocumentReference = doc(
      this.firestore,
      `mezclas-productos/${id}`
    );
    return deleteDoc(mezclasDocumentReference);
  }
}
