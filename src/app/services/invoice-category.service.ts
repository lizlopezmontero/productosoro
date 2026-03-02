import { Injectable } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  setDoc,
  collection,
  deleteDoc,
  doc,
} from '@firebase/firestore';
import { Firestore, collectionData, orderBy, query, writeBatch } from '@angular/fire/firestore';
import { CategoriaFacturacion } from '../modelos/categoria-facturacion';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvoiceCategoryService {

  private invoiceCategoriesCollection: CollectionReference<DocumentData>;

  constructor(private readonly firestore: Firestore) { 
    this.invoiceCategoriesCollection = collection(this.firestore, 'factura-categorias');
  }

  save(categoria: CategoriaFacturacion){
    const factCatDocumentReference = doc(
      this.firestore,
      `factura-categorias/${categoria.id}`
    );
    return setDoc(factCatDocumentReference, { ...categoria });
  }

  detete(id: string){
    const factCatDocumentReference = doc(
      this.firestore,
      `factura-categorias/${id}`
    );
    return deleteDoc(factCatDocumentReference);
  }

  getAll(){
    const qry = query(this.invoiceCategoriesCollection, orderBy('orden'));
    return collectionData(qry, {idField: 'id'}) as Observable<CategoriaFacturacion[]>;
  }
}
