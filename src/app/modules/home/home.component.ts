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

import { Subscription } from 'rxjs';
import { Component, OnDestroy } from '@angular/core';
import { filter, orderBy } from 'lodash';
import { ProjectListItem } from '../project/project.model';
import { DataService } from '../../core/data/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnDestroy {

  projectList: Array<ProjectListItem> = [];
  projectListFiltered: Array<ProjectListItem> = [];
  projectListLoaded = false;
  hideLoadingSpinner = false;

  private componentSubs: Array<Subscription> = [];

  constructor (
    private dataService: DataService,
    private router: Router,
  ) {
    this.componentSubs.push(
      this.dataService.projectListObs.subscribe((projectList: Array<ProjectListItem>) => {
        this.projectList = projectList;
        this.filterProjectList();

        if (!this.projectListLoaded && projectList !== null) {
          this.hideLoadingSpinner = true;
        }

        if (projectList.length) {
          this.projectListLoaded = true;
        }
      })
    );
  }

  ngOnDestroy () {
    this.componentSubs.forEach(sub => sub.unsubscribe());
  }

  filterProjectList (searchTerm: string = ''): void {
    if (searchTerm) {
      this.projectListFiltered = filter(this.projectList, (project: ProjectListItem) => {
        return project.title.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
      });
    } else {
      this.projectListFiltered = this.projectList;
    }
    this.projectListFiltered = orderBy(this.projectListFiltered, ['updated'], ['desc']);
  }

  openProject (project: ProjectListItem): void {
    this.router.navigate(['project', project.id]);
  }

}
