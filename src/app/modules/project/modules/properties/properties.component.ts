import { UtilsService } from './../../../../core/utils/utils.service';
import { SourceStorage, SentenceStorage, WordStorage, GlyphStorage } from './../../../../core/storage/storage.model';
import { NotificationsService } from './../../../../core/notifications/notifications.service';
import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from './../../../../core/data/data.service';
import { Project } from '../../project.model';
import { WorkspaceSeed } from '../../shared/workspace/workspace.model';
import * as uuid from 'uuid';
import { Router } from '@angular/router';
import { pull, find, orderBy } from 'lodash';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TranslateService } from '@ngx-translate/core';
import { ProjectExport } from '../../../../core/data/data.model';
import { PropertiesConfig, PropertiesSource, GlyphDistribution, GlyphDistributionInfo } from './properties.model';

@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss']
})
export class PropertiesComponent implements OnDestroy {

  config: PropertiesConfig = {
    states: {
      loading: true,
      saving: false,
      saved: false,
      sourceChanged: false,
    },
  };
  formData: {
    properties: Project['properties'];
    sources: Array<PropertiesSource>;
  };
  sources: Array<SourceStorage> = [];
  project: Project;
  facsimile: WorkspaceSeed['facsimile']['generated'];
  sentences: WorkspaceSeed['sentences'];

  glyphDistribution: GlyphDistributionInfo = {
    active: false,
    count: 0,
    distributions: [],
  };

  private componentSubs: Array<Subscription> = [];

  constructor (
    private dataService: DataService,
    private notificationsService: NotificationsService,
    private utils: UtilsService,
    private router: Router,
    private ngxSmartModalService: NgxSmartModalService,
    private translate: TranslateService
  ) {
    this.formData = {
      properties: {
        title: '',
        author: '',
      },
      sources: [],
    };
    this.componentSubs.push(
      this.dataService.projectObs.subscribe((project: Project) => {
        this.project = project;
        this.updateProperties();
      }),
      this.dataService.workspaceSeedObs.subscribe((workspaceSeed: WorkspaceSeed) => {
        if (workspaceSeed) {
          this.sources = workspaceSeed.sources;
          this.facsimile = workspaceSeed.facsimile.generated;
          this.sentences = workspaceSeed.sentences;
          this.updateSources();
          this.updateGlyphDistribution();
        }
      })
    );
  }

  ngOnDestroy () {
    this.componentSubs.forEach(sub => sub.unsubscribe());
  }

  save () {
    this.config.states.saved = false;
    this.config.states.saving = true;

    // Prep properties
    this.project.properties = this.formData.properties;

    // Prep sources
    const sources = [];
    const promises: Array<Promise<void>> = [];
    this.formData.sources.forEach((formSource: PropertiesSource, i: number) => {
      if (formSource.file) {
        promises.push(
          this.utils.dataURLFromFile(formSource.file).then((dataURL: SourceStorage['dataURL']) => {
            // Create source file reference
            const source: SourceStorage = {
              id: formSource.id || uuid(),
              title: formSource.title,
              dataURL: dataURL,
            };
            sources[i] = source;
          })
        );
      }
    });

    Promise.all(promises).then(() => {
      this.dataService.saveProjectProperties(this.project, sources).then(() => {
        this.config.states.saved = true;
        this.config.states.saving = false;
        this.config.states.sourceChanged = false;
      }, (err) => {
        this.config.states.saved = false;
        this.config.states.saving = false;
        this.notificationsService.error(this.translate.instant('MODULES.PROJECT.MODULES.PROPERTIES.TS.ERROR'));
        console.warn(this.translate.instant('MODULES.PROJECT.MODULES.PROPERTIES.TS.WARN'), err);
      });
    }, (err) => {
      this.config.states.saved = false;
      this.config.states.saving = false;
      this.notificationsService.error(this.translate.instant('MODULES.PROJECT.MODULES.PROPERTIES.TS.ERROR'));
      console.warn(this.translate.instant('MODULES.PROJECT.MODULES.PROPERTIES.TS.WARN'), err);
    });

  }

  onSourceChange (file: File, source: PropertiesSource): void {
    source.title = file.name;
    source.file = file;
    this.config.states.sourceChanged = true;
  }

  addNewSource (): void {
    const source: PropertiesSource = {
      title: '',
      file: null,
      id: null,
    };
    this.formData.sources.unshift(source);
  }

  deleteSource (source: PropertiesSource): void {
    if (confirm(this.translate.instant('MODULES.PROJECT.MODULES.PROPERTIES.TS.CONFIRM_SRC'))) {
      this.formData.sources = pull(this.formData.sources, source);
      this.save();
    }
  }

  downloadFacsimile (): void {
    const modalId = 'facsimileDownloadModal';
    this.ngxSmartModalService.getModal(modalId).open();
    this.ngxSmartModalService.setModalData({ facsimile: this.facsimile }, modalId, true);
  }

  downloadExport (): void {
    const modalId = 'exportDownloadModal';
    this.dataService.exportProject(this.project.id).then((projectExport: ProjectExport) => {
      this.ngxSmartModalService.getModal(modalId).open();
      this.ngxSmartModalService.setModalData({ export: projectExport }, modalId, true);
    });
  }

  deleteProject (): void {
    if (confirm(this.translate.instant('MODULES.PROJECT.MODULES.PROPERTIES.TS.CONFIRM'))) {
      this.dataService.deleteProject(this.project.id).then(() => {
        this.notificationsService.success(this.translate.instant('MODULES.PROJECT.MODULES.PROPERTIES.TS.SUCCESS'));
        this.router.navigate(['/']);
      });
    }
  }

  private updateProperties (): void {
    if (this.project) {
      this.formData.properties = this.project.properties;
      this.config.states.loading = false;
    }
  }

  private updateSources (): void {
    this.formData.sources = [];
    this.sources.forEach(sourceStorage => {
      if (sourceStorage.dataURL) {
        this.utils.fileFromDataURL(sourceStorage.dataURL, sourceStorage.title).then((file: File) => {
          const source: PropertiesSource = {
            title: sourceStorage.title,
            file: file,
            id: sourceStorage.id || null,
          };
          this.formData.sources.push(source);
        });
      }
    });
  }

  private updateGlyphDistribution () {

    // Update info elements
    this.glyphDistribution.count = 0;

    this.sentences.forEach((sentence: SentenceStorage) => {
      sentence.words.forEach((word: WordStorage) => {
        word.glyphs.forEach((glyph: GlyphStorage) => {
          this.glyphDistribution.count++;
          this.addGlyphDistribution(glyph.gardinerCode);
        });
      });
    });
    this.glyphDistribution.distributions = orderBy(this.glyphDistribution.distributions, ['count', 'gardinerCode'], ['desc', 'asc']);
  }

  private addGlyphDistribution (gardinerCode: GlyphStorage['gardinerCode']): void {
    if (!gardinerCode) {
      const unknown: GlyphDistribution = find(this.glyphDistribution.distributions, { gardinerCode: 'Unknown' });
      if (unknown) {
        unknown.count++;
      } else {
        this.glyphDistribution.distributions.push({
          count: 1,
          gardinerCode: 'Unknown',
        } as GlyphDistribution);
      }
    } else {
      const distribution = find(this.glyphDistribution.distributions, { gardinerCode: gardinerCode });
      if (distribution) {
        distribution.count++;
      } else {
        this.glyphDistribution.distributions.push({
          count: 1,
          gardinerCode: gardinerCode,
        } as GlyphDistribution);
      }
    }
  }
}
