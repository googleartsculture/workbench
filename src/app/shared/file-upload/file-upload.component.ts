import { Component, Input, Output, HostListener, EventEmitter, ElementRef } from '@angular/core';
import * as yaml from 'js-yaml';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {

  @Input() set importFile(file: File) {
    if (file) {
      this.displayFile(file);
    }
  }
  @Output() importFileChange = new EventEmitter<File>();
  @Output() fileChange = new EventEmitter<File>();

  public dragOver = false;
  public dragHidden = false;
  public dragLoading = false;
  public dragDisabled = false;
  public imageSrc = '';
  public maxSize = 800;
  public errors = {
    type: false,
  };

  constructor(
    private el: ElementRef,
    private translate: TranslateService
  ) {}

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
        this.errors.type = false;
        if (event.type === 'drop' && event.dataTransfer.files.length !== 0) {
          const file: File = event.dataTransfer.files[0];
          if (file.type === 'text/yaml' || file.name.indexOf('.yml') !== -1) {
            this.displayFile(file).then(() => {
              // Send Blob to output
              this.importFileChange.emit(file);
              this.fileChange.emit();
            });
          } else {
            this.errors.type = true;
          }
        }
        this.preventAndStopEventPropagation(event);
      }
    }

  public manualUpload (evt: any): void {
    // console.log('manualUpload(): ', evt);
    const fileList: FileList = evt.target.files;
    if (fileList.length !== 0) {
      const file: File = fileList[0];
      this.displayFile(file).then(() => {
        // Send Blob to output
        this.importFileChange.emit(file);
        this.fileChange.emit();
      });
    }
  }

  private displayFile (file: File): Promise<File> {
    // console.log('displayFile(): ', file);
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      this.dragLoading = true;
      fileReader.onload = (e) => {
        this.dragLoading = false;
        // Convert to JS object
        try {
          yaml.safeLoad(fileReader.result);
        } catch (err) {
          reject(this.translate.instant('SHARED.FILE_UPLOAD.TS.ERROR.PARSE', { file: file.name }));
        }
        resolve(file);
      };
      fileReader.onerror = ((err) => {
        reject(this.translate.instant('SHARED.FILE_UPLOAD.TS.ERROR.READ', { file: file.name }));
      });
      fileReader.readAsText(file);
    });
  }

  private preventAndStopEventPropagation(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

}
