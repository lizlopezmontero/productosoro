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
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class TestServiceService {

  private testCollection: CollectionReference<DocumentData>;
  constructor(private readonly firestore: Firestore) { 
    this.testCollection = collection(this.firestore, 'prestatario');
  }
  getAll(){
    return collectionData(this.testCollection, {idField: 'id'}) as Observable<any>;
  }
}
