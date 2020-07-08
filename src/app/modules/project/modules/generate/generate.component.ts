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

import { Outlines } from './../../shared/workspace/outlines.effect';
import { Trace } from './../../shared/workspace/trace.effect';
import { WorkspaceComponent } from './../../shared/workspace/workspace.component';
import { Component, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { DataService } from './../../../../core/data/data.service';
import { WorkspaceSeed, WorkspaceData } from '../../shared/workspace/workspace.model';
import { ProjectAside } from '../../project.model';
import { GenerateConfig } from './generate.model';

@Component({
  selector: 'app-generate',
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.scss']
})
export class GenerateComponent {

  @ViewChild('workspace', {static: true}) private workspace: WorkspaceComponent;

  aside: ProjectAside = {
    active: true,
    loaded: false,
  };
  config: GenerateConfig = {
    effects: {
      loading: false,
      enabled: {
        drawing: true,
        trace: Trace.isEnabled(),
        outlines: Outlines.isEnabled(),
      }
    },
  };
  workspaceData: WorkspaceData['generate'];
  workspaceFacsimileData: WorkspaceData['facsimile'];

  private workspaceReadySub: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private workspaceReadyObs: Observable<boolean> = this.workspaceReadySub.asObservable();

  constructor (
    private dataService: DataService,
  ) {

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

  onWorkspaceReady () {
    this.workspaceReadySub.next(true);
  }

  workspaceInit (workspaceSeed: WorkspaceSeed) {
    this.workspace.init('generate', workspaceSeed);
  }

  workspaceUpdate (workspaceData: WorkspaceData): void {
    this.workspaceData = workspaceData.generate;
    this.workspaceFacsimileData = workspaceData.facsimile;
    this.config.effects.loading = false;
    this.aside.loaded = true;

  }

  onEffectChange (updateFacsimile: boolean = true): void {
    this.config.effects.loading = true;
    this.updateWorkspace(updateFacsimile);
  }

  clearDrawings (): void {
    this.workspace.deleteObjects(this.workspaceData.drawings);
  }

  private updateWorkspace (updateFacsimile: boolean = true): void {
    this.workspace.updateData(true, updateFacsimile);
    this.workspace.updateHistory();
  }
}
