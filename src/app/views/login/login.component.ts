import { UserService } from 'src/app/services/user.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { SnacksColors } from 'src/app/enums/SnackBars';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

    form = this.buildForm();
    isMobile = false;

    private subscriptions: Subscription[] = [];
    constructor(private breakpointObserver: BreakpointObserver,
                private formBuilder: FormBuilder, private service: UserService, private router: Router, private snack: MatSnackBar) { }

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

    showSnackbar(msj: string, type: SnacksColors){
        this.snack.open(msj, 'cerrar', {
          panelClass: [type]
        })
      }

    login(): void {
        if (this.form?.invalid) {
            this.form?.markAllAsTouched();
            return;
        }
        this.service.login(this.form.value).then(result=> {
            console.log(result);
            this.router.navigate(['/app/inicio'])
        }).catch(
            error => {
                console.log(error);
                this.showSnackbar('Usuario o clave incorrecto', SnacksColors.Danger)
                this.resetValue('password')
            }
        )
        // TODO: make login call
    }

    resetValue(fieldControlName: string): void {
        this.form?.get(fieldControlName)?.reset(null);
    }

    private buildForm(): FormGroup {
        return this.formBuilder.group({
            email: [ null, [ Validators.required, Validators.email ]],
            password: [ null, [ Validators.required ]]
        });
    }
}
