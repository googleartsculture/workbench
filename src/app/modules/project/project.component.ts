import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from '../../core/data/data.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent  implements OnDestroy {

  private componentSubs: Array<Subscription> = [];

  constructor (
    private dataService: DataService,
    private route: ActivatedRoute,
  ) {
    this.componentSubs.push(
      this.route.params.subscribe((params) => {
        this.dataService.loadProject(params.id);
      })
    );
  }

  ngOnDestroy () {
    this.componentSubs.forEach(sub => sub.unsubscribe());
  }
}
