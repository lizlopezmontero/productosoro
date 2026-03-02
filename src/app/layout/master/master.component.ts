import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UpdateService } from 'src/app/services/update.service';
import { UserService } from 'src/app/services/user.service';
import { TestServiceService } from 'src/app/test-service.service';

@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.scss']
})
export class MasterComponent implements OnInit {
  constructor(private service: UserService,private uService: UpdateService, private router: Router, private testService: TestServiceService){}
  ngOnInit(): void {
   // this.onTestService();
  }


  logout(){
    this.service.logout().then(response => this.router.navigate(['/login'])).catch(err => console.log(err));
  }

  update(){
    this.uService.doAppUpdate()
  }

  onTestService(){
    this.testService.getAll().subscribe(data => console.log(data))
  }
}
