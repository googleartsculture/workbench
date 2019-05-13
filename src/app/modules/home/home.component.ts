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
