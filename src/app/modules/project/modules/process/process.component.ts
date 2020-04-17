import { find, debounce } from 'lodash';
import { Area } from './../../shared/workspace/area.model';
import { Settings } from './../../../settings/settings.model';
import { WorkspaceComponent } from './../../shared/workspace/workspace.component';
import { Component, ViewChild, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, Subscription } from 'rxjs';
import { DataService } from './../../../../core/data/data.service';
import { WorkspaceSeed, WorkspaceData } from '../../shared/workspace/workspace.model';
import { ProjectAside } from '../../project.model';
import { Source } from '../../shared/workspace/source.model';

@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.scss'],
})
export class ProcessComponent implements OnDestroy {

  @ViewChild('workspace', {static: true}) private workspace: WorkspaceComponent;

  aside: ProjectAside = {
    active: true,
    loaded: false,
  };
  settings: Settings;
  workspaceData: WorkspaceData['process'];
  workspaceSources: Array<Source>;
  onEffectChange: () => any = debounce(this.onEffectChangeDebounced, 250, true);

  private componentSubs: Array<Subscription> = [];
  private workspaceReadySub: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private workspaceReadyObs: Observable<boolean> = this.workspaceReadySub.asObservable();

  constructor (
    private dataService: DataService,
  ) {

    this.componentSubs.push(
      this.dataService.settingsObs.subscribe((settings: Settings) => {
        this.settings = settings;
      })
    );

    // On load
    const loadSub = combineLatest([
      this.dataService.projectObs,
      this.dataService.workspaceSeedObs,
      this.workspaceReadyObs
    ]).subscribe(([project, workspaceSeed, workspaceReady]) => {
      if (project && workspaceSeed && workspaceReady) {
        this.workspaceInit(workspaceSeed);
        loadSub.unsubscribe();
      }
    });
  }

  ngOnDestroy () {
    this.componentSubs.forEach(sub => sub.unsubscribe());
  }

  onWorkspaceReady () {
    this.workspaceReadySub.next(true);
  }

  workspaceInit (workspaceSeed: WorkspaceSeed) {
    this.workspace.init('process', workspaceSeed);
  }

  workspaceUpdate (workspaceData: WorkspaceData): void {
    this.workspaceData = workspaceData.process;
    this.workspaceSources = workspaceData.sources;
    this.aside.loaded = true;
  }

  selectArea (area: Area): void {
    this.workspace.selectObjects([area]);
  }

  deleteArea (area: Area): void {
    this.workspace.deleteObjects([area]);
  }

  highlightArea (area: Area, state: boolean): void {
    this.workspace.highlightObjects([area], state);
  }

  onSourceChange (area: Area): void {
    area.updateImage(find(this.workspaceSources, { id: area.source })).then(() => {
      this.workspace.render();
      this.updateWorkspace();
    });
  }

  onEffectChangeDebounced (area: Area): void {
    area.updateImage(find(this.workspaceSources, { id: area.source })).then(() => {
      this.workspace.render();
      this.updateWorkspace();
    });
  }

  private updateWorkspace (): void {
    this.workspace.updateData();
    this.workspace.updateHistory();
  }

}
