import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {

  constructor(private readonly update: SwUpdate) { 

  }

  doAppUpdate() {
    this.update.activateUpdate().then(() => document.location.reload());
  }

}
