import { Router, NavigationEnd, RouterEvent } from '@angular/router';
import { ApiService } from '../api/api.service';
import { Component } from '@angular/core';
import { DataService } from './../data/data.service';
import { last } from 'lodash';
import { Project } from '../../modules/project/project.model';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  currentProjectRoute: string;
  apiServicesEnabledCount = 0;
  project: Project;

  constructor (
    private dataService: DataService,
    private apiService: ApiService,
    private router: Router,
  ) {
    this.apiService.servicesEnabledObs.subscribe(servicesEnabled => {
      this.apiServicesEnabledCount = servicesEnabled.length;
    });

    this.dataService.projectObs.subscribe((project: Project) => {
      this.project = project;
    });

    this.router.events.pipe(
      filter((evt: RouterEvent) => evt instanceof NavigationEnd)
    ).subscribe((evt: NavigationEnd) => {
      if (evt.url.indexOf('project') !== -1) {
        this.currentProjectRoute = last(evt.url.split('/'));
      } else {
        this.currentProjectRoute = null;
      }
    });
  }

  public navigate (targetProjectRoute: string) {
    if (this.project && targetProjectRoute && targetProjectRoute !== this.currentProjectRoute) {
      this.router.navigate(['project', this.project.id, targetProjectRoute]);
    }
  }

}
