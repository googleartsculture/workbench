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
