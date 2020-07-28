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

import { Settings } from '../../modules/settings/settings.model';
import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { NotificationsService } from '../notifications/notifications.service';
import { ProjectStorage, SourceStorage, FacsimileStorage } from './storage.model';
import { projectListStorageSchema, projectStorageSchema, settingsStorageSchema, sourceStorageSchema, facsimileStorageSchema } from './storage.schema';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class StorageService {
  // https://developers.google.com/web/fundamentals/instant-and-offline/web-storage/indexeddb-best-practices

  constructor (
    private storage: StorageMap,
    private notificationsService: NotificationsService,
    private translate: TranslateService
  ) {
  }

  loadProjectList (): Promise<Array<ProjectStorage['id']>> {
    return this.storage.get('project-list', projectListStorageSchema)
      .toPromise()
      .then((data: Array<ProjectStorage['id']>) => {
        // If this does not exist yet then create it
        if (!data) {
          return [];
          // return this.storage.set('project-list', [''])
          //   .toPromise()
          //   .then(success => [], err => {
          //     this.errorHandler(err);
          //     return [];
          //   });
        }
        return data;
      }, err => {
        this.errorHandler(err);
        return [];
      });
  }

  saveProjectList (ids: Array<ProjectStorage['id']>): Promise<boolean> {
    return this.storage.set('project-list', ids)
      .toPromise()
      .catch(err => {
        this.errorHandler(err);
        return false;
      });
  }

  loadProject (id: ProjectStorage['id']): Promise<ProjectStorage> {

    return this.storage.get(`project:${ id }`, projectStorageSchema)
      .toPromise()
      .then((project: ProjectStorage) => {
        if (project) {
          return project;
        }
        this.errorHandler(this.translate.instant('CORE.STORAGE.ERROR.PROJECT', { id: id }));
        return null;
      }, err => {
        this.errorHandler(err);
        return null;
      });
  }

  saveProject (project: ProjectStorage): Promise<boolean> {
    return this.storage.set(`project:${ project.id }`, project)
      .toPromise()
      .catch(err => {
        console.error(err);
        this.errorHandler(err);
        return false;
      });
  }

  deleteProject (id: ProjectStorage['id']): Promise<boolean> {
    return this.storage.delete(`project:${ id }`)
      .toPromise()
      .catch(err => {
        this.errorHandler(err);
        return false;
      });
  }

  loadSource (id: SourceStorage['id']): Promise<SourceStorage> {
    return this.storage.get(`source:${ id }`, sourceStorageSchema)
      .toPromise()
      .then((source: SourceStorage) => {
        if (source) {
          return source;
        }
        this.errorHandler(this.translate.instant('CORE.STORAGE.ERROR.SOURCE', { id: id }));
        return null;
      }, err => {
        this.errorHandler(err);
        return null;
      });
  }

  saveSource (source: SourceStorage): Promise<boolean> {
    return this.storage.set(`source:${ source.id }`, source)
      .toPromise()
      .catch(err => {
        this.errorHandler(err);
        return false;
      });
  }

  deleteSource (id: SourceStorage['id']): Promise<boolean> {
    return this.storage.delete(`source:${ id }`)
      .toPromise()
      .catch(err => {
        this.errorHandler(err);
        return false;
      });
  }

  loadFacsimile (id: FacsimileStorage['id']): Promise<FacsimileStorage> {
    return this.storage.get(`facsimile:${ id }`, facsimileStorageSchema)
      .toPromise()
      .then((facsimile: FacsimileStorage) => {
        if (facsimile) {
          return facsimile;
        }
        this.errorHandler(this.translate.instant('CORE.STORAGE.ERROR.FACSIMILIE', { id: id }));
        return null;
      }, err => {
        this.errorHandler(err);
        return null;
      });
  }

  saveFacsimile (facsimile: FacsimileStorage): Promise<boolean> {
    return this.storage.set(`facsimile:${ facsimile.id }`, facsimile)
      .toPromise()
      .catch(err => {
        this.errorHandler(err);
        return false;
      });
  }

  deleteFacsimile (id: FacsimileStorage['id']): Promise<boolean> {
    return this.storage.delete(`facsimile:${ id }`)
      .toPromise()
      .catch(err => {
        this.errorHandler(err);
        return false;
      });
  }

  loadSettings (): Promise<Settings> {
    return this.storage.get(`settings`, settingsStorageSchema)
      .toPromise()
      .then((settings: Settings) => {
        if (settings) {
          return settings;
        }
        return null;
      }, err => {
        this.errorHandler(err);
        return null;
      });
  }

  saveSettings (settings: Settings): Promise<boolean> {
    return this.storage.set(`settings`, settings)
      .toPromise()
      .catch(err => {
        this.errorHandler(err);
        return false;
      });
  }

  private errorHandler (err): void {
    console.error(err);
    this.notificationsService.error(this.translate.instant('CORE.STORAGE.ERROR.STORAGE') + err);
    console.warn(this.translate.instant('CORE.STORAGE.ERROR.STORAGE'), err);
  }

}
