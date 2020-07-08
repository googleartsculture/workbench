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

import { Annotation } from './../../modules/project/shared/workspace/annotation.model';
import { AnnotationStorage, ProjectStorage, SourceStorage, AreaStorage, FacsimileStorage, DrawingStorage, SentenceStorage, WordStorage, GlyphStorage } from './../storage/storage.model';
import { Area } from './../../modules/project/shared/workspace/area.model';
import { AreaSeed, ProjectExport } from './data.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { Drawing } from './../../modules/project/shared/workspace/drawing.model';
import { environment } from '../../../environments/environment';
import { every, includes, find, uniq, without } from 'lodash';
import { Glyph } from '../../modules/project/shared/workspace/glyph.model';
import { Injectable } from '@angular/core';
import { NotificationsService } from './../notifications/notifications.service';
import { Project, ProjectListItem } from '../../modules/project/project.model';
import { Sentence } from '../../modules/project/shared/workspace/sentence.model';
import { Settings } from '../../modules/settings/settings.model';
import { Source } from './../../modules/project/shared/workspace/source.model';
import { StorageService } from './../storage/storage.service';
import { TranslateService } from '@ngx-translate/core';
import { UtilsService } from '../utils/utils.service';
import { Word } from '../../modules/project/shared/workspace/word.model';
import { WorkspaceData, WorkspaceSeed, WorkspacePosition, WorkspaceConfig } from './../../modules/project/shared/workspace/workspace.model';
import * as uuid from 'uuid';

@Injectable()
export class DataService {

  private settingsSub: BehaviorSubject<Settings> = new BehaviorSubject(null);
  settingsObs: Observable<Settings> = this.settingsSub.asObservable();

  private projectList: Array<ProjectListItem> = [];
  private projectListSub: BehaviorSubject<Array<ProjectListItem>> = new BehaviorSubject(this.projectList);
  projectListObs: Observable<Array<ProjectListItem>> = this.projectListSub.asObservable();

  private project: Project = null;
  private projectSub: BehaviorSubject<Project> = new BehaviorSubject(this.project);
  projectObs: Observable<Project> = this.projectSub.asObservable();

  private workspaceSeed: WorkspaceSeed = null;
  private workspaceSeedSub: BehaviorSubject<WorkspaceSeed> = new BehaviorSubject(this.workspaceSeed);
  workspaceSeedObs: Observable<WorkspaceSeed> = this.workspaceSeedSub.asObservable();

  constructor (
    private storage: StorageService,
    private utils: UtilsService,
    private notificationsService: NotificationsService,
    private translation: TranslateService
  ) {
  }

  init (): void {
    this.loadProjectList();
    this.loadSettings();
  }

  saveSettings (settings: Settings): Promise<boolean> {
    return this.storage.saveSettings(settings).then((success: boolean) => {
      if (success) {
        this.settingsSub.next(settings);
      }
      return success;
    });
  }

  loadProject (id: Project['id']): Promise<void> {
    this.nullifyProject();

    return new Promise((resolve, reject) => {
      this.storage.loadProject(id).then((projectStorage: ProjectStorage) => {

        // Build main project
        const project: Project = {
          id: projectStorage.id,
          created: projectStorage.created,
          updated: projectStorage.updated,
          properties: projectStorage.properties,
        };

        this.buildWorkspaceSeed(projectStorage).then(workspaceSeed => {
          resolve();  // Needs to be before the observables below fire
          this.project = project;
          this.workspaceSeed = workspaceSeed;
          this.projectSub.next(project);
          this.workspaceSeedSub.next(workspaceSeed);
        });

      });
    });
  }

  exportProject (id: Project['id']): Promise<ProjectExport> {
    const projectExport: ProjectExport = {
      project: null,
      files: {
        sources: [],
        facsimiles: [],
      },
    };
    return new Promise((resolve, reject) => {
      this.storage.loadProject(id).then((projectStorage: ProjectStorage) => {
        projectExport.project = projectStorage;

        const loadPromises: Array<Promise<boolean>> = [];

        // Load source files from storage
        projectStorage.sources.forEach((sourceId: SourceStorage['id']) => {
          loadPromises.push(
            this.storage.loadSource(sourceId).then((sourceStorage: SourceStorage) => {
              projectExport.files.sources.push(sourceStorage);
              return true;
            }, err => false)
          );
        });

        // Load facsimile files from storage
        if (projectStorage.facsimile.processed) {
          loadPromises.push(
            this.storage.loadFacsimile(projectStorage.facsimile.processed).then((facsimileStorage: FacsimileStorage) => {
              projectExport.files.facsimiles.push(facsimileStorage);
              return true;
            }, err => false),
          );
        }
        if (projectStorage.facsimile.generated) {
          loadPromises.push(
            this.storage.loadFacsimile(projectStorage.facsimile.generated).then((facsimileStorage: FacsimileStorage) => {
              projectExport.files.facsimiles.push(facsimileStorage);
              return true;
            }, err => false),
          );
        }

        // Lets do this...
        Promise.all(loadPromises).then(resolutions => {
          if (every(resolutions)) {
            resolve(projectExport);
          } else {
            console.warn(this.translation.instant('CORE.DATA.WARN.EXPORT'), resolutions);
            reject();
          }
        });
      });
    });
  }

  saveProject (project: Project, workspaceData: WorkspaceData, workspaceType?: WorkspaceConfig['type'], isNewProject: boolean = false, newSources?: Array<SourceStorage>): Promise<boolean> {

    return new Promise((resolve, reject) => {
      // Create main project storage
      const projectStorage: ProjectStorage = {
        id: project.id,
        created: project.created,
        updated: new Date().getTime(),
        appVersion: environment.appVersion || 'unknown',
        properties: {
          title: project.properties.title,
          author: project.properties.author,
        },
        sources: [],
        facsimile: {
          processed: null,
          generated: null,
        },
        drawings: [],
        effects: workspaceData && workspaceData.facsimile && workspaceData.generate.effects ? workspaceData.generate.effects : {
          trace: {
            active: false,
            level: 128,
          },
          outlines: {
            active: false,
            level: 16,
          },
          drawing: {
            active: false,
            width: 3,
          },
        },
        annotations: [],
        areas: [],
        sentences: [],
      };

      const sources: Array<SourceStorage> = [];
      let processedFacsimile: FacsimileStorage = null;
      let generatedFacsimile: FacsimileStorage = null;
      const saveSetupPromises = [];

      if (isNewProject) {

        // Seperate out source files
        saveSetupPromises.push(
          new Promise(pass => {
            newSources.forEach((source: SourceStorage) => {
              // Save source storage object
              sources.push(source);
              // Create reference in project storage
              projectStorage.sources.push(source.id);
            });
            pass();
          })
        );

      } else {

        saveSetupPromises.push(
          new Promise(pass => {
            // Get current project
            this.storage.loadProject(projectStorage.id).then((oldProjectStorage: ProjectStorage) => {

              // Compare/update sources
              const sourceIds = [];
              // Remove any that are not present in new source list
              oldProjectStorage.sources.forEach(oldSourceId => {
                if (!find(workspaceData.sources, { id: oldSourceId })) {
                  this.storage.deleteSource(oldSourceId);
                } else {
                  sourceIds.push(oldSourceId);
                }
              });
              // Build/add any that are new
              workspaceData.sources.forEach((source: Source) => {
                if (!find(oldProjectStorage.sources, source.id)) {
                  // Create source storage object
                  const oldOpacity = source.opacity;
                  source.opacity = 1; // Ensure source is visible!
                  sources.push({
                    id: source.id,
                    title: source.title,
                    dataURL: source.toDataURL({}),
                  });
                  source.opacity = oldOpacity;
                  // Create reference in project storage
                  sourceIds.push(source.id);
                }
              });
              projectStorage.sources = uniq(sourceIds);

              // Compare/update processed facsimile
              if (workspaceData.facsimile.processed) {
                if (workspaceData.facsimile.processed.id !== oldProjectStorage.facsimile.processed) {
                  // Processed facsimile has changed, delete old one
                  this.storage.deleteFacsimile(oldProjectStorage.facsimile.processed);
                }
                // Either way save the new one
                const oldOpacity = workspaceData.facsimile.processed.opacity;
                workspaceData.facsimile.processed.opacity = 1; // Ensure facimile is visible!
                processedFacsimile = {
                  id: workspaceData.facsimile.processed.id,
                  dataURL: workspaceData.facsimile.processed.toDataURL({}),
                };
                workspaceData.facsimile.processed.opacity = oldOpacity;
                projectStorage.facsimile.processed = processedFacsimile.id;
              }

              // Compare/update generated facsimile
              if (workspaceData.facsimile.generated) {
                if (workspaceData.facsimile.generated.id !== oldProjectStorage.facsimile.generated) {
                  // generated facsimile has changed, delete old one
                  this.storage.deleteFacsimile(oldProjectStorage.facsimile.generated);
                }
                // Either way save the new one
                const oldOpacity = workspaceData.facsimile.generated.opacity;
                workspaceData.facsimile.generated.opacity = 1; // Ensure facimile is visible!
                generatedFacsimile = {
                  id: workspaceData.facsimile.generated.id,
                  dataURL: workspaceData.facsimile.generated.toDataURL({}),
                };
                workspaceData.facsimile.generated.opacity = oldOpacity;
                projectStorage.facsimile.generated = generatedFacsimile.id;
              }

              // Compare/update areas (if contained in save data)
              if (workspaceType === 'process') {
                workspaceData.process.areas.forEach((area: Area) => {
                  const areaStorage: AreaStorage = {
                    author: area.author,
                    created: area.created,
                    source: area.source,
                    effects: [],
                    position: {
                      top: area.top,
                      left: area.left,
                      width: area.width,
                      height: area.height,
                    },
                  };

                  // Convert effects to array form for safe, cross version, saving
                  for (const val in area.effects) {
                    if (area.effects[val]) {
                      const effect = area.effects[val];
                      areaStorage.effects.push(effect);
                    }
                  }

                  projectStorage.areas.push(areaStorage);
                });
              } else {
                projectStorage.areas = oldProjectStorage.areas;
              }

              // Compare/update drawings (if contained in save data)
              if (workspaceType === 'generate') {
                workspaceData.generate.drawings.forEach((drawing: Drawing) => {
                  const oldOpacity = drawing.opacity;
                  drawing.opacity = 1; // Ensure facimile is visible!
                  const drawingStorage: DrawingStorage = {
                    author: drawing.author,
                    created: drawing.created,
                    position: {
                      top: drawing.top,
                      left: drawing.left,
                      width: drawing.width,
                      height: drawing.height,
                    },
                    dataURL: drawing.getElement().src || drawing.toDataURL({}),
                  };
                  drawing.opacity = oldOpacity;
                  projectStorage.drawings.push(drawingStorage);
                });
              } else {
                projectStorage.drawings = oldProjectStorage.drawings;
              }

              // Compare/update sentences (if contained in save data)
              if (workspaceType === 'analyse') {
                workspaceData.analyse.sentences.forEach((sentence: Sentence) => {

                  // Build this sentence
                  const sentenceStorage: SentenceStorage = {
                    author: sentence.author,
                    created: sentence.created,
                    words: [],
                    position: {
                      top: sentence.top,
                      left: sentence.left,
                      width: sentence.width,
                      height: sentence.height,
                    },
                    order: sentence.order,
                    interpretation: sentence.interpretation,
                    transliteration: sentence.transliteration,
                  };

                  // Build words in this sentence
                  sentence.getWords().forEach((word: Word) => {

                    // Build this word
                    const wordStorage: WordStorage = {
                      author: word.author,
                      created: word.created,
                      glyphs: [],
                      position: {
                        top: word.top,
                        left: word.left,
                        width: word.width,
                        height: word.height,
                      },
                      isCartouche: word.isCartouche,
                      order: word.order,
                      translation: word.translation,
                      transliteration: word.transliteration,
                    };

                    // Build glyphs in this word
                    word.getGlyphs().forEach((glyph: Glyph) => {

                      // Build this glyph
                      const glyphStorage: GlyphStorage = {
                        author: glyph.author,
                        created: glyph.created,
                        points: glyph.points,
                        gardinerCode: glyph.gardinerCode,
                        gardinerCodePredictions: glyph.gardinerCodePredictions,
                        order: glyph.order,
                        locked: glyph.locked,
                      };
                      wordStorage.glyphs.push(glyphStorage);
                    });

                    sentenceStorage.words.push(wordStorage);
                  });

                  projectStorage.sentences.push(sentenceStorage);
                });
              } else {
                projectStorage.sentences = oldProjectStorage.sentences;
              }

              // Compare/update annotations (if contained in save data)
              if (workspaceType === 'annotate') {
                workspaceData.annotate.annotations.forEach((annotation: Annotation) => {
                  projectStorage.annotations.push({
                    author: annotation.author,
                    created: annotation.created,
                    comments: annotation.comments,
                    points: annotation.points,
                  } as AnnotationStorage);
                });
              } else {
                projectStorage.annotations = oldProjectStorage.annotations;
              }

              pass();
            });
          })
        );
      }

      Promise.all(saveSetupPromises).then(() => {

        // Begin save procedures
        const savePromises: Array<Promise<boolean>> = [];

        // Save sources
        sources.forEach((source: SourceStorage) => {
          savePromises.push(this.storage.saveSource(source));
        });

        // Save processed facsimile
        if (processedFacsimile) {
          savePromises.push(this.storage.saveFacsimile(processedFacsimile));
        }

        // Save generated facsimile
        if (generatedFacsimile) {
          savePromises.push(this.storage.saveFacsimile(generatedFacsimile));
        }

        // Save project
        savePromises.push(this.storage.saveProject(projectStorage));

        // Update workspace seed
        savePromises.push(
          this.buildWorkspaceSeed(projectStorage).then(workspaceSeed => {
            this.workspaceSeed = workspaceSeed;
            this.workspaceSeedSub.next(workspaceSeed);
            return true;
          }, () => false)
        );

        // Update project list
        savePromises.push(this.addToProjectList(projectStorage.id));

        // Lets do this...
        Promise.all(savePromises).then(resolutions => {
          if (every(resolutions)) {
            this.loadProjectList();
            resolve();
          } else {
            console.warn(this.translation.instant('CORE.DATA.WARN.SAVE'), resolutions);
            reject();
          }
        });
      });

    });
  }

  saveProjectProperties (project: Project, sources: Array<SourceStorage>): Promise<void> {
    // console.log('saveProjectProperties(): ', project, sources);
    return new Promise((resolve, reject) => {

      this.storage.loadProject(project.id).then((projectStorage: ProjectStorage) => {
        // Update project properties
        projectStorage.properties = project.properties;

        // Update project sources
        const sourcePromises: Array<Promise<boolean>> = [];
        projectStorage.sources = [];
        sources.forEach((source: SourceStorage) => {
          projectStorage.sources.push(source.id);
          sourcePromises.push(this.storage.saveSource(source));
        });

        Promise.all(sourcePromises).then(() => {
          // Save changes back to storage
          this.storage.saveProject(projectStorage).then(() => {
            // Trigger full load of project
            this.loadProject(project.id).then(resolve, reject);
          }, reject);
        }, reject);

      });
      resolve();
    });
  }

  createProject (projectProperties: Project['properties'], fileData: { title: SourceStorage['title'], file: File }): Promise<Project | Error> {
    // console.warn('createProject(): ', projectProperties, fileData);

    this.nullifyProject();

    return new Promise((resolve, reject) => {
      this.utils.dataURLFromFile(fileData.file).then((dataURL: SourceStorage['dataURL']) => {

        // Build main project
        const time = new Date().getTime();
        const project: Project = {
          id: uuid(), // Create uuid (RFC 4122 version 4)
          properties: {
            title: projectProperties.title,
            author: projectProperties.author,
          },
          created: time,
          updated: time,
        };

        // Create source file reference
        const source: SourceStorage = {
          id: uuid(),
          title: fileData.title,
          dataURL: dataURL,
        };

        this.saveProject(project, null, null, true, [source]).then(() => {
          this.project = project;
          this.projectSub.next(project);
          resolve(project);
        }, err => {
          this.notificationsService.error(this.translation.instant('CORE.DATA.ERROR.CREATE'));
          reject(err);
        });
      }, err => {
        this.notificationsService.error(this.translation.instant('CORE.DATA.ERROR.CREATE'));
        reject(err);
      });
    });
  }

  importProject (projectImport: ProjectExport): Promise<Project['id'] | Error> {
    return new Promise((resolve, reject) => {
      const importPromises: Array<Promise<void>> = [];

      // Ensure this new project has new id/datetimes
      projectImport.project.id = uuid();
      projectImport.project.created = new Date().getTime();
      projectImport.project.updated = new Date().getTime();

      // Begin saving data/files
      importPromises.push(this.saveProjectData(projectImport.project));
      projectImport.files.sources.forEach((sourceStorage: SourceStorage) => {
        importPromises.push(this.saveSourceFile(sourceStorage));
      });
      projectImport.files.facsimiles.forEach((facsimileStorage: FacsimileStorage) => {
        importPromises.push(this.saveFacsimileFile(facsimileStorage));
      });

      // Load project from storage once complete
      Promise.all(importPromises).then(() => {
        this.addToProjectList(projectImport.project.id);
        resolve(projectImport.project.id);
      }, err => {
        reject(this.translation.instant('CORE.DATA.ERROR.SAVE'));
        console.warn(this.translation.instant('CORE.DATA.WARN.SAVE'), err);
      });
    });
  }

  deleteProject (id: Project['id']): Promise<void | string> {
    return new Promise((resolve, reject) => {

      // Get latest project data form storage
      this.storage.loadProject(id).then((projectStorage: ProjectStorage) => {
        const deletePromises: Array<Promise<boolean | void>> = [];

        // Delete all source files
        projectStorage.sources.forEach((sourceId: SourceStorage['id']) => {
          deletePromises.push(this.deleteSourceFile(sourceId));
        });

        // Delete all facsimile files
        deletePromises.push(this.deleteFacsimileFile(projectStorage.facsimile.processed));
        deletePromises.push(this.deleteFacsimileFile(projectStorage.facsimile.generated));

        // Delete main project data
        deletePromises.push(this.deleteProjectData(projectStorage.id));

        // Update project list
        deletePromises.push(this.removeFromProjectList(projectStorage.id));

        Promise.all(deletePromises).then(() => {
          this.nullifyProject();
          this.loadProjectList();
          resolve();
        }, err => {
          console.warn(this.translation.instant('CORE.DATA.WARN.DELETE'), err);
          reject(this.translation.instant('CORE.DATA.ERROR.DELETE'));
        });

      });

    });
  }

  updateWorkspacePosition (position: WorkspacePosition): void {
    this.workspaceSeed.position = position;
    this.workspaceSeedSub.next(this.workspaceSeed);
  }

  private saveProjectData (project: ProjectStorage): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.saveProject(project).then((success: boolean) => {
        if (success) {
          resolve();
        } else {
          reject();
        }
      });
    });
  }

  private saveSourceFile (sourceStorage: SourceStorage): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.saveSource(sourceStorage).then((success: boolean) => {
        if (success) {
          resolve();
        } else {
          reject();
        }
      });
    });
  }

  private saveFacsimileFile (facsimileStorage: FacsimileStorage): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.saveFacsimile(facsimileStorage).then((success: boolean) => {
        if (success) {
          resolve();
        } else {
          reject();
        }
      });
    });
  }

  private deleteProjectData (id: SourceStorage['id']): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.deleteProject(id).then((success: boolean) => {
        if (success) {
          resolve();
        } else {
          reject();
        }
      });
    });
  }

  private deleteSourceFile (id: SourceStorage['id']): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.deleteSource(id).then((success: boolean) => {
        if (success) {
          resolve();
        } else {
          reject();
        }
      });
    });
  }

  private deleteFacsimileFile (id: FacsimileStorage['id']): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.deleteFacsimile(id).then((success: boolean) => {
        if (success) {
          resolve();
        } else {
          reject();
        }
      });
    });
  }

  private buildWorkspaceSeed (projectStorage: ProjectStorage): Promise<WorkspaceSeed> {

    return new Promise((resolve, reject) => {

      // Build workspace seed data
      const workspaceSeed: WorkspaceSeed = {
        sources: [],
        facsimile: {
          processed: null,
          generated: null,
        },
        drawings: projectStorage.drawings,
        effects: projectStorage.effects,
        annotations: projectStorage.annotations || [],
        sentences: projectStorage.sentences || [],
        areas: [],
        position: this.workspaceSeed ? this.workspaceSeed.position : {
          x: 0,
          y: 0,
          zoom: 1,
        },
      };

      // Convert area effects back to object form for use in-app
      projectStorage.areas.forEach((areaStorage: AreaStorage) => {
        const areaSeed: AreaSeed = {
          author: areaStorage.author,
          created: areaStorage.created,
          source: areaStorage.source,
          effects: {
            threshold: null,
          },
          position: {
            top: areaStorage.position.top,
            left: areaStorage.position.left,
            width: areaStorage.position.width,
            height: areaStorage.position.height,
          },
        };

        if (areaStorage.effects) {
          areaStorage.effects.forEach((effect) => {
            areaSeed.effects[effect.tid] = effect;
          });
        }

        workspaceSeed.areas.push(areaSeed);
      });

      const loadPromises: Array<Promise<boolean>> = [];

      // Load source files from storage
      projectStorage.sources.forEach((sourceId: SourceStorage['id']) => {
        loadPromises.push(
          this.storage.loadSource(sourceId).then((sourceStorage: SourceStorage) => {
            workspaceSeed.sources.push({
              id: sourceStorage.id,
              title: sourceStorage.title,
              dataURL: sourceStorage.dataURL,
            });
            return true;
          }, err => false)
        );
      });

      // Load facsimile files from storage
      if (projectStorage.facsimile.processed) {
        loadPromises.push(
          this.storage.loadFacsimile(projectStorage.facsimile.processed).then((facsimileStorage: FacsimileStorage) => {
            workspaceSeed.facsimile.processed = {
              id: facsimileStorage.id,
              dataURL: facsimileStorage.dataURL,
            };
            return true;
          }, err => false),
        );
      }
      if (projectStorage.facsimile.generated) {
        loadPromises.push(
          this.storage.loadFacsimile(projectStorage.facsimile.generated).then((facsimileStorage: FacsimileStorage) => {
            workspaceSeed.facsimile.generated = {
              id: facsimileStorage.id,
              dataURL: facsimileStorage.dataURL,
            };
            return true;
          }, err => false),
        );
      }

      // Lets do this...
      Promise.all(loadPromises).then(resolutions => {
        if (every(resolutions)) {
          resolve(workspaceSeed);
        } else {
          console.warn(this.translation.instant('CORE.DATA.WARN.LOAD'), resolutions);
          reject();
        }
      });

    });
  }

  private loadProjectList (): void {
    const projectList = [];
    // Get project ID list from storage
    this.storage.loadProjectList().then((projectIds: Array<Project['id']>) => {
      // Build project list items for each project
      const promises = [];
      projectIds.forEach(id => {
        promises.push(
          this.storage.loadProject(id).then((project: ProjectStorage) => {
            if (project) {
              const projectListItem: ProjectListItem = {
                id: project.id,
                created: project.created,
                updated: project.updated,
                title: project.properties.title,
                author: project.properties.author,
              };
              projectList.push(projectListItem);
            }
          })
        );
      });
      Promise.all(promises).then(() => {
        this.projectList = projectList;
        this.projectListSub.next(projectList);
      });
    });

  }

  private loadSettings (): void {
    this.storage.loadSettings().then((settings: Settings) => {
      if (!settings) {
        settings = {
          userFullName: 'Anonymous',
          clusterAnalysis: {
            threshold: 200,
          },
          classification: {
            model: environment.config.apiServices.classification.models.length ? environment.config.apiServices.classification.models[0] : null,
          },
        };
        this.storage.saveSettings(settings);
      }
      this.settingsSub.next(settings);
    });
  }

  private nullifyProject (): void {
    this.workspaceSeed = null;
    this.workspaceSeedSub.next(null);
    this.project = null;
    this.projectSub.next(null);
  }

  private addToProjectList (id: ProjectStorage['id']): Promise<boolean> {
    return this.storage.loadProjectList().then(projectList => {
      if (!includes(projectList, id)) {
        projectList.push(id);
      }
      return this.storage.saveProjectList(projectList);
    });
  }

  private removeFromProjectList (id: ProjectStorage['id']): Promise<boolean> {
    return this.storage.loadProjectList().then(projectList => {
      projectList = without(projectList, id);
      return this.storage.saveProjectList(projectList);
    });
  }

}
