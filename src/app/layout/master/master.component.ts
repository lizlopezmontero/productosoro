import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UpdateService } from 'src/app/services/update.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.scss']
})
export class MasterComponent {
  constructor(private service: UserService,private uService: UpdateService, private router: Router){}


  logout(){
    this.service.logout().then(response => this.router.navigate(['/login'])).catch(err => console.log(err));
  }

  update(){
    this.uService.doAppUpdate()
  }
}
