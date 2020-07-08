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

import { Settings } from './../../../settings/settings.model';
import { Annotation, AnnotationComment } from './../../shared/workspace/annotation.model';
import { WorkspaceComponent } from './../../shared/workspace/workspace.component';
import { Component, ViewChild, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { DataService } from './../../../../core/data/data.service';
import { WorkspaceSeed, WorkspaceData } from '../../shared/workspace/workspace.model';
import { ProjectAside } from '../../project.model';
import { AnnotateConfig } from './annotate.model';

@Component({
  selector: 'app-annotate',
  templateUrl: './annotate.component.html',
  styleUrls: ['./annotate.component.scss']
})
export class AnnotateComponent implements OnDestroy {

  @ViewChild('workspace', {static: true}) private workspace: WorkspaceComponent;

  aside: ProjectAside = {
    active: true,
    loaded: false,
  };
  settings: Settings;
  workspaceData: WorkspaceData['annotate'];
  config: AnnotateConfig = {
    editing: {
      active: false,
      object: null,
    }
  };

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
    this.workspace.init('annotate', workspaceSeed);
  }

  workspaceUpdate (workspaceData: WorkspaceData): void {
    this.workspaceData = workspaceData.annotate;
    this.aside.loaded = true;
  }

  addComment (annotation: Annotation, text: AnnotationComment['comment']): void {
    annotation.addComment(text, this.settings.userFullName);
    this.updateWorkspace();
  }

  deleteComment (annotation: Annotation, id: AnnotationComment['id']): void {
    annotation.deleteComment(id).then((success) => {
      if (success) {
        this.updateWorkspace();
      }
    });
  }

  selectAnnotation (annotation: Annotation): void {
    this.workspace.selectObjects([annotation]);
  }

  deleteAnnotation (annotation: Annotation): void {
    this.workspace.deleteObjects([annotation]);
  }

  highlightAnnotation (annotation: Annotation, state: boolean): void {
    this.workspace.highlightObjects([annotation], state);
  }

  editAnnotation (annotation: Annotation): void {
    this.config.editing.active = true;
    this.config.editing.object = annotation;
    this.selectAnnotation(annotation);
    this.workspace.panZoomToObject(annotation);
    this.workspace.editPolygonObject(annotation);
  }

  saveAnnotation (annotation: Annotation): void {
    this.config.editing.active = false;
    this.config.editing.object = null;
    this.workspace.saveEditedPolygonObject(annotation);
  }

  private updateWorkspace (): void {
    this.workspace.updateHistory();
    this.workspace.updateData();
  }
}
