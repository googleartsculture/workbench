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

import { NotificationsService } from '../../../../core/notifications/notifications.service';
import { UtilsService } from '../../../../core/utils/utils.service';
import { Component } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TranslateService } from '@ngx-translate/core';
import * as yaml from 'js-yaml';
import { ProjectExport } from '../../../../core/data/data.model';

@Component({
  selector: 'app-export-download-modal',
  templateUrl: './export-download-modal.component.html',
  styleUrls: ['./export-download-modal.component.scss']
})
export class ExportDownloadModalComponent {

  config = {
    states: {
      loading: true,
    },
  };
  export: ProjectExport;

  private modalId = 'exportDownloadModal';

  constructor (
    public ngxSmartModalService: NgxSmartModalService,
    private utils: UtilsService,
    private notificationsService: NotificationsService,
    private translate: TranslateService
  ) {
  }

  onInit (): void {}

  onDataLoad (): void {
    this.config.states.loading = true;
    const modalData = this.ngxSmartModalService.getModalData(this.modalId);
    if (modalData && modalData.export) {
      this.export = modalData.export;
      this.config.states.loading = false;
    }
  }

  download (): void {
    let doc = null;

    try {
      doc = yaml.safeDump(this.export);
    } catch (e) {
      this.notificationsService.error(this.translate.instant('MODULES.PROJECT.SHARED.EXPORT_MODAL.TS.ERROR.YAML'));
      console.group(this.translate.instant('MODULES.PROJECT.SHARED.EXPORT_MODAL.TS.ERROR.YAML_2'));
      console.warn(this.translate.instant('MODULES.PROJECT.SHARED.EXPORT_MODAL.TS.ERROR.TYPE'), e);
      console.warn(this.translate.instant('MODULES.PROJECT.SHARED.EXPORT_MODAL.TS.ERROR.DATA'), this.export);
      console.groupEnd();
    }

    // Create YAML file
    if (doc) {
      const file = new File([doc], `${this.export.project.properties.title} export.yml`, { type: 'text/yaml' });
      if (file) {
        this.utils.downloadFile(file).then(() => {
          this.ngxSmartModalService.close(this.modalId);
        }, () => {
          this.notificationsService.error(this.translate.instant('MODULES.PROJECT.SHARED.EXPORT_MODAL.TS.ERROR.DOWNLOAD'));
          console.warn(this.translate.instant('MODULES.PROJECT.SHARED.EXPORT_MODAL.TS.WARN'), this.export);
        });
      } else {
        this.notificationsService.error(this.translate.instant('MODULES.PROJECT.SHARED.EXPORT_MODAL.TS.ERROR.DOWNLOAD'));
        console.warn(this.translate.instant('MODULES.PROJECT.SHARED.EXPORT_MODAL.TS.WARN'), this.export);
      }
    }
  }
}
