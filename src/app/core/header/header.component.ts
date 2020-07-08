// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
