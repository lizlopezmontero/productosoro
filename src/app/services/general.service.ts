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
import { Variable } from '../modelos/variable';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class GeneralService {


  private variablesCollection: CollectionReference<DocumentData>;

  constructor(private readonly firestore: Firestore) { 
    this.variablesCollection = collection(this.firestore, 'variables');
  }

  getVariable(id: string){
    const filteredData = query(this.variablesCollection, where('id', '==', id))
      return collectionData(filteredData, {idField: 'id'}) as Observable<Variable[]>;
  }

  saveVariable(variable: Variable){
    const variableDocumentReference = doc(
      this.firestore,
      `variables/${variable.id}`
    );
    return setDoc(variableDocumentReference, { ...variable });
  }

}
