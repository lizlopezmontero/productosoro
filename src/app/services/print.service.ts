import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Pedido } from '../modelos/pedido';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  private pedidosBehavihour = new BehaviorSubject([] as Pedido[]);
  private lugaresBehavihour = new BehaviorSubject([] as string[]);
  private fechasBehavihour = new BehaviorSubject([] as Date[]);

  currentPedidos = this.pedidosBehavihour.asObservable();
  currentLugares = this.lugaresBehavihour.asObservable();
  currentFechas = this.fechasBehavihour.asObservable();
  constructor() { }

  updatePedido(p: Pedido[], l: string[], f: Date[]){
    this.pedidosBehavihour.next(p);
    this.lugaresBehavihour.next(l);
    this.fechasBehavihour.next(f);
  }
}
