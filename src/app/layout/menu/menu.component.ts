import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit{
  constructor(private service: UserService, private router: Router){}

  ngOnInit(): void {
    
  }


  logout(){
    this.service.logout().then(response => this.router.navigate(['/login'])).catch(err => console.log(err));
  }
}
