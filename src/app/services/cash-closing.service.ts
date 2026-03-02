import { Injectable } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  setDoc,
  collection,
  deleteDoc,
  doc
} from '@firebase/firestore';
import { Firestore, collectionData, docData, orderBy, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { CierreCaja } from '../modelos/cierre-caja';

@Injectable({
  providedIn: 'root'
})
export class CashClosingService {
  private cierreCajaCollection: CollectionReference<DocumentData>;

  constructor(private readonly firestore: Firestore) { 
    this.cierreCajaCollection = collection(this.firestore, 'cierre-caja');
  }

  getAll(){
    const qry = query(this.cierreCajaCollection, orderBy('orden'));
    return collectionData(qry, {idField: 'id'}) as Observable<CierreCaja[]>;
  }

  getAllVentas(){
    const qry = query(this.cierreCajaCollection, where('clasificacion', '==', 'Ventas'), orderBy('orden'));
    return collectionData(qry, {idField: 'id'}) as Observable<CierreCaja[]>;
  }

  getAllCompras(){
    const qry = query(this.cierreCajaCollection, where('clasificacion', '==', 'Salidas'), orderBy('orden'));
    return collectionData(qry, {idField: 'id'}) as Observable<CierreCaja[]>;
  }

  save(caja: CierreCaja){
    const lugarDocumentReference = doc(
      this.firestore,
      `cierre-caja/${caja.id}`
    );
    return setDoc(lugarDocumentReference, { ...caja });
  }

  delete(id: string){
    const lugarDocumentReference = doc(
      this.firestore,
      `cierre-caja/${id}`
    );
    return deleteDoc(lugarDocumentReference);
  }
}
