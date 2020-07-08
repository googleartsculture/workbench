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

import { WorkspaceSeed } from './../workspace/workspace.model';
import { NotificationsService } from './../../../../core/notifications/notifications.service';
import { UtilsService } from './../../../../core/utils/utils.service';
import { ProjectStorage } from './../../../../core/storage/storage.model';
import { Component } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-facsimile-download-modal',
  templateUrl: './facsimile-download-modal.component.html',
  styleUrls: ['./facsimile-download-modal.component.scss']
})
export class FacsimileDownloadModalComponent {

  config = {
    states: {
      loading: true,
    },
  };
  facsimile: WorkspaceSeed['facsimile']['generated'];

  private modalId = 'facsimileDownloadModal';

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
    if (modalData && modalData.facsimile) {
      this.facsimile = modalData.facsimile;
      this.config.states.loading = false;
    }
  }

  download (): void {
    this.utils.fileFromDataURL(this.facsimile.dataURL, 'facsimile_' + this.facsimile.id).then((file: File) => {
      this.utils.downloadFile(file).then(() => {
        this.ngxSmartModalService.close(this.modalId);
      }, () => {
        this.notificationsService.error(this.translate.instant('MODULES.PROJECT.SHARED.FACSIMILIE_MODAL.TS.ERROR'));
        console.warn(this.translate.instant('MODULES.PROJECT.SHARED.FACSIMILIE_MODAL.TS.WARN'), this.facsimile);
      });
    });
  }

}
