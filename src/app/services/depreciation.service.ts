import { Injectable } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  setDoc,
  collection,
  deleteDoc,
  doc,
} from '@firebase/firestore';
import { Firestore, collectionData, orderBy, query } from '@angular/fire/firestore';
import { Depreciacion } from '../modelos/depreciacion';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DepreciationService {

  private depreciacionCollection: CollectionReference<DocumentData>;

  constructor(private readonly firestore: Firestore) { 
    this.depreciacionCollection = collection(this.firestore, 'depreciacion');
  }

  getAll(){
    const qry = query(this.depreciacionCollection, orderBy('articulo'));
    return collectionData(qry, {idField: 'id'}) as Observable<Depreciacion[]>;
  }
  save(depreciacion: Depreciacion){
    const clienteDocumentReference = doc(
      this.firestore,
      `depreciacion/${depreciacion.id}`
    );
    return setDoc(clienteDocumentReference, { ...depreciacion });
  }
  delete(id: string){
    const depreciacionDocumentReference = doc(
      this.firestore,
      `depreciacion/${id}`
    );
    return deleteDoc(depreciacionDocumentReference);
  }
}
