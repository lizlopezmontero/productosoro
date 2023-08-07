import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import { SnacksColors } from 'src/app/enums/SnackBars';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  form = this.buildForm();
    isMobile = false;

    private subscriptions: Subscription[] = [];
    constructor(private breakpointObserver: BreakpointObserver,
                private formBuilder: FormBuilder, private service: UserService,
                private snack: MatSnackBar) { }

    ngOnInit(): void {
        this.subscriptions.push(this.breakpointObserver.observe([
            Breakpoints.XSmall,
            Breakpoints.Small,
            Breakpoints.Handset
        ]).subscribe(result => this.isMobile = result.matches));
        this.form = this.buildForm();
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    login(): void {
        if (this.form?.invalid) {
            this.form?.markAllAsTouched();
            return;
        }
        // TODO: make login call
        this.service.resetpassword(this.form.value).then((rest)=>{
          console.log(rest); this.showSnackbar('Correo enviado', SnacksColors.Success);
        }).catch(error =>{console.log(error); this.showSnackbar('Correo invalido', SnacksColors.Danger) });
    }

    showSnackbar(msj: string, type: SnacksColors){
      this.snack.open(msj, 'cerrar', {
        panelClass: [type]
      })
    }

    resetValue(fieldControlName: string): void {
        this.form?.get(fieldControlName)?.reset(null);
    }

    private buildForm(): FormGroup {
        return this.formBuilder.group({
            email: [ null, [ Validators.required, Validators.email ]]
        });
    }
}
