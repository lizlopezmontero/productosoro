import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './views/login/login.component';
import { ResetPasswordComponent } from './views/reset-password/reset-password.component';
import { MasterComponent } from './layout/master/master.component';
import { MainComponent } from './views/main/main.component';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { PlaceComponent } from './views/place/place.component';
import { ClientComponent } from './views/client/client.component';
import { CreditComponent } from './views/credit/credit.component';
import { ProductComponent } from './views/product/product.component';
import { RawMaterialComponent } from './views/raw-material/raw-material.component';
import { InvoiceComponent } from './views/invoice/invoice.component';
import { PendingChangesGuard } from './guards/pending-changes';
import { InventoryComponent } from './views/inventory/inventory.component';
import { CashClosingComponent } from './views/cash-closing/cash-closing.component';
import { SellReportComponent } from './views/sell-report/sell-report.component';
import { OrderComponent } from './views/order/order.component';

const routes: Routes = [
  {
    path: '', redirectTo: 'app/inicio', pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },
  {
    path: 'app',
    component: MasterComponent,
    children:[
      {
        path: 'inicio',
        component: MainComponent,
        ...canActivate(()=> redirectUnauthorizedTo(['/login']))
      },
      {
        path: 'lugares',
        component: PlaceComponent,
        ...canActivate(()=> redirectUnauthorizedTo(['/login']))
      },
      {
        path: 'clientes',
        component: ClientComponent,
        ...canActivate(()=> redirectUnauthorizedTo(['/login']))
      },
      {
        path: 'prestamos',
        component: CreditComponent,
        ...canActivate(()=> redirectUnauthorizedTo(['/login']))
      },
      {
        path: 'productos',
        component: ProductComponent,
        ...canActivate(()=> redirectUnauthorizedTo(['/login']))
      },
      {
        path: 'materia-prima',
        component: RawMaterialComponent,
        ...canActivate(()=> redirectUnauthorizedTo(['/login']))
      },
      {
        path: 'cierre-caja',
        component: CashClosingComponent,
        ...canActivate(()=> redirectUnauthorizedTo(['/login']))
      },
      {
        path: 'facturacion',
        component: InvoiceComponent,
        ...canActivate(()=> redirectUnauthorizedTo(['/login'])),
        canDeactivate: [PendingChangesGuard]
      },
      {
        path: 'inventario',
        component: InventoryComponent,
        ...canActivate(()=> redirectUnauthorizedTo(['/login'])),
        canDeactivate: [PendingChangesGuard]
      },
      {
        path: 'reporte-ventas',
        component: SellReportComponent,
        ...canActivate(()=> redirectUnauthorizedTo(['/login']))
      },
      {
        path: 'pedidos',
        component: OrderComponent,
        ...canActivate(()=> redirectUnauthorizedTo(['/login']))
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
