import { NotificationsService } from './../../core/notifications/notifications.service';
import { DataService } from './../../core/data/data.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Project } from '../project/project.model';
import * as yaml from 'js-yaml';
import { ImportConfig } from './import.model';
import { TranslateService } from '@ngx-translate/core';
import { ProjectExport } from '../../core/data/data.model';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent {

  config: ImportConfig = {
    states: {
      loading: true,  // Page loading
      importing: false, // Import file uploaded
      saving: false,  // Save button hit
      importValid: false,
    },
    import: {
      file: null,
      data: null,
    }
  };

  formData = {
    title: '',
    author: '',
    sources: [],
  };

  constructor (
    private dataService: DataService,
    private notificationsService: NotificationsService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.config.states.loading = false;
  }

  onImport (): void {
    this.config.states.importing = true;
    this.config.states.importValid = false;
    this.loadImportData().then(() => {
      this.config.states.importing = false;
      this.config.states.importValid = true;
    }, (err) => {
      this.config.states.importing = false;
      this.config.states.importValid = false;
      this.notificationsService.error(this.translate.instant('MODULES.IMPORT.TS.ERROR.LOAD'));
    });
  }

  save (): void {
    this.config.states.saving = true;
    // Import project
    this.dataService.importProject(this.config.import.data).then((projectId: Project['id']) => {
      this.notificationsService.success(`'${this.config.import.data.project.properties.title}' ` + this.translate.instant('MODULES.IMPORT.TS.SUCCESS.IMPORT'));
      this.router.navigate(['project', projectId]);
    }, err => {
      this.config.states.saving = false;
      this.notificationsService.error(this.translate.instant('MODULES.IMPORT.TS.ERROR.UNKNOWN'));
      console.warn(this.translate.instant('MODULES.IMPORT.TS.WARN.IMPORT'), err);
    });
  }

  private loadImportData (): Promise<void> {
    return new Promise((resolve, reject) => {
      // Get raw data from file
      this.config.import.data = null;
      if (this.config.import.file) {
        // Get string from file
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
          // Convert to JS object
          try {
            this.config.import.data = yaml.safeLoad(fileReader.result) as ProjectExport;
          } catch (err) {
            reject(this.translate.instant('MODULES.IMPORT.TS.ERROR.PARSE') + ` "${ this.config.import.file.name }"`);
          }
          resolve();
        };
        fileReader.onerror = ((err) => {
          reject(this.translate.instant('MODULES.IMPORT.TS.ERROR.READ') + ` "${ this.config.import.file.name }"`);
        });
        fileReader.readAsText(this.config.import.file);
      } else {
        reject(this.translate.instant('MODULES.IMPORT.TS.ERROR.FIND'));
      }
    });
  }

}
