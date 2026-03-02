import { Injectable } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  setDoc,
  collection,
  deleteDoc,
  doc,
} from '@firebase/firestore';
import { Firestore, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Etiqueta } from '../modelos/etiqueta';

@Injectable({
  providedIn: 'root'
})
export class LabelService {

  private labelCollection: CollectionReference<DocumentData>;
  constructor(private firebase: Firestore) {
    this.labelCollection = collection(this.firebase, 'etiquetas');
  }

  getAll() {
    return collectionData(this.labelCollection, { idField: 'id' }) as Observable<Etiqueta[]>;
  }

  save(etiqueta: Etiqueta) {
    const document = doc(this.firebase, `etiquetas/${etiqueta.id}`);
    return setDoc(document, { ...etiqueta });
  }

  delete(id: string) {
    const document = doc(this.firebase, `etiquetas/${id}`);
    return deleteDoc(document);
  }
}
