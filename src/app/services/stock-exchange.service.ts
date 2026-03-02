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
import { Bolsa } from '../modelos/bolsa';

@Injectable({
  providedIn: 'root'
})
export class StockExchangeService {

  private stockExchangeCollection: CollectionReference<DocumentData>;

  constructor(private firebase: Firestore) {
    this.stockExchangeCollection = collection(this.firebase, 'bolsas');
  }

  getAll() {
    return collectionData(this.stockExchangeCollection, { idField: 'id' }) as Observable<Bolsa[]>;
  }

  save(bolsa: Bolsa) {
    const document = doc(this.firebase, `bolsas/${bolsa.id}`);
    return setDoc(document, { ...bolsa });
  }

  delete(id: string) {
    const document = doc(this.firebase, `bolsas/${id}`);
    return deleteDoc(document);
  }
}
