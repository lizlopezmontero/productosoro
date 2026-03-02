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
import { CalculatorComponent } from './views/calculator/calculator.component';
import { PrintComponent } from './views/order/print/print.component';
import { SimulatedOrderComponent } from './views/simulated-order/simulated-order.component';
import { InvoiceCategoryComponent } from './views/invoice-category/invoice-category.component';
import { TaxReportComponent } from './views/tax-report/tax-report.component';
import { MixesComponent } from './views/mixes/mixes.component';
import { MixCalculatorService } from './services/mix-calculator.service';
import { MixCalculatorComponent } from './views/mix-calculator/mix-calculator.component';
import { DepreciationComponent } from './views/depreciation/depreciation.component';
import { PurchaseComponent } from './views/purchase/purchase.component';
import { StockExchangeComponent } from './views/stock-exchange/stock-exchange.component';
import { LabelComponent } from './views/label/label.component';
import { IncomeStatementComponent } from './views/income-statement/income-statement.component';
import { SellsByProductsComponent } from './views/sells-by-products/sells-by-products.component';

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
        path: 'pedidos/:id',
        component: OrderComponent,
        ...canActivate(()=> redirectUnauthorizedTo(['/login']))
      },
      {
        path: 'calculadora',
        component: CalculatorComponent,
        ...canActivate(()=> redirectUnauthorizedTo(['/login']))
      },
      {
        path: 'inventario-simulado',
        component: SimulatedOrderComponent,
        ...canActivate(()=> redirectUnauthorizedTo(['/login'])),
        canDeactivate: [PendingChangesGuard]
      },
      {
        path: 'categorias-factura',
        component: InvoiceCategoryComponent,
        ...canActivate(()=> redirectUnauthorizedTo(['/login']))
      },
      {
        path: 'reporte-impuestos',
        component: TaxReportComponent,
        ...canActivate(()=> redirectUnauthorizedTo(['/login']))
      },
      {
        path: 'mixes',
        component: MixesComponent,
        ...canActivate(()=> redirectUnauthorizedTo(['/login']))
      },
      {
        path: 'calculadora-mezclas',
        component: MixCalculatorComponent,
        ...canActivate(()=> redirectUnauthorizedTo(['/login']))
      },
      {
        path: 'depreciacion',
        component: DepreciationComponent,
        ...canActivate(()=> redirectUnauthorizedTo(['/login']))
      },
      {
        path: 'compras',
        component: PurchaseComponent,
        ...canActivate(()=> redirectUnauthorizedTo(['/login'])),
        canDeactivate: [PendingChangesGuard]
      },
      {
        path: 'bolsas',
        component: StockExchangeComponent,
        ...canActivate(()=> redirectUnauthorizedTo(['/login']))
      },
      {
        path: 'etiquetas',
        component: LabelComponent,
        ...canActivate(()=> redirectUnauthorizedTo(['/login']))
      },
      {
        path: 'estado-resultados',
        component: IncomeStatementComponent,
        ...canActivate(()=> redirectUnauthorizedTo(['/login']))
      },
      {
        path: 'ventas-productos',
        component: SellsByProductsComponent,
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
