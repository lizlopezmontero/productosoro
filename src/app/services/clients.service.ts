import { Injectable } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  setDoc,
  collection,
  deleteDoc,
  doc,
} from '@firebase/firestore';
import { Firestore, collectionData, docData, query, where } from '@angular/fire/firestore';
import { Cliente } from '../modelos/cliente';
import { Observable } from 'rxjs';
import { Lugar } from '../modelos/lugar';
import { Prestamo } from '../modelos/prestamo';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  private clientesCollection: CollectionReference<DocumentData>;

  constructor(private readonly firestore: Firestore) { 
    this.clientesCollection = collection(this.firestore, 'clientes');
  }

  getAll(lugar: string = ''){
    if(lugar){
      const filteredData = query(this.clientesCollection, where('lugar', '==', lugar))
      return collectionData(filteredData, {idField: 'id'}) as Observable<Cliente[]>;
    }
    return collectionData(this.clientesCollection, {idField: 'id'}) as Observable<Cliente[]>;
  }
  

  getLugar(id: string){
    const lugarDoc = doc(this.firestore, `clientes/${id}`)
    return docData(lugarDoc, {idField: 'id'}) as Observable<Lugar>;
  }

  save(cliente: Cliente){
    const clienteDocumentReference = doc(
      this.firestore,
      `clientes/${cliente.id}`
    );
    return setDoc(clienteDocumentReference, { ...cliente });
  }

  checkIfUsed(id: string){
   const checkIfPrestamo = collection(this.firestore, 'prestamos');
   const filteredData = query(checkIfPrestamo, where('cliente', '==', id))
   return collectionData(filteredData, {idField: 'id'}) as Observable<Prestamo[]>;
  }

  delete(id: string){
    const clienteDocumentReference = doc(
      this.firestore,
      `clientes/${id}`
    );
    return deleteDoc(clienteDocumentReference);
  }
}
