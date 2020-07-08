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

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NotificationsService } from '../../core/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent {

  @Input() set imageFile(file: File) {
    if (file) {
      this.displayImage(file);
    }
  }
  @Output() loaded = new EventEmitter<Boolean>();

  public imageSrc = '';
  public imageWidth = '';
  public imageHeight = '';

  constructor (
    private notificationsService: NotificationsService,
    private translate: TranslateService
  ) {}

  /**
   * displayImage
   * @param {File} file
   */
  private displayImage (file: File): void {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const image = new Image();
      image.onload = () => {
        this.imageWidth = `${ image.width }px`;
        this.imageHeight = `${ image.height }px`;
        this.imageSrc = fileReader.result as string;
        this.loaded.emit(true);
      };
      image.src = fileReader.result as string;
    };
    fileReader.onerror = ((err) => {
      this.notificationsService.error(this.translate.instant('SHARED.IMAGE.ERROR', {file: file.name}));
      console.warn(this.translate.instant('SHARED.IMAGE.WARN', { file: file.name }), err);
      this.loaded.emit(false);
    });
    fileReader.readAsDataURL(file);
  }
}
