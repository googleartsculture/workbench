import { Subscription } from 'rxjs';
import { Settings } from '../settings/settings.model';
import { DataService } from '../../core/data/data.service';
import { Component, OnDestroy } from '@angular/core';
import { NotificationsService } from '../../core/notifications/notifications.service';
import { Project } from '../project/project.model';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnDestroy {

  loading = false;
  formData = {
    title: '',
    author: '',
    sourceTitle: '',
    sourceFile: null,
  };

  private componentSubs: Array<Subscription> = [];

  constructor (
    private dataService: DataService,
    private notificationsService: NotificationsService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.componentSubs.push(
      this.dataService.settingsObs.subscribe((settings: Settings) => {
        if (settings) {
          // Auto-fill author if known
          this.formData.author = settings.userFullName || '';
        }
      })
    );
  }

  ngOnDestroy () {
    this.componentSubs.forEach(sub => sub.unsubscribe());
  }

  onImageChange (imageFile: File): void {
    this.formData.sourceTitle = imageFile.name;
    this.formData.sourceFile = imageFile;
  }

  create (): void {
    this.loading = true;

    // Create project
    this.dataService.createProject({
      title: this.formData.title,
      author: this.formData.author,
    }, {
      title: this.formData.sourceTitle,
      file: this.formData.sourceFile,
    }).then((project: Project) => {
      this.notificationsService.success(`'${this.formData.title}' ` + this.translate.instant('MODULES.CREATE.TS.SUCCESS'));
      this.router.navigate(['project', project.id]);
    }, err => {
      this.loading = false;
      this.notificationsService.error(this.translate.instant('MODULES.CREATE.TS.ERROR'));
      console.warn(this.translate.instant('MODULES.CREATE.TS.WARN'), err);
    });
  }

}
