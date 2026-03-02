import { Injectable } from '@angular/core';
import { HistoricoInventario } from '../modelos/historico-inventario';
import {
  collection,
} from '@firebase/firestore';
import { Firestore, collectionData, query, where, orderBy, limit } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryHistoryService {
  constructor(private readonly firestore: Firestore) { 
  }

  obtenerPorFecha(fecha: Date){
    const day = 60 * 60 * 24 * 1000;
    const endDate = new Date(fecha.getTime() + day)
    let qry = query(collection(this.firestore, 'historico-inventario'), where('fecha', '>=', fecha), where('fecha', '<', endDate));
    return collectionData(qry, {idField: 'id'}) as Observable<HistoricoInventario[]>;
  }

  obtenerPorProducto(producto: string){
    let qry = query(collection(this.firestore, 'historico-inventario'), where('codProducto', '==', producto), orderBy('fecha', 'desc'), limit(3));
    return collectionData(qry, {idField: 'id'}) as Observable<HistoricoInventario[]>;
  }
}
