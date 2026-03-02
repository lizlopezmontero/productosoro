import { NgModule, CUSTOM_ELEMENTS_SCHEMA, isDevMode } from '@angular/core';
import { BrowserModule, HAMMER_GESTURE_CONFIG, HammerGestureConfig, HammerModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAnalytics,getAnalytics,ScreenTrackingService,UserTrackingService } from '@angular/fire/analytics';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideDatabase,getDatabase } from '@angular/fire/database';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { provideMessaging,getMessaging } from '@angular/fire/messaging';
import { provideRemoteConfig,getRemoteConfig } from '@angular/fire/remote-config';
import { provideStorage,getStorage } from '@angular/fire/storage';
import { LoginComponent } from './views/login/login.component';
import { MainComponent } from './views/main/main.component';
import { MasterComponent } from './layout/master/master.component';
import { MenuComponent } from './layout/menu/menu.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input';
import { ResetPasswordComponent } from './views/reset-password/reset-password.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatIconModule} from '@angular/material/icon'; 
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav'; 
import {MatTooltipModule} from '@angular/material/tooltip'; 
import {MatListModule} from '@angular/material/list'; 
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import {MatGridListModule} from '@angular/material/grid-list';
import { PlaceComponent } from './views/place/place.component'; 
import { TableModule } from 'primeng/table';
import {MatDialogModule} from '@angular/material/dialog'; 
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ChartModule } from 'primeng/chart';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ClientComponent } from './views/client/client.component';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { BlockUIModule } from 'primeng/blockui';
import { ServiceWorkerModule } from '@angular/service-worker';
import { CreditComponent } from './views/credit/credit.component';
import { PanelModule } from 'primeng/panel';
import { DividerModule } from 'primeng/divider';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ProductComponent } from './views/product/product.component';
import { RawMaterialComponent } from './views/raw-material/raw-material.component';
import { InvoiceComponent } from './views/invoice/invoice.component';
import { PendingChangesGuard } from './guards/pending-changes';
import { InventoryComponent } from './views/inventory/inventory.component';
import { CashClosingComponent } from './views/cash-closing/cash-closing.component';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { SellReportComponent } from './views/sell-report/sell-report.component';
import { OrderComponent } from './views/order/order.component';
import { CalculatorComponent } from './views/calculator/calculator.component';
import { PrintComponent } from './views/order/print/print.component';
import { SimulatedOrderComponent } from './views/simulated-order/simulated-order.component';
import { InvoiceCategoryComponent } from './views/invoice-category/invoice-category.component';
import { TaxReportComponent } from './views/tax-report/tax-report.component';
import { AccordionModule } from 'primeng/accordion';
import { MixesComponent } from './views/mixes/mixes.component';
import { MixCalculatorComponent } from './views/mix-calculator/mix-calculator.component';
import { DepreciationComponent } from './views/depreciation/depreciation.component';
import { PurchaseComponent } from './views/purchase/purchase.component';
import { StockExchangeComponent } from './views/stock-exchange/stock-exchange.component';
import { LabelComponent } from './views/label/label.component';
import { IncomeStatementComponent } from './views/income-statement/income-statement.component';
import { SellsByProductsComponent } from './views/sells-by-products/sells-by-products.component';

export class MyHammerConfig extends HammerGestureConfig {
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    MasterComponent,
    MenuComponent,
    ResetPasswordComponent,
    PlaceComponent,
    ClientComponent,
    CreditComponent,
    ProductComponent,
    RawMaterialComponent,
    InvoiceComponent,
    InventoryComponent,
    CashClosingComponent,
    SellReportComponent,
    OrderComponent,
    CalculatorComponent,
    PrintComponent,
    SimulatedOrderComponent,
    InvoiceCategoryComponent,
    TaxReportComponent,
    MixesComponent,
    MixCalculatorComponent,
    DepreciationComponent,
    PurchaseComponent,
    StockExchangeComponent,
    LabelComponent,
    IncomeStatementComponent,
    SellsByProductsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    MatExpansionModule,
    MatButtonModule,
    MatCardModule,
    MatGridListModule,
    MatFormFieldModule,
    MatMenuModule,
    MatInputModule,
    MatSnackBarModule,
    MatIconModule,
    BlockUIModule,
    MatListModule,
    MatTooltipModule,
    MatSidenavModule,
    MatToolbarModule,
    MatDialogModule,
    HttpClientModule,
    DialogModule,
    ToastModule,
    TableModule,
    ConfirmDialogModule,
    DropdownModule,
    InputTextModule,
    PanelModule,
    DividerModule,
    CalendarModule,
    InputNumberModule,
    RadioButtonModule,
    HammerModule,
    CheckboxModule,
    MultiSelectModule,
    AccordionModule,
    BreadcrumbModule,
    ChartModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAnalytics(() => getAnalytics()),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    provideMessaging(() => getMessaging()),
    provideRemoteConfig(() => getRemoteConfig()),
    provideStorage(() => getStorage()),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 20 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:20000'
    })
  ],
  providers: [
    ScreenTrackingService,UserTrackingService,
    { provide: HAMMER_GESTURE_CONFIG, useClass: MyHammerConfig },
    PendingChangesGuard
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
