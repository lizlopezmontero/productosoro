import { Injectable } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  setDoc,
  collection,
  deleteDoc,
  doc,
} from '@firebase/firestore';
import { Firestore, collectionData, query, where, writeBatch } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Compras } from '../modelos/compras';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {

  private puchaseCollection: CollectionReference<DocumentData>;
  constructor(private readonly firestore: Firestore) { 
    this.puchaseCollection = collection(this.firestore, 'rubros-compras');
  }

  getAll(fecha: Date){
    //fecha.setHours(-6)
    const day = 60 * 60 * 24 * 1000;
    const endDate = new Date(fecha.getTime() + day)
    let qry = query(this.puchaseCollection, where('fecha', '>=', fecha), where('fecha', '<', endDate));

    return collectionData(qry, {idField: 'id'}) as Observable<Compras[]>;
  }

  save(compras: Compras[]){
    const batch = writeBatch(this.firestore);
    for(const item of compras){
      const docRef = doc(this.firestore, `rubros-compras/${item.id}`);
      batch.set(docRef, {...item});
    }
    return batch.commit();
  }

  delete(id: string){
    const documentReference = doc(
      this.firestore,
      `rubros-compras/${id}`
    );
    return deleteDoc(documentReference);
  }
}
