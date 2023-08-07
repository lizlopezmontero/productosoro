import { Injectable } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  setDoc,
  collection,
  deleteDoc,
  doc
} from '@firebase/firestore';
import { Firestore, collectionData, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Lugar } from '../modelos/lugar';
import { Vendedor } from '../modelos/vendedor';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private lugaresCollection: CollectionReference<DocumentData>;
  private vendedoresCollection: CollectionReference<DocumentData>;

  constructor(private readonly firestore: Firestore) { 
    this.lugaresCollection = collection(this.firestore, 'lugares');
    this.vendedoresCollection = collection(this.firestore, 'vendedores');
  }

  getAll(){
    return collectionData(this.lugaresCollection, {idField: 'id'}) as Observable<Lugar[]>;
  }

  getVendedores(){
    return collectionData(this.vendedoresCollection, {idField: 'id'}) as Observable<Vendedor[]>;
  }

  save(lugar: Lugar){
    const lugarDocumentReference = doc(
      this.firestore,
      `lugares/${lugar.id}`
    );
    return setDoc(lugarDocumentReference, { ...lugar });
  }

  delete(id: string){
    const lugarDocumentReference = doc(
      this.firestore,
      `lugares/${id}`
    );
    return deleteDoc(lugarDocumentReference);
  }
}
