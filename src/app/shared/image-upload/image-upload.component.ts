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

import { Component, Input, Output, HostListener, EventEmitter, ElementRef, HostBinding } from '@angular/core';
import * as loadImage from 'blueimp-load-image';
import { NotificationsService } from '../../core/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from '../../core/utils/utils.service';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {

  @Input() set imageFile(file: File) {
    if (file) {
      this.displayImage(file);
    }
  }
  @Input() set appImageUploadDisabled(val: boolean) {
    this.isDisabled = val;
  }
  @Output() imageFileChange = new EventEmitter<File>();

  @HostBinding('class.is-disabled') isDisabled = false;

  public dragOver = false;
  public dragHidden = false;
  public dragLoading = false;
  public dragDisabled = false;
  public imageSrc = '';
  public maxSize = 800;

  constructor(
    private el: ElementRef,
    private notificationService: NotificationsService,
    private translate: TranslateService,
    private utils: UtilsService,
  ) {
  }

  @HostListener('document: dragover', ['$event'])
  @HostListener('document: dragenter', ['$event'])
    public onDragOver(event: any): void {
      if (this.el.nativeElement.contains(event.target)) {
        this.dragOver = true;
        this.dragLoading = false;
        this.dragHidden = false;
        this.preventAndStopEventPropagation(event);
      }
    }

  @HostListener('document: dragleave', ['$event'])
  @HostListener('document: dragend', ['$event'])
  @HostListener('document: drop', ['$event'])
    public onDragLeave(event: any): void {
      if (this.el.nativeElement.contains(event.target)) {
        if (this.dragDisabled) {
          this.preventAndStopEventPropagation(event);
          return;
        }
        this.dragOver = false;
        if (event.type === 'drop' && event.dataTransfer.files.length !== 0) {
          const file: File = event.dataTransfer.files[0];
          loadImage.parseMetaData(file, (data) => {
            let orientation = 0;
            if (data.exif) {
              orientation = data.exif.get('Orientation');
            }
            const loadingImage = loadImage(
              file,
              (canvas) => {
                const dataUrl = canvas.toDataURL();
                this.imageSrc = dataUrl;
                this.utils.fileFromDataURL(dataUrl, file.name).then((finalFile) => {
                  this.imageFileChange.emit(finalFile);
                });
              }, {
                canvas: true,
                orientation: orientation
              }
            );
            loadingImage.onerror = () => {
              this.notificationService.error(this.translate.instant('SHARED.IMG_UPLOAD.TS.ERROR'));
              console.warn(this.translate.instant('SHARED.IMG_UPLOAD.TS.WARN'));
              this.imageSrc = '';
            };
          });
        }
        this.preventAndStopEventPropagation(event);
      }
    }

  public manualUpload (evt: any): void {
    // console.log('manualUpload(): ', evt);
    const fileList: FileList = evt.target.files;
    if (fileList.length !== 0) {
      const file: File = fileList[0];
      loadImage.parseMetaData(file, (data) => {
        let orientation = 0;
        if (data.exif) {
          orientation = data.exif.get('Orientation');
        }
        const loadingImage = loadImage(
          file,
          (canvas) => {
            const dataUrl = canvas.toDataURL();
            this.imageSrc = dataUrl;
            this.utils.fileFromDataURL(dataUrl, file.name).then((finalFile) => {
              this.imageFileChange.emit(finalFile);
            });
          }, {
            canvas: true,
            orientation: orientation
          }
        );
        loadingImage.onerror = () => {
          this.notificationService.error(this.translate.instant('SHARED.IMG_UPLOAD.TS.ERROR'));
          console.warn(this.translate.instant('SHARED.IMG_UPLOAD.TS.WARN'));
          this.imageSrc = '';
        };
      });
    }
  }

  private displayImage (file: File): Promise<File> {
    // console.log('displayImage(): ', file);

    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      this.dragLoading = true;
      fileReader.onload = (e) => {
        this.dragLoading = false;
        this.imageSrc = fileReader.result as string;
        resolve(file);
      };
      fileReader.onerror = ((err) => {
        reject(err);
      });
      fileReader.readAsDataURL(file);
    });
  }

  private preventAndStopEventPropagation(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }
}
