import { Injectable } from '@angular/core';
import {
  setDoc,
  collection,
  deleteDoc,
  doc,
} from '@firebase/firestore';
import { Firestore, where, query, getDocs, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Prestamo } from '../modelos/prestamo';
import { Vendedor } from '../modelos/vendedor';

@Injectable({
  providedIn: 'root'
})
export class CreditService {

  delete(id: string) {
    const creditDocumentReference = doc(
      this.firestore,
      `prestamos/${id}`
    );
    return deleteDoc(creditDocumentReference);
  }

  constructor(private readonly firestore: Firestore) { }

   getDataBySeller(vendedor: string, lugar: string){
    const mainQuery = collection(this.firestore, 'clientes');
    const data = query(mainQuery, where('vendedor', '==', vendedor))
    if(lugar){
      const filteredData = query(data, where('lugar', '==', lugar))
      return getDocs(filteredData)
    }
    var docs = getDocs(data)
    return docs
  }

  getSellers(){
    const mainQuery = collection(this.firestore, 'vendedores');
    return collectionData(mainQuery, {idField: 'id'}) as Observable<Vendedor[]>
  }

  getCredits(cli: string){
    const mainQuery = collection(this.firestore, 'prestamos');
    const data = query(mainQuery, where('cliente', '==', cli))
    return collectionData(data, {idField: 'id'}) as Observable<Prestamo[]>
  }

  getAllCredits(){
    const mainQuery = collection(this.firestore, 'prestamos');
    return collectionData(mainQuery, {idField: 'id'}) as Observable<Prestamo[]>
  }

  storeCredit(prestamo: Prestamo){
    const creditDocumentReference = doc(
      this.firestore,
      `prestamos/${prestamo.id}`
    );
    return setDoc(creditDocumentReference, { ...prestamo });
  }
}
