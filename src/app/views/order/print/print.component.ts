import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Pedido } from 'src/app/modelos/pedido';
import { PrintService } from 'src/app/services/print.service';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss']
})
export class PrintComponent implements OnInit{
  pedidos: Pedido[] = [];
  lugares: string[] = [];
  fechas: Date[] = [];
  loading: boolean = false;

  constructor(private service: PrintService, private router: Router){
  }

  ngOnInit(): void {
    this.loading = true;
    this.service.currentFechas.subscribe(fs => {
      this.service.currentPedidos.subscribe(peds => {
        this.service.currentLugares.subscribe(lugs => {
          this.fechas = fs;
          this.pedidos = peds;
          this.lugares = lugs;
          this.loading = false;
          window.setTimeout(()=> { 
            window.print();
            window.setTimeout(() => { this.router.navigate(["/app/pedidos"])}, 500)
          }, 1000);
        });
      })
    })
    
  }

  printFechas(): string{
    const fechaInicio = this.fechas[0];
    const fechaFinal = this.fechas[1];
    return 'Del '+ fechaInicio.toDateString() + ' al ' + fechaFinal.toDateString();
  }
}
