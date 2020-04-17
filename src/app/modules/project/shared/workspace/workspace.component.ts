import { UtilsService } from './../../../../core/utils/utils.service';
import { Drawing, DrawingBuilder, DrawData } from './drawing.model';
import { ApiService } from './../../../../core/api/api.service';
import { Outlines } from './outlines.effect';
import { Trace } from './trace.effect';
import { AreaSeed } from './../../../../core/data/data.model';
import { AreaBuilder, Area, areaStyles } from './area.model';
import { Settings } from './../../../settings/settings.model';
import { Source } from './source.model';
import { Facsimile } from './facsimile.model';
import { AnnotationStorage, SourceStorage, FacsimileStorage, DrawingStorage, SentenceStorage, WordStorage } from './../../../../core/storage/storage.model';
import { NotificationsService } from './../../../../core/notifications/notifications.service';
import { Component, OnDestroy, ViewChild, ElementRef, HostListener, OnInit, Output, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from './../../../../core/data/data.service';
import { Project } from '../../project.model';
import { find, filter, includes, concat, unionBy, uniq, take, orderBy } from 'lodash';
import { fabric } from 'fabric';
import * as Hammer from 'hammerjs';
import { WorkspaceConfig, WorkspaceHistory, customKeys, WorkspaceData, WorkspacePosition, WorkspaceSeed, BuilderData, WorkspaceObjectPosition, WorkspacePoint } from './workspace.model';
import * as Mousetrap from 'mousetrap';
import * as cloneDeep from 'clone-deep';
import { AnnotationBuilder, Annotation, annotationStyles } from './annotation.model';
import { Glyph, GlyphBuilder, glyphStyles } from './glyph.model';
import { AutoIdentifyRectBuilder, AutoIdentifyRect } from './auto-identify-rect.model';
import { IdentificationResponse, IdentificationRequest, IdentificationWord } from '../../../../core/api/identification.model';
import { Sentence } from './sentence.model';
import { Word } from './word.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
})
export class WorkspaceComponent implements OnInit, OnDestroy {

  @ViewChild('canvas', {static: true}) private canvasRef: ElementRef;
  @ViewChild('panZoomLayer', {static: true}) private panZoomLayerRef: ElementRef;
  @ViewChild('workspace',  {static: true}) private workspaceRef: ElementRef;
  @HostListener('window:resize', ['$event']) private onWindowResize = this.resize;

  @Output() workspaceSetup = new EventEmitter<void>();
  @Output() workspaceData = new EventEmitter<WorkspaceData>();

  private componentSubs: Array<Subscription> = [];
  private workspaceEl: HTMLElement;
  private canvasEl: HTMLCanvasElement;
  private panZoomEl: HTMLElement;
  private history: WorkspaceHistory = {
    current: {
      fabric: null,
      misc: {
        effects: null,
      },
    },
    undo: {
      stack: [],
    },
    redo: {
      stack: [],
    },
  };
  private builderData: BuilderData = {
    type: null,
    instance: null,
    eventHandlers: [],
    selectedGlyphParent: null,
  };
  private settings: Settings;
  private canvas: fabric.Canvas;
  project: Project;
  config: WorkspaceConfig = {
    ai: {
      identify: {
        enabled: false,
      },
      classification: {
        enabled: false,
      },
    },
    type: null,
    states: {
      loaded: false,
      panning: false,
    },
    tools: {
      selected: 'select',
      visible: {
        select: false,
        pan: false,
        zoomIn: false,
        zoomZero: false,
        zoomOut: false,
        undo: false,
        redo: false,
        marquee: false,
        polygon: false,
        draw: false,
        erase: false,
        sources: false,
      },
      enabled: {
        select: false,
        pan: false,
        zoomIn: false,
        zoomZero: false,
        zoomOut: false,
        undo: false,
        redo: false,
        marquee: false,
        polygon: false,
        draw: false,
        erase: false,
        sources: false,
      },
    },
    panels: {
      active: {
        sources: false,
      }
    },
    selectedGlyphParent: null,
  };
  data: WorkspaceData = {
    sources: [],
    facsimile: {
      processed: null,
      generated: null,
    },
    process: {
      areas: [],
    },
    generate: {
      drawings: [],
      effects: null,
    },
    analyse: {
      sentences: [],
    },
    annotate: {
      annotations: [],
    },
  };

  constructor (
    private dataService: DataService,
    private notificationsService: NotificationsService,
    private apiService: ApiService,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
    private utils: UtilsService
  ) { }

  ngOnInit () {
    this.workspaceEl = this.workspaceRef.nativeElement;
    this.canvasEl = this.canvasRef.nativeElement;
    this.panZoomEl = this.panZoomLayerRef.nativeElement;

    this.componentSubs.push(
      this.dataService.projectObs.subscribe((project: Project) => {
        this.project = project;
        if (project && !this.config.states.loaded) {
          this.setup();
        }
      }),
      this.dataService.settingsObs.subscribe((settings: Settings) => {
        this.settings = settings;
      }),
      this.apiService.servicesEnabledObs.subscribe(servicesEnabled => {
        this.config.ai.identify.enabled = includes(servicesEnabled, 'clusterAnalysis');
        this.config.ai.classification.enabled = includes(servicesEnabled, 'classification');
        this.updateAPIStates();
      })
    );
  }

  ngOnDestroy () {
    this.componentSubs.forEach(sub => sub.unsubscribe());
  }

  toolClick (toolId: WorkspaceConfig['tools']['selected']): void {

    // Do one time actions without changing currently selected tool
    const oneTimeTools = [ 'zoomZero', 'undo', 'redo', ];
    if (includes(oneTimeTools, toolId)) {
      switch (toolId) {
        case 'zoomZero':
          this.reset();
          break;
        case 'undo':
          this.undo();
          break;
        case 'redo':
          this.redo();
          break;
      }
      return;
    }

    // Is this a `builder` tool?
    let builderToolId: BuilderData['type'] = null;
    if (this.config.type === 'process' && toolId === 'marquee') {
      builderToolId = 'area';
    } else if (this.config.type === 'generate' && toolId === 'draw') {
      builderToolId = 'drawing';
    } else if (this.config.type === 'generate' && toolId === 'erase') {
      builderToolId = 'drawing';
    } else if (this.config.type === 'analyse' && toolId === 'marquee') {
      builderToolId = 'auto-identify-rect';
    } else if (this.config.type === 'analyse' && toolId === 'polygon') {
      builderToolId = 'glyph';
    } else if (this.config.type === 'annotate' && toolId === 'polygon') {
      builderToolId = 'annotation';
    }

    // Update currently selected tool
    this.config.tools.selected = toolId;

    // If this is a builder tool then trigger associated actions,
    // or ensure the previous builder tool is cleaned up if not.
    if (builderToolId) {
      if (
        (
          builderToolId === 'drawing' ||
          builderToolId === 'glyph' ||
          builderToolId === 'auto-identify-rect'
        ) &&
        this.builderData.type
      ) {
        this.disableBuilderTool(this.builderData.type);
      }
      this.enableBuilderTool(builderToolId);
    } else {
      if (this.builderData.type) {
        this.disableBuilderTool(this.builderData.type);
      }
    }

    this.updateDrawEraseClasses();

    // Ensure things render correctly even if this is called from outside Angular
    this.changeDetectorRef.detectChanges();
  }

  render (): void {
    this.canvas.requestRenderAll();
  }

  init (type: WorkspaceConfig['type'], workspaceSeed: WorkspaceSeed): Promise<void> {
    return new Promise((resolve, reject) => {

      // Setup typed config
      this.config.type = type;
      switch (this.config.type) {
        case 'process':
          this.config.tools.visible.marquee = true;
          this.config.tools.enabled.marquee = true;
          this.canvas.selection = false;
          break;
        case 'generate':
          this.config.tools.visible.draw = true;
          this.config.tools.visible.erase = true;
          this.config.tools.enabled.draw = true;
          this.config.tools.enabled.erase = true;
          this.canvas.selection = false;
          break;
        case 'analyse':
          this.config.tools.visible.marquee = true;
          this.config.tools.visible.polygon = true;
          this.config.tools.enabled.marquee = true;
          this.config.tools.enabled.polygon = true;
          this.canvas.selection = true;
          break;
        case 'annotate':
          this.config.tools.visible.polygon = true;
          this.config.tools.enabled.polygon = true;
          this.canvas.selection = false;
          break;
      }
      // Load seed
      this.loadSeedData(workspaceSeed).then(() => {
        this.reorderObjects();  // Ensure object z-orders are correct
        this.updateData(this.config.type === 'generate' ? true : false).then(() => {  // Ensure parent is aware of new data (don't save project as nothing has changed)
          this.updateHistory(); // Save this as the initial history state
          this.loadPosition(workspaceSeed.position);  // Set the initial canvas position
          this.updateAreas().then(() => { // Ensure all areas have their images drawn
            this.config.tools.enabled.sources = true; // Allow user to manipulate source layers
            this.config.states.loaded = true; // Finish loading state
          }, console.warn);
        }, console.warn);
      }, console.warn);
    });
  }

  updateData (save: boolean = true, updateObjects: boolean = true): Promise<unknown> {
    const updatePromises: Array<Promise<unknown>> = [];
    // console.warn('updateData(): ', save, updateObjects);

    this.cursorLoading(true);
    return new Promise((resolve, reject) => {

      // Update freeDrawing config
      if (this.config.type === 'generate') {
        this.config.tools.enabled.draw = this.data.generate.effects.drawing.active;
        this.config.tools.enabled.erase = this.data.generate.effects.drawing.active;
        const newWidth = this.data.generate.effects.drawing.width || 3;
        if (newWidth !== (<any>this.canvas).freeDrawingBrush.width) {
          (<any>this.canvas).freeDrawingBrush.width = newWidth;
          this.updateDrawEraseClasses();
        }
        if (
          (this.config.tools.selected === 'draw' && !this.config.tools.enabled.draw) ||
          (this.config.tools.selected === 'erase' &&  !this.config.tools.enabled.erase)
        ) {
          this.toolClick('select');
        }
      }

      if (updateObjects) {
        // Update required objects only (don't overright other routes data)
        switch (this.config.type) {
          case 'process':
            this.data.process.areas = this.getObjects('tid', ['area']);
            if (save) {
              updatePromises.push(this.updateProcessedFacsimile());
            }
            break;
          case 'generate':
            this.data.generate.drawings = this.getObjects('tid', ['drawing']);
            if (save) {
              updatePromises.push(this.updateGeneratedFacsimile());
            }
            break;
          case 'analyse':
            this.data.analyse.sentences = this.getObjects('tid', ['sentence']);
            break;
          case 'annotate':
            this.data.annotate.annotations = this.getObjects('tid', ['annotation']);
            break;
        }
      }

      Promise.all(updatePromises).then(() => {
        if (updateObjects) {
          this.data.sources = this.getObjects('tid', ['source']);
          this.data.facsimile.processed = this.getObject('tid', 'processedFacsimile');
          this.data.facsimile.generated = this.getObject('tid', 'generatedFacsimile');
        }

        // Emit workspace data changes to parent
        this.workspaceData.emit(this.data);

        this.cursorLoading(false);

        // Save project
        if (save) {
          this.save().then(() => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }

  updateHistory (): void {
    this.history.redo.stack = [];
    this.config.tools.enabled.redo = false;
    if (this.history.current.fabric) {
      this.history.undo.stack.push(this.history.current);
      this.config.tools.enabled.undo = true;
    }
    this.history.current = cloneDeep({
      fabric: (<any>this.canvas).toJSON(customKeys) as string,
      misc: {
        effects: this.data.generate.effects,
      }
    });
  }

  selectObjects(objects: Array<Annotation | Glyph | Sentence | Word | Area | Drawing>, updateActive: boolean = true, deselect: boolean = true): void {
    if (deselect) {
      this.setObjectsDeselected();
    }
    this.setObjectsSelected(this.getDeepObjects(objects));
    if (updateActive) {
      if (objects && objects.length && objects[0] && objects[0].tid) {
        this.updateActiveSelection(objects[0].tid);
      }
    }
    this.updateData(false, false);
  }

  deleteObjects (objects: Array<Annotation | Area | AutoIdentifyRect | Drawing>, force?, updateData: boolean = true): boolean {
    if (
      !force &&
      !confirm(objects.length === 1 ? this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.DELETE', { objects: objects.length }) :
      this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.DELETE_PL', { objects: objects.length }) )
    ) {
      return false;
    }
    objects.forEach((o: any) => {
      this.canvas.remove(o);
    });
    if (objects.length) {
      this.canvas.requestRenderAll();
      if (updateData) {
        this.updateData();
        this.updateHistory();
      }
    }
    return true;
  }

  selectSentence (sentence: Sentence): void {
    this.setObjectsDeselected();
    this.setObjectsSelected([sentence]);
    this.updateData(false);
  }

  unselectSentence (sentence: Sentence): void {
    this.setObjectsDeselected([sentence]);
    this.updateData(false);
  }

  deleteSentence (sentence: Sentence): boolean {
    const wordCount = sentence.wordCount();
    const glyphCount = sentence.glyphCount();
    if (
      (wordCount || glyphCount) &&
      !confirm(
        wordCount === 1 ? this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.DELETE_SEN', { words: wordCount }) :
        this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.DELETE_SEN_PL', { words: wordCount }) +
        glyphCount === 1 ? this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.DELETE_SEN_GLY', { glyphs: glyphCount }) :
          this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.DELETE_SEN_GLY_PL', { glyphs: glyphCount }) )
    ) {
      return false;
    }

    // Delete glyphs
    sentence.getGlyphs().forEach(glyph => {
      this.canvas.remove(glyph);
    });

    // Delete words
    const sentenceWords = sentence.getWords();
    this.setObjectsDeselected(sentenceWords);
    sentenceWords.forEach(word => this.canvas.remove(word));

    // Delete sentence
    this.setObjectsDeselected([sentence]);
    this.canvas.remove(sentence);

    this.canvas.requestRenderAll();
    this.updateData();
    this.updateHistory();
    return true;
  }

  selectWord (word: Word): void {
    this.setObjectsDeselected();
    this.setObjectsSelected([word]);
    this.updateData(false);
  }

  unselectWord (word: Word): void {
    this.setObjectsDeselected([word]);
    this.updateData(false);
  }

  deleteWord (word: Word): boolean {
    const glyphCount = word.glyphCount();
    if (
      glyphCount &&
      !confirm(
        glyphCount === 1 ? this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.DELETE_WORD', { glyphs: glyphCount }) :
          this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.DELETE_WORD_PL', { glyphs: glyphCount })
        )
    ) {
      return false;
    }

    // Delete word
    const sentence: Sentence = word.getParent();
    if (sentence) {
      this.setObjectsDeselected([word]);
      sentence.removeWord(word);

      this.canvas.requestRenderAll();

      this.updateData();
      this.updateHistory();
    }
    return true;
  }

  deleteGlyphs (glyphs: Array<Glyph>, force?): boolean {
    if (
      !force &&
      glyphs.length > 0 &&
      !confirm(
        glyphs.length === 1 ? this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.DELETE_WORD', { glyphs: glyphs.length }) :
        this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.DELETE_WORD_PL', { glyphs: glyphs.length }))
    ) {
      return false;
    }

    // Remove glyphs
    if (glyphs.length) {
      glyphs.forEach((glyph: any) => {

        const word: Word = glyph.getParent();
        if (!word) {
          // Cannot find parent word - remove glyph straight from canvas
          this.canvas.remove(glyph);
        } else {
          // Delete the word too?
          if (word.glyphCount() === 1) {
            // Remove glyph from word
            word.removeGlyph(glyph);
            // There is only this glyph in the word - remove the word
            this.setObjectsDeselected([word]);
            const sentence: Sentence = word.getParent();
            if (!sentence) {
              // Cannot find parent sentence - remove word straight from canvas
              this.canvas.remove(word);
            } else {
              // Delete the sentence too?
              if (sentence.wordCount() === 1) {
                // Remove word from sentence
                sentence.removeWord(word);
                // Remove sentence straight from canvas
                this.setObjectsDeselected([sentence]);
                this.canvas.remove(sentence);
              } else {
                // Remove word from sentence
                sentence.removeWord(word);
              }
            }
          } else {
            // Remove glyph from word
            word.removeGlyph(glyph);
          }
        }
      });
      this.canvas.requestRenderAll();
      this.updateData();
      this.updateHistory();
    }
    return true;
  }

  highlightObjects (objects: Array<Annotation | Glyph | Area>, state: boolean): void {
    objects.forEach((object: any) => {
      if (state) {
        object.set(this.getObjectStyles(object.tid, 'highlight'));
      } else {
        if (object.selected) {
          object.set(this.getObjectStyles(object.tid, 'active'));
        } else {
          object.set(this.getObjectStyles(object.tid, 'inactive'));
        }
      }
    });
    this.canvas.requestRenderAll();
  }

  getSelectedObjects (tid?: string): Array<Annotation | Glyph | Area> {
    return filter(this.getBuilderObjects(), o => {
      if (tid) {
        return o.selected && o.tid && o.tid === tid;
      }
      return o.selected;
    });
  }

  getPolyImgOfFacsimile (object: Glyph): Promise<string> {
    return new Promise((resolve, reject) => {

      const objectPosition = (<Glyph>object).absolutePosition();
      this.getRectImgOfFacsimile(objectPosition).then((rectClipImg: HTMLImageElement) => {

        // Create image clipped to polygon points
        const polyClipImg = new Image();
        polyClipImg.onload = () => {

          // Create new canvas for poly clip
          const clipCanvas = document.createElement('canvas');
          clipCanvas.width = objectPosition.width;
          clipCanvas.height = objectPosition.height;
          const clipCanvasCtx = clipCanvas.getContext('2d');
          clipCanvasCtx.imageSmoothingEnabled = false;
          clipCanvasCtx.fillStyle = 'rgba(0, 0, 0, 0)';
          clipCanvasCtx.beginPath();
          const x0 = object.points[0].x - objectPosition.left;
          const y0 = object.points[0].y - objectPosition.top;
          clipCanvasCtx.moveTo(x0, y0);
          object.points.forEach(point => {
            const x = point.x - objectPosition.left;
            const y = point.y - objectPosition.top;
            clipCanvasCtx.lineTo(x, y);
          });
          clipCanvasCtx.lineTo(x0, y0);
          clipCanvasCtx.closePath();
          clipCanvasCtx.fill();
          clipCanvasCtx.clip();
          clipCanvasCtx.drawImage(rectClipImg, 0, 0);

          // Create new canvas for final poly image
          const resultConfig = {
            width: 320,
            height: 340,
            padding: 50,
          };
          const polyCanvas = document.createElement('canvas');
          polyCanvas.width = resultConfig.width;
          polyCanvas.height = resultConfig.height;
          const polyCtx = polyCanvas.getContext('2d');
          polyCtx.imageSmoothingEnabled = true;
          polyCtx.imageSmoothingQuality = 'high';
          polyCtx.fillStyle = '#FFFFFF';
          polyCtx.fillRect(0, 0, polyCanvas.width, polyCanvas.height);

          const ployImg = new Image();
          ployImg.onload = () => {

            // Add padding before canvas draw
            const ratio = ployImg.width / ployImg.height;
            let newWidth = polyCanvas.width - (resultConfig.padding * 2);
            let newHeight = newWidth / ratio;
            if (newHeight > polyCanvas.height - (resultConfig.padding * 2)) {
              newHeight = polyCanvas.height - (resultConfig.padding * 2);
              newWidth = newHeight * ratio;
            }
            polyCtx.drawImage(ployImg, polyCanvas.width / 2 - newWidth / 2, polyCanvas.height / 2 - newHeight / 2, newWidth, newHeight);

            resolve(polyCanvas.toDataURL('image/png'));
          };
          ployImg.onerror = (err) => {
            this.notificationsService.error(this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.ERROR.GLYPH'));
            console.warn(this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.WARN.GLYPH'), err);
            reject();
          };
          ployImg.src = clipCanvas.toDataURL();

        };
        polyClipImg.src = rectClipImg.src;

      });

    });

  }

  getObject (key: string = 'id', id: string): any {
    if (this.canvas) {
      const objects = this.canvas.getObjects();
      return find(objects, (o) => {
        return o[key] && o[key] === id;
      });
    }
    return undefined;
  }

  getObjects (key: string = 'id', ids: string[]): any[] {
    if (this.canvas) {
      const objects = this.canvas.getObjects();
      return filter(objects, (o) => {
        return o[key] && includes(ids, o[key]);
      });
    }
    return [];
  }

  editPolygonObject (object: Annotation | Glyph): void {

    // Update object options for edit mode
    object.selectable = false;
    object.objectCaching = false;

    const reinitialiseHandles = () => {

      // Remove handles from canvas
      const handles = this.getObjects('tid', ['poly-handle']);
      handles.forEach(h => this.canvas.remove(h));

      // Create new "edit" polygon handles
      object.points.forEach((point, index) => {
        const handle = new fabric.Circle({
          fill: '#fbe085',
          hasBorders: false,
          hasControls: false,
          left: point.x,
          originX: 'center',
          originY: 'center',
          radius: 5,
          stroke: '#373529',
          strokeWidth: 0.5,
          top: point.y,
        });
        fabric.util.object.extend(handle, {
          name: index,
          tid: 'poly-handle',
        });
        this.canvas.add(handle);
        this.canvas.bringToFront(handle);
        this.canvas.setActiveObject(handle);

        // Setup handle events
        handle.on('moving', (opt: any) => {
          object.points[handle.name].x = handle.getCenterPoint().x;
          object.points[handle.name].y = handle.getCenterPoint().y;
          handle.setCoords();
          object.setCoords();
          this.canvas.requestRenderAll();
        });
      });
    };

    const distanceBetweenPoints = (point: fabric.Point, origin: fabric.Point): number => {
      return Math.sqrt(Math.pow(origin.x - point.x, 2) + Math.pow(origin.y - point.y, 2));
    };

    const addHandle = (point: fabric.Point) => {

      // Make a note od the distance between points
      const pointDistances = [];
      object.points.forEach((p, i) => {
        pointDistances.push({
          i: i,
          d: distanceBetweenPoints(p, point),
          point: p,
        });
      });

      // Take the two closest
      const nearestNeighbours = take(orderBy(pointDistances, ['d'], ['asc']), 2);

      // Check if these are next to each other in the array
      const iDiff = Math.abs(nearestNeighbours[0].i - nearestNeighbours[1].i);
      const iMax = Math.max(nearestNeighbours[0].i, nearestNeighbours[1].i);
      const iMin = Math.min(nearestNeighbours[0].i, nearestNeighbours[1].i);
      if (iDiff <= 1) {
        // Next to each other and not the last point
        object.points.splice(iMax, 0, point);
      } else if (iDiff === (object.points.length - 1)) {
        // Next to each other and the last point
        object.points.splice(iMax + 1, 0, point);
      } else {
        // TODO: Not next to each other
        object.points.splice(iMin + 1, 0, point);
      }
    };

    // Bind events for adding new points
    object.on('mousedown', (opt: any) => {
      addHandle(this.canvas.getPointer(opt.e) as fabric.Point);
      reinitialiseHandles();
      object.setCoords();
      this.canvas.requestRenderAll();
    });

    reinitialiseHandles();
  }

  saveEditedPolygonObject (object: Annotation | Glyph) {

    // Remove handles from canvas
    const handles = this.getObjects('tid', ['poly-handle']);
    handles.forEach(h => this.canvas.remove(h));

    // Reinitialise object to canvas
    if (object && object.tid) {
      const promises: Array<Promise<Annotation | Glyph>> = [];
      switch (object.tid) {
        case 'glyph':
          this.canvas.remove(object);
          promises.push(this.reloadGlyph(object as Glyph));
          break;
        case 'annotation':
          this.canvas.remove(object);
          promises.push(this.reloadAnnotation(object as Annotation));
          break;
      }

      Promise.all(promises).then((newObjects) => {
        this.reorderObjects();
        const newObject = newObjects[0];
        if (newObject) {
          if (newObject.tid && newObject.tid === 'glyph') {
            const word = (<Glyph>newObject).getParent();
            if (word) {
              word.reorderGlyphs();
            }
          }
          this.selectObjects([newObject]);
        }
        this.canvas.requestRenderAll();
        this.updateHistory();
        this.updateData();
      });
    }
  }

  panZoomToObject (object: Annotation | Glyph | Area): void {

    let objectPosition = {
      top: object.top,
      left: object.left,
      width: object.width,
      height: object.height,
    };

    if (object.tid && object.tid === 'glyph') {
      objectPosition = (<Glyph>object).absolutePosition();
    }

    const animationDuration = 500;

    // Calculate zoom
    const maxWidth = 0.5;
    const maxHeight = 0.5;
    let zoom = 1;
    if (objectPosition.width >= objectPosition.height) {
      // Object is landscape
      const widthZoom = (this.canvas.getWidth() * maxWidth) / objectPosition.width;
      const heightZoom = (this.canvas.getHeight() * maxHeight) / objectPosition.height;
      zoom = Math.min(heightZoom, widthZoom);
    } else {
      // Object is portrait
      zoom = (this.canvas.getHeight() * maxHeight) / objectPosition.height;
    }
    zoom = Math.min(5, Math.max(0.1, zoom));

    // Animate zoom
    fabric.util.animate({
      startValue: this.canvas.getZoom(),
      endValue: zoom,
      duration: animationDuration,
      easing: fabric.util.ease.easeInOutQuad,
      byValue: null,
      onChange: value => {
        this.canvas.setZoom(value);
        this.canvas.requestRenderAll();
      },
      onComplete: () => {
        this.setCoords();
      },
    });

    // Pan
    const objectCenter = {
      x: objectPosition.left + (objectPosition.width / 2),
      y: objectPosition.top + (objectPosition.height / 2),
    };
    const viewportCenter = {
      x: this.canvas.getWidth() / 2,
      y: this.canvas.getHeight() / 2,
    };
    // Flip the signs
    objectCenter.x -= objectCenter.x * 2;
    objectCenter.y -= objectCenter.y * 2;

    // X
    fabric.util.animate({
      startValue: this.canvas.viewportTransform[4],
      endValue: (objectCenter.x * zoom) + viewportCenter.x,
      duration: animationDuration,
      easing: fabric.util.ease.easeInOutQuad,
      byValue: null,
      onChange: value => {
        this.canvas.viewportTransform[4] = value;
        this.canvas.requestRenderAll();
      },
      onComplete: () => {
        this.setCoords();
      },
    });

    // Y
    fabric.util.animate({
      startValue: this.canvas.viewportTransform[5],
      endValue: (objectCenter.y * zoom) + viewportCenter.y,
      duration: animationDuration,
      easing: fabric.util.ease.easeInOutQuad,
      byValue: null,
      onChange: value => {
        this.canvas.viewportTransform[5] = value;
        this.canvas.requestRenderAll();
      },
      onComplete: () => {
        this.setCoords();
      },
    });
  }

  reorderObjects (): void {
    let cnt = 0;

    // sources - order 1
    this.getObjects('tid', ['source']).forEach((source: Source) => {
      source.moveTo(cnt);
      cnt++;
    });

    // processedFacsimile - order 2
    this.getObjects('tid', ['processedFacsimile']).forEach((facsimile: Facsimile) => {
      facsimile.moveTo(cnt);
      cnt++;
    });

    // generatedFacsimile - order 3
    this.getObjects('tid', ['generatedFacsimile']).forEach((facsimile: Facsimile) => {
      facsimile.moveTo(cnt);
      cnt++;
    });

    // areas - order 4
    this.getObjects('tid', ['area']).forEach((area: Area) => {
      area.moveTo(cnt);
      cnt++;
    });

    // drawings - order 5
    this.getObjects('tid', ['drawing']).forEach((drawing: Drawing) => {
      drawing.moveTo(cnt);
      cnt++;
    });

    // sentences - order 6
    orderBy(this.getObjects('tid', ['sentence']), 'order').forEach((sentence: Sentence) => {
      sentence.moveTo(cnt);
      cnt++;
    });

    // words - order 7
    orderBy(this.getObjects('tid', ['word']), 'order').forEach((word: Word) => {
      word.moveTo(cnt);
      cnt++;
    });

    // glyphs - order 8
    orderBy(this.getObjects('tid', ['glyph']), 'order').forEach((glyph: Glyph) => {
      glyph.moveTo(cnt);
      cnt++;
    });

    // annotations - order 9
    this.getObjects('tid', ['annotation']).forEach((annotation: Annotation) => {
      annotation.moveTo(cnt);
      cnt++;
    });

    this.setCoords();
    this.canvas.requestRenderAll();
  }

  reorderSentences (): void {
    this.getObjects('tid', ['sentence']).forEach((s, i) => s.order = i );
  }

  createWord (wordData: WordStorage, parentId: Word['parentId'], overrideData?): Promise<Word> {
    return new Promise(resolve => {
      const wordStorage: WordStorage = {
        author: wordData.author,
        created: wordData.created,
        glyphs: [],
        isCartouche: wordData.isCartouche,
        order: wordData.order,
        position: {
          top: wordData.position.top,
          left: wordData.position.left,
          width: wordData.position.width,
          height: wordData.position.height,
        },
        translation: wordData.translation,
        transliteration: wordData.transliteration,
      };
      const word = new Word(wordStorage, parentId, this.canvas);
      if (overrideData) {
        for (const key in overrideData) {
          if (overrideData[key]) {
            word[key] = overrideData[key];
          }
        }
      }
      resolve(word);
    });
  }

  private updateAPIStates (): void {
    switch (this.config.type) {
      case 'process':
        break;
      case 'generate':
        break;
      case 'analyse':
        this.config.tools.visible.marquee = this.config.ai.identify.enabled;
        this.config.tools.enabled.marquee = this.config.ai.identify.enabled;
        break;
      case 'annotate':
        break;
    }
  }

  private resetRectObjectPosition (object: Area): void {
    object.width = Math.floor(object.width * object.scaleX);
    object.height = Math.floor(object.height * object.scaleY);
    object.top = Math.floor(object.top);
    object.left = Math.floor(object.left);
    object.scaleX = 1;
    object.scaleY = 1;
    object.setCoords();
  }

  private getRectImgOfFacsimile (position: WorkspaceObjectPosition, asDataUrl?): Promise<string | HTMLImageElement> {
    return new Promise(resolve => {

      // Create a new duplicate workspace instance to prevent user interuption
      const newCanvasData = this.canvas.toObject(customKeys);
      const newCanvas = new fabric.Canvas(document.createElement('canvas'));
      newCanvas.imageSmoothingEnabled = false;
      newCanvas.loadFromJSON(newCanvasData, () => {
        newCanvas.backgroundColor = 'white';
        newCanvas.renderOnAddRemove = false;

        // Make facsimile fully visible
        let facsimileObject = this.getObject('tid', 'generatedFacsimile');
        if (!facsimileObject) {
          facsimileObject = this.getObject('tid', 'processedFacsimile');
        }
        facsimileObject.opacity = 1;

        // Remove all non-facsimile image objects
        const nonFacsimileObjects = filter(newCanvas.getObjects(), o => o.tid && o.tid !== facsimileObject.tid);
        nonFacsimileObjects.forEach(o => o.opacity = 0);

        newCanvas.requestRenderAll();

        // Ensure everything is visible in the canvas
        newCanvas.viewportTransform[4] = 0;
        newCanvas.viewportTransform[5] = 0;
        newCanvas.setZoom(1);

        const imageUrl = newCanvas.toDataURL({
          left: position.left,
          top: position.top,
          width: position.width,
          height: position.height,
        });

        if (asDataUrl) {
          resolve(imageUrl);
          newCanvas.dispose();
        } else {
          const img = new Image();
          img.onload = () => {
            resolve(img);
            newCanvas.dispose();
          };
          img.src = imageUrl;
        }
      });
    });
  }

  private calcObjectPosition (object: Annotation | Glyph | Area | AutoIdentifyRect): { top: number, left: number, width: number, height: number } {
    const position = {
      top: object.top,
      left: object.left,
      width: object.width,
      height: object.height,
    };
    if ((<any>object).group) {
      // glyph is in a group so has different coords system
      const groupMatrix = (<any>object).group.calcTransformMatrix();
      position.left = groupMatrix[4] + object.left;
      position.top = groupMatrix[5] + object.top;
    }
    return position;
  }

  private setup (): void {

    // Setup canvas
    this.canvas = new fabric.Canvas(this.canvasEl);
    this.canvas.imageSmoothingEnabled = false;
    this.canvas.backgroundColor = '#3b3b3b'; // Must match `/src/styles/_variables.scss`
    this.canvas.uniScaleTransform = true;
    this.canvas.setDimensions({
      width: this.workspaceEl.clientWidth,
      height: this.workspaceEl.clientHeight,
    });

    // Setup default config
    this.config.tools.visible.select = true;
    this.config.tools.visible.pan = true;
    this.config.tools.visible.zoomIn = true;
    this.config.tools.visible.zoomZero = true;
    this.config.tools.visible.zoomOut = true;
    this.config.tools.visible.undo = true;
    this.config.tools.visible.redo = true;
    this.config.tools.visible.sources = true;

    this.config.tools.enabled.select = true;
    this.config.tools.enabled.pan = true;
    this.config.tools.enabled.zoomIn = true;
    this.config.tools.enabled.zoomOut = true;

    // Bind events
    this.bindEvents();

    this.workspaceSetup.emit();  // Tell parent component we are done with initial setup
  }

  private bindEvents (): void {
    this.bindPanZoomEvents();
    this.bindObjectEvents();
    this.bindSelectionEvents();
    this.bindKeyboardShortcuts();
  }

  private bindPanZoomEvents (): void {

    // Setup vars
    const currDelta = {
      x: 0,
      y: 0,
      scale: 0,
    };

    // Create an instance of Hammer with the reference.
    const pinchHammer = new Hammer(this.workspaceEl);
    pinchHammer.get('pinch').set({
      enable: true,
    });
    const panHammer = new Hammer(this.panZoomEl);
    panHammer.get('pan').set({
      enable: true,
    });

    // ---------------------------------------------------------------------- //
    // TOUCH - TBD tool availability
    // ---------------------------------------------------------------------- //
    pinchHammer.on('pinchstart', (evt: HammerInput) => {
      currDelta.x = evt.deltaX;
      currDelta.y = evt.deltaY;
      currDelta.scale = evt.scale;
    });
    pinchHammer.on('pinchmove', (evt: HammerInput) => {
      // Pan
      this.pan(evt.deltaX - currDelta.x, evt.deltaY - currDelta.y);
      currDelta.x = evt.deltaX;
      currDelta.y = evt.deltaY;
      // Zoom
      let zoomDelta = evt.scale - currDelta.scale;
      zoomDelta -= zoomDelta * 2; // Flip the sign
      this.zoomByDelta(zoomDelta, new fabric.Point(evt.center.x, evt.center.y));
      currDelta.scale = evt.scale;
    });
    panHammer.on('panstart', (evt: HammerInput) => {
      if (evt.pointerType === 'touch' && this.config.tools.selected === 'pan') {
        currDelta.x = evt.deltaX;
        currDelta.y = evt.deltaY;
        currDelta.scale = evt.scale;
      }
    });
    panHammer.on('panmove', (evt: HammerInput) => {
      if (evt.pointerType === 'touch' && this.config.tools.selected === 'pan') {
        this.pan(evt.deltaX - currDelta.x, evt.deltaY - currDelta.y);
        currDelta.x = evt.deltaX;
        currDelta.y = evt.deltaY;
      }
    });

    // ---------------------------------------------------------------------- //
    // WHEEL - full tool availability
    // ---------------------------------------------------------------------- //
    const onWheelEvent = (evt: WheelEvent) => {
      const delta = evt.deltaY / 50;
      this.zoomByDelta(delta, new fabric.Point(evt.offsetX, evt.offsetY));
      evt.preventDefault();
      evt.stopPropagation();
    };
    this.canvas.on('mouse:wheel', opt => onWheelEvent(opt.e as WheelEvent));
    this.panZoomEl.addEventListener('wheel', onWheelEvent);

    // ---------------------------------------------------------------------- //
    // MOUSE - limited tool availability
    // ---------------------------------------------------------------------- //
    this.panZoomEl.addEventListener('mousedown', (evt: MouseEvent) => {

      // Pan
      if (this.config.tools.selected === 'pan') {
        this.config.states.panning = true;
        currDelta.x = evt.clientX;
        currDelta.y = evt.clientY;
      }

      // Zoom in
      if (this.config.tools.selected === 'zoomIn') {
        this.zoomByDelta(-0.5, new fabric.Point(evt.offsetX, evt.offsetY));
      }

      // Zoom out
      if (this.config.tools.selected === 'zoomOut') {
        this.zoomByDelta(0.5, new fabric.Point(evt.offsetX, evt.offsetY));
      }
    });
    this.panZoomEl.addEventListener('mousemove', (evt: MouseEvent) => {
      if (this.config.states.panning) {
        this.pan(evt.clientX - currDelta.x, evt.clientY - currDelta.y);
        currDelta.x = evt.clientX;
        currDelta.y = evt.clientY;
      }
    });
    this.panZoomEl.addEventListener('mouseup', (evt: MouseEvent) => {
      this.config.states.panning = false;
    });
  }

  private bindObjectEvents (): void {

    const updateObject = (opt: any) => {
      const object = opt.target;
      const promises: Array<Promise<unknown>> = [];

      // Ensure a Rect objects width/height changes when resize, not scaling
      switch (object.type) {
        case 'image':
        case 'rect':
          this.resetRectObjectPosition(object);
          break;
      }

      switch (object.tid) {
        case 'area':
          promises.push(object.updateImage(this.getObject('id', object.source)));
          break;
      }

      Promise.all(promises).then(() => {
        this.canvas.requestRenderAll();
        this.updateData();
        this.updateHistory();
      });
    };
    this.canvas.on('object:moved', updateObject);
    this.canvas.on('object:scaled', updateObject);
  }

  private bindSelectionEvents (): void {

    const onSelectionChange = (opt: any) => {
      // console.log('onSelectionChange(): ', opt);
      if (opt.selected) {
        let objects = [];
        const selection = this.canvas.getActiveObject() as any;
        if (!selection.tid) {
          // This is a mouse drag selection
          selection.hasControls = false;
          selection.hasBorders = false;
          selection.selectable = false;
          selection.evented = false;
          selection.getObjects().forEach((sO) => {
            if (sO.tid === 'sentence' || sO.tid === 'word') {
              const glyphs = sO.getGlyphs(this.canvas);
              objects = concat(objects, glyphs);
            } else {
              objects.push(sO);
            }
          });
        } else {
          if (selection.tid === 'sentence' || selection.tid === 'word') {
            const glyphs = selection.getGlyphs(this.canvas);
            objects = glyphs;
          } else {
            objects = [selection];
          }
        }
        this.selectObjects(objects, false);
      }
    };

    this.canvas.on('selection:created', onSelectionChange);
    this.canvas.on('selection:updated', onSelectionChange);
    this.canvas.on('selection:cleared', () => {
      this.setObjectsDeselected();
      this.updateData(false, false);
    });
  }

  private bindKeyboardShortcuts (): void {

    const activeModifiers = {
      space: {
        active: false,
        prevMode: 'select' as WorkspaceConfig['tools']['selected'],
      },
    };

    // Select mode (s)
    Mousetrap.bind('s', () => {
      if (this.config.tools.enabled.select && this.config.tools.selected !== 'select') {
        this.toolClick('select');
      }
    });

    // Pan mode (p)
    Mousetrap.bind('p', () => {
      if (this.config.tools.enabled.pan && this.config.tools.selected !== 'pan') {
        this.toolClick('pan');
      }
    });

    // Draw mode (d)
    Mousetrap.bind('d', () => {
      if (this.config.tools.enabled.draw && this.config.tools.selected !== 'draw') {
        this.toolClick('draw');
      }
    });

    // Erase mode (e)
    Mousetrap.bind('e', () => {
      if (this.config.tools.enabled.erase && this.config.tools.selected !== 'erase') {
        this.toolClick('erase');
      }
    });

    // Marquee mode (m)
    Mousetrap.bind('m', () => {
      if (this.config.tools.enabled.marquee && this.config.tools.selected !== 'marquee') {
        this.toolClick('marquee');
      }
    });

    // Polygon mode (g)
    Mousetrap.bind('g', () => {
      if (this.config.tools.enabled.polygon && this.config.tools.selected !== 'polygon') {
        this.toolClick('polygon');
      }
    });

    // Zoom in (Mac: CMD+PLUS, Windows: CTRL+PLUS)
    Mousetrap.bind('mod+=', () => {
      this.zoomByDelta(-0.5);
      return false;
    });

    // Zoom zero (Mac: CMD+0, Windows: CTRL+0)
    Mousetrap.bind('mod+0', () => {
      this.toolClick('zoomZero');
      return false;
    });

    // Zoom out (Mac: CMD+MINUS, Windows: CTRL+MINUS)
    Mousetrap.bind('mod+-', () => {
      this.zoomByDelta(0.5);
      return false;
    });

    // Undo (Mac: CMD+Z, Windows: CTRL+Z)
    Mousetrap.bind('mod+z', () => {
      if (this.config.tools.enabled.undo) {
        this.toolClick('undo');
        return false;
      }
    });

    // Redo (Mac: CMD+SHIFT+Z, Windows: CTRL+Y)
    Mousetrap.bind(['mod+shift+z', 'mod+y'], () => {
      if (this.config.tools.enabled.redo) {
        this.toolClick('redo');
        return false;
      }
    });

    // Pan modifier ON (space)
    Mousetrap.bind('space', () => {
      if (!activeModifiers.space.active && this.config.tools.selected !== 'pan') {
        activeModifiers.space.prevMode = this.config.tools.selected;
        activeModifiers.space.active = true;
        this.toolClick('pan');
      }
    }, 'keydown');

    // Pan modifier OFF (space)
    Mousetrap.bind('space', () => {
      if (activeModifiers.space.active && this.config.tools.selected === 'pan') {
        this.toolClick(activeModifiers.space.prevMode);
        activeModifiers.space.active = false;
      }
    }, 'keyup');

  }

  private bindBuilderEvents (type: BuilderData['type']): void {

    const saveObject = (object: Annotation | Glyph | Area | AutoIdentifyRect | Drawing) => {
      this.toolClick('select');
      this.canvas.discardActiveObject();
      this.canvas.setActiveObject(object);
      this.canvas.requestRenderAll();
      this.updateData();
      this.updateHistory();
    };

    const mouseMoveHandler = (opt: fabric.IEvent) => {
      const evt = opt.e;
      evt.preventDefault();
      evt.stopPropagation();
      this.builderData.instance.onMouseMove(opt);
    };
    this.canvas.on('mouse:move', mouseMoveHandler);
    this.builderData.eventHandlers.push({
      event: 'mouse:move',
      handler: mouseMoveHandler,
    });

    // Additional, type specific, binds
    switch (type) {
      case 'area':

        const mouseDownHandlerArea = (opt: fabric.IEvent) => {
          const evt = opt.e;
          evt.preventDefault();
          evt.stopPropagation();
          const object = this.builderData.instance.onMouseDown(opt);
          if (object) {
            saveObject(object);
          }
        };
        this.canvas.on('mouse:down', mouseDownHandlerArea);
        this.builderData.eventHandlers.push({
          event: 'mouse:down',
          handler: mouseDownHandlerArea,
        });

        const mouseUpHandlerArea = (opt: fabric.IEvent) => {
          const evt = opt.e;
          evt.preventDefault();
          evt.stopPropagation();
          saveObject((<AreaBuilder>this.builderData.instance).generate() as Area);
        };
        this.canvas.on('mouse:up', mouseUpHandlerArea);
        this.builderData.eventHandlers.push({
          event: 'mouse:up',
          handler: mouseUpHandlerArea,
        });
        break;

      case 'annotation':
      case 'glyph':

        const savePolyObject = (object) => {
          if (object) {
            switch (object.tid) {
              case 'annotation':
                saveObject(object as Annotation);
                break;
              case 'glyph':
                this.addGlyphToSequence(object as Glyph, (<GlyphBuilder>this.builderData.instance).parent).then((glyph: Glyph) => {
                  saveObject(glyph as Glyph);
                });
                break;
            }
          }
        };

        const mouseDownHandlerPoly = (opt: fabric.IEvent) => {
          const evt = opt.e;
          evt.preventDefault();
          evt.stopPropagation();
          savePolyObject(this.builderData.instance.onMouseDown(opt));
        };
        this.canvas.on('mouse:down', mouseDownHandlerPoly);
        this.builderData.eventHandlers.push({
          event: 'mouse:down',
          handler: mouseDownHandlerPoly,
        });


        // ESC to cancel polygon creation
        Mousetrap.bind('esc', () => {
          this.toolClick('select');
          return false;
        });

        // Enter to complete current polygon
        Mousetrap.bind('enter', e => {
          savePolyObject((<GlyphBuilder | AnnotationBuilder>this.builderData.instance).generate());
          return false;
        });

        break;

      case 'auto-identify-rect':

        const mouseDownHandlerAI = (opt: fabric.IEvent) => {
          const evt = opt.e;
          evt.preventDefault();
          evt.stopPropagation();
          const object = this.builderData.instance.onMouseDown(opt);
          if (object) {
            saveObject(object);
          }
        };
        this.canvas.on('mouse:down', mouseDownHandlerAI);
        this.builderData.eventHandlers.push({
          event: 'mouse:down',
          handler: mouseDownHandlerAI,
        });

        const mouseUpHandlerAI = (opt: fabric.IEvent) => {
          const evt = opt.e;
          evt.preventDefault();
          evt.stopPropagation();
          const rect: AutoIdentifyRect = (<AutoIdentifyRectBuilder>this.builderData.instance).generate(opt);
          this.fetchAutoIdentifyRectSentence(rect, (<AutoIdentifyRectBuilder>this.builderData.instance).parent).then((glyphs: Array<Glyph>) => {
            this.deleteObjects([rect], true, false);
            this.toolClick('select');
            this.canvas.requestRenderAll();
            this.selectObjects(glyphs);
            this.updateData();
            this.updateHistory();
          });
        };
        this.canvas.on('mouse:up', mouseUpHandlerAI);
        this.builderData.eventHandlers.push({
          event: 'mouse:up',
          handler: mouseUpHandlerAI,
        });
        break;

      case 'drawing':

        const mouseDownHandlerDrawing = (opt: fabric.IEvent) => {
          const evt = opt.e;
          evt.preventDefault();
          evt.stopPropagation();
          const object = this.builderData.instance.onMouseDown(opt);
          if (object) {
            saveObject(object);
          }
        };
        this.canvas.on('mouse:down', mouseDownHandlerDrawing);
        this.builderData.eventHandlers.push({
          event: 'mouse:down',
          handler: mouseDownHandlerDrawing,
        });

        const pathCreatedHandlerDrawing = (opt: fabric.IEvent) => {
          const path: fabric.Path = (<any>opt).path;
          (<DrawingBuilder>this.builderData.instance).build(path).then((object: Drawing) => {
            this.canvas.remove(path);
            this.canvas.requestRenderAll();
            this.updateData();
            this.updateHistory();
          });
        };
        this.canvas.on('path:created', pathCreatedHandlerDrawing);
        this.builderData.eventHandlers.push({
          event: 'path:created',
          handler: pathCreatedHandlerDrawing,
        });
        break;
    }
  }

  private unbindBuilderEvents (type: BuilderData['type']): void {

    // Unbind Fabric events
    this.builderData.eventHandlers.forEach(handler => this.canvas.off(handler.event, handler.handler));

    // Unbind additional, type specific, binds
    switch (type) {
      case 'area':
      case 'auto-identify-rect':
      case 'drawing':
        break;
      case 'annotation':
      case 'glyph':
        // ESC to cancel polygon creation
        Mousetrap.unbind('esc');
        // Enter to complete current polygon
        Mousetrap.unbind('enter');
        break;
    }
  }

  private resize (e: Event, width: number = this.workspaceEl.clientWidth, height: number = this.workspaceEl.clientHeight): void {
    if (this.canvas) {
      this.canvas.setDimensions({
        width: width,
        height: height,
      });
      this.canvas.requestRenderAll();
    }
  }

  private reset (): void {
    if (this.canvas) {
      const defaultSources = this.getObjects('tid', ['source']);
      let width = this.canvas.getWidth();
      let height = this.canvas.getHeight();
      if (defaultSources[0]) {
        width = defaultSources[0].width;
        height = defaultSources[0].height;
      }
      this.zoom(1);
      this.canvas.viewportTransform[4] = (this.canvas.getWidth() - width) / 2;
      this.canvas.viewportTransform[5] = (this.canvas.getHeight() - height) / 2;
      this.setCoords([]);
    }
  }

  private setObjectsSelected(objects: Array<Annotation | Glyph | Sentence | Word | Area | Drawing>): void {
    const parents: Array<string> = [];
    objects.forEach((o: any) => {
      o.set(this.getObjectStyles(o.tid, 'active'));
      o.set({ selected: true });
      if (o.parentId) {
        parents.push(o.parentId);
      }
    });

    this.setObjectParentSelections(uniq(parents));
  }

  private setObjectsDeselected(objects: Array<Annotation | Glyph | Sentence | Word | Area | Drawing> = this.getBuilderObjects()): void {
    const parentWords: Array<string> = [];
    objects.forEach((o: any) => {
      o.set(this.getObjectStyles(o.tid, 'inactive'));
      o.set({ selected: false });
      if (o.tid && o.tid === 'glyph' && o.parentId) {
        parentWords.push(o.parentId);
      }
    });

    this.setObjectParentSelections(parentWords);
  }

  private setObjectParentSelections(parentWords: Array<Word['id']>): void {
    let parentSentences: Array<string> = [];

    // Update parent selections for words
    parentWords.forEach(parentId => {
      const word = this.getObject('id', parentId);
      if (word) {
        word.selected = filter(word.getGlyphs(), glyph => glyph.selected).length;
        if (word.selected && word.parentId) {
          parentSentences.push(word.parentId);
        }
      }
    });

    // De-dupe
    parentSentences = uniq(parentSentences);

    // Update parent selections for sentences
    let sentenceSelectedCnt = 0;
    parentSentences.forEach(parentId => {
      const sentence = this.getObject('id', parentId);
      if (sentence) {
        sentence.selected = filter(sentence.getWords(), word => word.selected).length > 1;
        if (sentence.selected) {
          // If this sentence is selected then deselect the words within
          sentence.getWords().forEach(word => word.selected = false);
          sentenceSelectedCnt++;
        }
      }
    });

    // If more than one sentence is selected then we are at the top level. Deselect all
    if (sentenceSelectedCnt > 1) {
      parentSentences.forEach(parentId => {
        const sentence = this.getObject('id', parentId);
        if (sentence) {
          sentence.selected = false;
        }
      });
    }

    this.config.selectedGlyphParent = this.builderData.selectedGlyphParent = this.getSelectedParent();
  }

  private getSelectedParent(): Sentence | Word {

    // Selected sentence first, potentally quicker...
    const selectedSentence = find(this.data.analyse.sentences, s => s.selected);
    if (selectedSentence) {
      return selectedSentence;
    }

    // Try for word next, or null...
    let selectedWord = null;
    find(this.data.analyse.sentences, s => {
      selectedWord = find(s.getWords(), w => w.selected);
      return !!selectedWord;
    });

    return selectedWord;
  }

  private updateActiveSelection(tid: Annotation['tid'] | Glyph['tid'] | Sentence['tid'] | Word['tid'] | Area['tid'] ): void {
    const selectedObjects = filter(this.getBuilderObjects(), o => typeof o.selected !== undefined && o.selected && o.tid === tid);
    this.canvas.discardActiveObject();
    let activeSelection = null;
    if (selectedObjects.length > 1) {
      activeSelection = new fabric.ActiveSelection(selectedObjects, {
        canvas: this.canvas,
      } as fabric.IObjectOptions);
    } else if (selectedObjects.length === 1) {
      activeSelection = selectedObjects[0];
    }
    if (activeSelection) {
      this.canvas.setActiveObject(activeSelection);
      this.canvas.requestRenderAll();
    }
  }

  private loadHistory (): void {
    this.config.states.loaded = false;
    this.canvas.clear();
    this.canvas.loadFromJSON(this.history.current.fabric, () => {
      this.reloadObjects().then(() => {

        // Load misc history
        this.data.generate.effects = cloneDeep(this.history.current.misc.effects);

        // Clean up
        this.config.tools.enabled.redo = this.history.redo.stack.length > 0;
        this.config.tools.enabled.undo = this.history.undo.stack.length > 0;
        this.canvas.requestRenderAll();
        this.updateData();
        this.config.states.loaded = true;
      });
    });
  }

  private save (): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.project) {
        this.dataService.saveProject(this.project, this.data, this.config.type).then(resolve);
      }
    });
  }

  private undo (): void {
    this.history.redo.stack.push(this.history.current);
    this.history.current = this.history.undo.stack.pop();
    this.loadHistory();
  }

  private redo (): void {
    this.history.undo.stack.push(this.history.current);
    this.history.current = this.history.redo.stack.pop();
    this.loadHistory();
  }

  private loadSeedData (workspaceSeed: WorkspaceSeed): Promise<Array<void>> {
    const promises: Array<Promise<void>> = [];

    // Load type independent data
    // Generated facsimile effects
    this.data.generate.effects = workspaceSeed.effects;

    // Processed facsimile
    promises.push(this.loadProcessedFacsimileFromStorage(workspaceSeed.facsimile.processed));

    // Sources
    workspaceSeed.sources.forEach((sourceStorage: SourceStorage) => {
      promises.push(this.loadSourceFromStorage(sourceStorage));
    });

    // Load required objects
    switch (this.config.type) {
      case 'process':
        promises.push(this.loadGeneratedFacsimileFromStorage(workspaceSeed.facsimile.generated, true));
        workspaceSeed.areas.forEach((areaSeed: AreaSeed) => {
          promises.push(this.loadAreaFromStorage(areaSeed));
        });
        break;
      case 'generate':
        promises.push(this.loadGeneratedFacsimileFromStorage(workspaceSeed.facsimile.generated));
        workspaceSeed.drawings.forEach((drawingStorage: DrawingStorage) => {
          promises.push(this.loadDrawingFromStorage(drawingStorage));
        });
        break;
      case 'analyse':
        promises.push(this.loadGeneratedFacsimileFromStorage(workspaceSeed.facsimile.generated));
        workspaceSeed.sentences.forEach((sentenceStorage: SentenceStorage) => {
          promises.push(this.loadSentenceFromStorage(sentenceStorage));
        });
        break;
      case 'annotate':
        promises.push(this.loadGeneratedFacsimileFromStorage(workspaceSeed.facsimile.generated));
        workspaceSeed.annotations.forEach((annotationStorage: AnnotationStorage) => {
          promises.push(this.loadAnnotationFromStorage(annotationStorage));
        });
        break;
    }

    return Promise.all(promises);
  }

  private reloadObjects (): Promise<void> {
    return new Promise(resolve => {
      const promises: Array<Promise<unknown>> = [];
      const objects = this.canvas.getObjects();

      objects.forEach((o: any) => {
        switch (o.tid) {
          case 'source':
            this.canvas.remove(o);
            promises.push(this.reloadSource(o));
            break;
          case 'processedFacsimile':
            this.canvas.remove(o);
            promises.push(this.reloadProcessedFacsimile(o));
            break;
          case 'generatedFacsimile':
            this.canvas.remove(o);
            promises.push(this.reloadGeneratedFacsimile(o));
            break;
          case 'area':
            this.canvas.remove(o);
            promises.push(this.reloadArea(o));
            break;
          case 'annotation':
            this.canvas.remove(o);
            promises.push(this.reloadAnnotation(o));
            break;
          case 'sentence':
            this.canvas.remove(o);
            promises.push(this.reloadSentence(o));
            break;
          case 'word':
            this.canvas.remove(o);
            promises.push(this.reloadWord(o));
            break;
          case 'glyph':
            this.canvas.remove(o);
            promises.push(this.reloadGlyph(o));
            break;
          case 'drawing':
            this.canvas.remove(o);
            promises.push(this.reloadDrawing(o));
            break;
        }
      });
      Promise.all(promises).then(() => {
        const morePromises: Array<Promise<unknown>> = [];

        this.reorderObjects();

        this.updateData(this.config.type === 'generate' ? true : false).then(() => {
          switch (this.config.type) {
            case 'process':
              morePromises.push(this.updateAreas());
              break;
            case 'generate':
              break;
            case 'analyse':
              break;
            case 'annotate':
              break;
          }
          Promise.all(morePromises).then(() => {
            resolve();
          });

        });

      });
    });
  }

  private loadSourceFromStorage (sourceStorage: SourceStorage): Promise<void> {
    return new Promise((resolve, reject) => {
      fabric.Image.fromURL(sourceStorage.dataURL, (object: fabric.Image) => {
        if (object) {
          const source = new Source(object.getElement(), {});
          source.set({
            id: sourceStorage.id,
            title: sourceStorage.title,
          });
          this.canvas.add(source);
          resolve();
        } else {
          reject(this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.ERROR.SOURCE.LOAD', {source: sourceStorage.id}));
        }
      });
    });
  }

  private reloadSource (object: any): Promise<void> {
    return new Promise((resolve, reject) => {
      fabric.Image.fromURL(object.src, (o: fabric.Image) => {
        if (o) {
          const source = new Source(o.getElement(), {});
          source.set({
            id: object.id,
            title: object.title,
          });
          this.canvas.add(source);
          resolve();
        } else {
          reject(this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.ERROR.SOURCE.LOAD', { source: object.id }));

        }
      });
    });
  }

  private loadProcessedFacsimileFromStorage (facsimileStorage?: FacsimileStorage): Promise<void> {
    return new Promise((resolve, reject) => {
      if (facsimileStorage) {
        // Load facsimile
        fabric.Image.fromURL(facsimileStorage.dataURL, (object: fabric.Image) => {
          if (object) {
            const facsimile = new Facsimile(object.getElement(), {});
            facsimile.set({
              id: facsimileStorage.id,
              tid: 'processedFacsimile',
              opacity: 0,
            });
            this.canvas.add(facsimile);
            resolve();
          } else {
            reject(this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.ERROR.FACSIMILIE.LOAD', {fax: facsimileStorage.id}));
          }
        });
      } else {
        // Build empty processed facsimile
        fabric.Image.fromURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', (object: fabric.Image) => {
          if (object) {
            const facsimile = new Facsimile(object.getElement(), {});
            facsimile.set({
              tid: 'processedFacsimile',
              opacity: 0,
            });
            this.canvas.add(facsimile);
            resolve();
          } else {
            reject(this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.ERROR.FACSIMILIE.EMPTY'));
          }
        });
      }
    });
  }

  private reloadProcessedFacsimile (object: any): Promise<void> {
    return new Promise((resolve, reject) => {
      // Load facsimile
      fabric.Image.fromURL(object.src, (o: fabric.Image) => {
        if (o) {
          const facsimile = new Facsimile(o.getElement(), {});
          facsimile.set({
            id: object.id,
            tid: 'processedFacsimile',
            opacity: object.opacity,
          });
          this.canvas.add(facsimile);
          resolve();
        } else {
          reject(this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.ERROR.FACSIMILIE.PROCESSED', { fax: object.id }));
        }
      });
    });
  }

  private updateProcessedFacsimile (): Promise<void> {
    return new Promise((resolve, reject) => {

      const sources = this.getObjects('tid', ['source']);
      if (sources.length) {
        const source = sources[0];
        const width = source.width;
        const height = source.height;

        // Create new canvas for facsimile
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        canvas.width = width;
        canvas.height = height;

        // Add area images into canvas
        const areas = this.getObjects('tid', ['area']);
        areas.forEach((area) => {
          ctx.drawImage(
            (<any>area)._element,
            area.left,
            area.top,
            area.width,
            area.height,
          );
        });

        // Export canvas as dataURL
        const facsimileDataURL = canvas.toDataURL();

        // Create new facsimile object
        fabric.Image.fromURL(facsimileDataURL, (object: fabric.Image) => {
          if (object) {
            // Remove old facsimiles
            const previousFacsimile = this.getObject('tid', 'processedFacsimile');
            let facsimileId = null;
            let facsimileOpacity = 1;
            if (previousFacsimile) {
              facsimileId = previousFacsimile.id;
              facsimileOpacity = previousFacsimile.opacity;
              this.canvas.remove(previousFacsimile);
            }
            // Add new facsimile
            const newFacsimile = new Facsimile(object.getElement(), {});
            newFacsimile.set({
              tid: 'processedFacsimile',
              opacity: facsimileOpacity,
            });
            if (facsimileId) {
              newFacsimile.set({
                id: facsimileId,
              });
            }
            this.canvas.add(newFacsimile);

            this.updateGeneratedFacsimile(true).then(() => {
              this.reorderObjects();
              resolve();
            }, resolve);

          } else {
            reject(this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.ERROR.FACSIMILIE.UPDATE'));
          }
        });

      } else {
        reject();
      }

    });
  }

  private loadGeneratedFacsimileFromStorage (facsimileStorage?: FacsimileStorage, hide: boolean = false): Promise<void> {
    return new Promise((resolve, reject) => {
      if (facsimileStorage) {
        // Load facsimile
        fabric.Image.fromURL(facsimileStorage.dataURL, (object: fabric.Image) => {
          if (object) {
            const facsimile = new Facsimile(object.getElement(), {});
            facsimile.set({
              id: facsimileStorage.id,
              tid: 'generatedFacsimile',
              opacity: hide ? 0 : 1,
            });
            this.canvas.add(facsimile);
            resolve();
          } else {
            reject(this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.ERROR.FACSIMILIE.LOAD', { fax: facsimileStorage.id }));
          }
        });
      } else {
        // Build empty facsimile and trigger initial update
        fabric.Image.fromURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', (object: fabric.Image) => {
          if (object) {
            const facsimile = new Facsimile(object.getElement(), {});
            facsimile.set({
              tid: 'generatedFacsimile',
              opacity: hide ? 0 : 1,
            });
            this.canvas.add(facsimile);
            resolve();
          } else {
            reject(this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.ERROR.FACSIMILIE.EMPTY'));
          }
        });
      }
    });
  }

  private reloadGeneratedFacsimile (object: any): Promise<void> {
    return new Promise((resolve, reject) => {
      // Load facsimile
      fabric.Image.fromURL(object.src, (o: fabric.Image) => {
        if (o) {
          const facsimile = new Facsimile(o.getElement(), {});
          facsimile.set({
            id: object.id,
            tid: 'generatedFacsimile',
            opacity: object.opacity,
          });
          this.canvas.add(facsimile);
          resolve();
        } else {
          reject(this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.ERROR.FACSIMILIE.GENERATED', {fax: object.id}));
        }
      });
    });
  }

  private updateGeneratedFacsimile (hide: boolean = false): Promise<void> {
    return new Promise((resolve, reject) => {

      const processedFacsimile = this.getObject('tid', 'processedFacsimile');
      if (processedFacsimile) {
        const width = processedFacsimile.width;
        const height = processedFacsimile.height;

        // Create new canvas for facsimile
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        canvas.width = width;
        canvas.height = height;

        // Draw process facsimile onto canvas
        const oldOpacity = processedFacsimile.opacity;
        processedFacsimile.opacity = 1; // Ensure facimile is visible!
        ctx.drawImage(
          (<any>processedFacsimile)._element,
          processedFacsimile.left,
          processedFacsimile.top,
          processedFacsimile.width,
          processedFacsimile.height,
        );
        processedFacsimile.opacity = oldOpacity;

        // Get image data
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // ------------------------------------------------------------------ //
        // Apply drawings to canvas

        if (this.data.generate.effects.drawing.active) {
          this.data.generate.drawings.forEach((drawing: Drawing) => {
            imageData = drawing.getCompositeImageData(imageData);
          });
        }

        // ------------------------------------------------------------------ //
        // Apply effects to canvas

        if (this.data.generate.effects.trace.active) {
          const trace = new Trace(imageData);
          imageData = trace.update({ level: this.data.generate.effects.trace.level });
        }

        if (this.data.generate.effects.outlines.active) {
          const outlines = new Outlines(imageData);
          imageData = outlines.update({ level: this.data.generate.effects.outlines.level });
        }
        // ------------------------------------------------------------------ //

        // Export canvas as dataURL
        ctx.putImageData(imageData, 0, 0);
        const facsimileDataURL = canvas.toDataURL();

        // Create new facsimile object
        fabric.Image.fromURL(facsimileDataURL, (object: fabric.Image) => {
          if (object) {
            // Remove old facsimiles
            const previousFacsimile = this.getObject('tid', 'generatedFacsimile');
            let facsimileId = null;
            let facsimileOpacity = hide ? 0 : 1;
            if (previousFacsimile) {
              facsimileId = previousFacsimile.id;
              facsimileOpacity = previousFacsimile.opacity;
            }
            // Add new facsimile
            const newFacsimile = new Facsimile(object.getElement(), {});
            newFacsimile.set({
              tid: 'generatedFacsimile',
              opacity: facsimileOpacity,
            });
            if (facsimileId) {
              newFacsimile.set({
                id: facsimileId,
              });
            }
            this.canvas.add(newFacsimile);

            // Remove previous facsimile
            if (previousFacsimile) {
              this.canvas.remove(previousFacsimile);
            }

            // Hide drawing objects
            this.data.generate.drawings.forEach((drawing: Drawing) => {
              drawing.set({ opacity: 0 });
            });

            this.reorderObjects();

            resolve();
          } else {
            reject(`Cannot update facsimile`);
          }
        });

      } else {
        reject();
      }

    });
  }

  private loadAreaFromStorage (areaSeed: AreaSeed): Promise<void> {
    return new Promise(resolve => {
      const area = new Area(areaSeed.position);
      area.set({
        author: areaSeed.author,
        created: areaSeed.created,
        effects: areaSeed.effects,
        source: areaSeed.source,
      });
      this.canvas.add(area);
      resolve();
    });
  }

  private reloadArea (object: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const position = {
        top: object.top,
        left: object.left,
        width: object.width,
        height: object.height,
      };
      const area = new Area(position);
      area.set({
        author: object.author,
        created: object.created,
        effects: object.effects,
        source: object.source,
      });
      this.canvas.add(area);
      resolve();
    });
  }

  private updateAreas (): Promise<Array<void>> {
    const promises: Array<Promise<void>> = [];
    this.data.process.areas.forEach(area => {
      promises.push(area.updateImage(this.getObject('id', area.source)));
    });
    return Promise.all(promises).then(() => {
      this.canvas.requestRenderAll();
      return null;
    });
  }

  private loadDrawingFromStorage (drawingStorage: DrawingStorage): Promise<void> {
    return new Promise(resolve => {
      this.utils.imgFromDataURL(drawingStorage.dataURL).then((img) => {
        const drawing = new Drawing(drawingStorage.position, img);
        drawing.set({
          author: drawingStorage.author,
          created: drawingStorage.created,
        });
        this.canvas.add(drawing);
        resolve();
      });
    });
  }

  private reloadDrawing (object: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.utils.imgFromDataURL(object.src).then((img) => {
        const position = {
          top: object.top,
          left: object.left,
          width: object.width,
          height: object.height,
        };
        const drawing = new Drawing(position, img);
        drawing.set({
          author: object.author,
          created: object.created,
        });
        this.canvas.add(drawing);
        resolve();
      });
    });
  }

  private loadAnnotationFromStorage (annotationStorage: AnnotationStorage): Promise<void> {
    return new Promise(resolve => {
      const annotation = new Annotation(annotationStorage.points);
      annotation.set({
        author: annotationStorage.author,
        created: annotationStorage.created,
        comments: annotationStorage.comments,
      });
      this.canvas.add(annotation);
      resolve();
    });
  }

  private reloadAnnotation (object: Annotation): Promise<Annotation> {
    return new Promise(resolve => {
      const annotation = new Annotation(object.points);
      annotation.set({
        author: object.author,
        created: object.created,
        comments: object.comments,
      });
      this.canvas.add(annotation);
      resolve(annotation);
    });
  }

  private createGlyph (points: Array<WorkspacePoint>, order: Glyph['order'], parent?: Word | Sentence): Glyph {
    const glyph = new Glyph(points, parent ? parent.id : null, this.canvas);
    glyph.set({
      author: this.settings.userFullName,
      order: order,
    });
    return glyph;
  }

  private reloadGlyph (object: Glyph): Promise<Glyph> {
    return new Promise(resolve => {
      const glyph = new Glyph(object.points, object.parentId, this.canvas);
      glyph.set({
        author: object.author,
        created: object.created,
        gardinerCode: object.gardinerCode,
        gardinerCodePredictions: object.gardinerCodePredictions,
        id: object.id,
        locked: object.locked,
        order: object.order,
      });
      this.canvas.add(glyph);
      resolve(glyph);
    });
  }

  private addGlyphToSequence (glyph: Glyph, parent: Sentence | Word): Promise<Glyph> {
    return new Promise(resolve => {
      if (glyph) {
        if (parent && parent.tid) {
          switch (parent.tid) {
            case 'sentence':
              const word = new Word(null, parent.id, this.canvas);
              glyph.parentId = word.id;
              word.addGlyph(glyph);
              (<Sentence>parent).addWord(word);
              break;
            case 'word':
              glyph.parentId = parent.id;
              (<Word>parent).addGlyph(glyph);
              break;
          }
        } else {
          const sentence = new Sentence(null, this.canvas);
          const word = new Word(null, sentence.id, this.canvas);
          glyph.parentId = word.id;
          word.addGlyph(glyph);
          sentence.order = this.getObjects('tid', ['sentence']).length;
          sentence.addWord(word);
          this.canvas.add(sentence);
        }
      }
      resolve(glyph);
    });
  }

  private loadSentenceFromStorage (sentenceStorage: SentenceStorage): Promise<void> {
    return new Promise(resolve => {
      const sentence = new Sentence(sentenceStorage, this.canvas);
      this.canvas.add(sentence);
      resolve();
    });
  }

  private reloadSentence (object: any): Promise<void> {
    return new Promise(resolve => {
      const sentenceStorage: SentenceStorage = {
        author: object.author,
        created: object.created,
        words: [],
        order: object.order,
        position: {
          top: object.top,
          left: object.left,
          width: object.width,
          height: object.height,
        },
        interpretation: object.interpretation,
        transliteration: object.transliteration,
      };
      const sentence = new Sentence(sentenceStorage, this.canvas);
      sentence.set({
        id: object.id,
        words: object.words,
        expanded: object.expanded,
      });
      this.canvas.add(sentence);
      resolve();
    });
  }

  private reloadWord (object: any): Promise<void> {
    return new Promise(resolve => {
      const wordStorage: WordStorage = {
        author: object.author,
        created: object.created,
        glyphs: [],
        isCartouche: object.isCartouche,
        order: object.order,
        position: {
          top: object.top,
          left: object.left,
          width: object.width,
          height: object.height,
        },
        translation: object.translation,
        transliteration: object.transliteration,
      };
      const word = new Word(wordStorage, object.parentId, this.canvas);
      word.set({
        id: object.id,
        glyphs: object.glyphs,
        expanded: object.expanded,
      });
      this.canvas.add(word);
      resolve();
    });
  }

  private fetchAutoIdentifyRectSentence (object: AutoIdentifyRect, targetParent?: Sentence | Word): Promise<Array<Glyph>> {

    return new Promise((resolve, reject) => {

      // Check if there are any glyphs already identified in this objects area
      // Flag to user to confirm deletion or bail out
      const presentGlyphs = this.findGlyphsInRect(object);
      if (
        presentGlyphs.length > 0 &&
        !confirm(this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.CONFIRM', { glyphs: presentGlyphs.length } ))
      ) {
        resolve([]);
        return;
      }

      // Remove any present glyphs
      this.deleteGlyphs(presentGlyphs, true);

      const objectPosition = this.calcObjectPosition(object);
      this.getRectImgOfFacsimile(objectPosition, true).then((dataUrl: string) => {

        const data: IdentificationRequest = {
          image: dataUrl,
          direction: (<AutoIdentifyRect>object).direction,
          threshold: this.settings.clusterAnalysis.threshold,
        };

        this.apiService.post('identify', data).then((identificationResponse: IdentificationResponse) => {

          // Create new sentence/word
          let sentence: Sentence = null;
          let word: Word = null;
          let isNewSentence = false;
          let isSameWord = false;
          const totalGlyphs: Array<Glyph> = [];

          if (targetParent && targetParent.tid) {
            if (targetParent.tid === 'sentence') {
              // `addToSentence` = Loop through `identificationWords` adding each as a new word to the sentence
              sentence = (<Sentence>targetParent);
            } else if (targetParent.tid === 'word') {
              // Loop through `identificationWords`, first one gets it's glyphs added to the current word, then each as a new word to the sentence after that
              sentence = (<Word>targetParent).getParent();
              word = (<Word>targetParent);
              isSameWord = true;
            }
          } else {
            // `addToSentence` = Loop through `identificationWords` adding each as a new word to the sentence
            sentence = new Sentence(null, this.canvas);
            sentence.order = this.getObjects('tid', ['sentence']).length;
            isNewSentence = true;
          }

          const identificationWords: Array<IdentificationWord> = this.parseAutoIdentifyRectGlyphs(identificationResponse);
          identificationWords.forEach((identificationWord, i) => {
            if (identificationWord.clusters.length) {

              const glyphs: Array<Glyph> = [];
              if (!isSameWord || isSameWord && i > 0) {
                word = new Word(null, sentence.id, this.canvas);
                word.isCartouche = identificationWord.isCartouche;
                word.order = i;
              }

              identificationWord.clusters.forEach(cluster => {
                if (cluster.bounds && cluster.hull && cluster.hull.length) {

                  // Create points
                  const points: Array<WorkspacePoint> = [];
                  cluster.hull.forEach(hullPoint => {
                    points.push({
                      x: hullPoint.x + objectPosition.left,
                      y: hullPoint.y + objectPosition.top,
                    });
                  });

                  // Create new glyph
                  const glyph = this.createGlyph(points, cluster.bounds.order, word);
                  glyphs.push(glyph);
                  totalGlyphs.push(glyph);
                }
              });

              glyphs.forEach(g => word.addGlyph(g));
              if (!isSameWord || isSameWord && i > 0) {
                sentence.addWord(word);
              }

            } else {
              this.notificationsService.error(this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.ERROR.API_MAL'));
            }
          });

          // Build sentence
          if (isNewSentence) {
            this.canvas.add(sentence);
          }
          resolve(totalGlyphs);

        }, (err) => {
          this.notificationsService.error(this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.ERROR.API_ID'));
          console.warn(this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.WARN.API_ID'), err);
          resolve(null);
        });

      });
    });
  }

  private parseAutoIdentifyRectGlyphs (identificationResponse: IdentificationResponse): Array<IdentificationWord> {

    let identificationWords: Array<IdentificationWord> = [];

    // edit data if cartouches exist in API response
    if (identificationResponse) {
      if (identificationResponse.cartouches) {
        const clustersLookup = {};
        identificationResponse.clusters.forEach((cluster, i) => {
          clustersLookup['cluster_' + cluster.cluster_id] = cluster;
        });

        identificationResponse.cartouches.forEach((cartouche, i) => {
          // add cartouche location vars to clusters
          cartouche.inner.forEach((inner, j) => {
            if (j === 0) {
              if (identificationResponse.direction === 'ltr') {
                clustersLookup['cluster_' + inner].isCartoucheStart = true;
              } else if (identificationResponse.direction === 'rtl') {
                clustersLookup['cluster_' + inner].isCartoucheEnd = true;
              }
            } else if (j === cartouche.inner.length - 1) {
              if (identificationResponse.direction === 'ltr') {
                clustersLookup['cluster_' + inner].isCartoucheEnd = true;
              } else if (identificationResponse.direction === 'rtl') {
                clustersLookup['cluster_' + inner].isCartoucheStart = true;
              }
            } else {
              clustersLookup['cluster_' + inner].isCartoucheInner = true;
            }
          });
          // remove clusters that denote cartouches and don't represent glyphs
          cartouche.frames.forEach((frame, j) => {
            if (clustersLookup['cluster_' + frame]) { delete clustersLookup['cluster_' + frame]; }
          });
          cartouche.wrapper.forEach((wrapper, j) => {
            if (clustersLookup['cluster_' + wrapper]) { delete clustersLookup['cluster_' + wrapper]; }
          });
        });
        // reasemble clusters array
        let wordCnt = 0;
        for (const key in clustersLookup) {
          if (clustersLookup.hasOwnProperty(key)) {
            const cluster = clustersLookup[key];
            if (cluster.isCartoucheStart) {
              wordCnt++;
            }
            if (!identificationWords[wordCnt]) {
              identificationWords[wordCnt] = {
                isCartouche: cluster.isCartoucheStart || false,
                clusters: [],
              };
            }
            identificationWords[wordCnt].clusters.push(cluster);
            if (cluster.isCartoucheEnd) {
              wordCnt++;
            }
          }
        }

      // no cartouche data exists so return clusters unprocessed
      } else {
        identificationWords = [{
          isCartouche: false,
          clusters: identificationResponse.clusters,
        }];
      }
    }

    return identificationWords;
  }

  private findGlyphsInRect (rectObject: AutoIdentifyRect): Array<Glyph> {
    const glyphs: Array<Glyph> = [];
    this.getObjects('tid', ['glyph']).forEach(glyph => {
      if (rectObject.intersectsWithObject(glyph)) {
        glyphs.push(glyph);
      }
    });
    return glyphs;
  }

  private setCoords (types: Array<string> = []): void {
    if (this.canvas) {
      let objects = [];
      if (types.length) {
        objects = this.getObjects('tid', types);
      } else {
        objects = this.canvas.getObjects();
      }
      objects.forEach(o => o.setCoords());
      this.canvas.requestRenderAll();
    }
  }

  private getBuilderObjects (): Array<Annotation | Glyph | Sentence | Word | Area | Drawing> {
    const objects = filter(this.canvas.getObjects(), o => {
      return o.tid && o.tid !== 'source' && o.tid !== 'processedFacsimile' && o.tid !== 'generatedFacsimile';
    });
    return this.getDeepObjects(objects);
  }

  private getDeepObjects (objects: Array<Annotation | Glyph | Sentence | Word | Area | Drawing>): Array<Annotation | Glyph | Sentence | Word | Area | Drawing> {
    let deepObjects = [];
    if (objects) {
      objects.forEach(o => {
        if (o.id) {
          // If a group then get all children
          if (o.tid === 'sentence') {
            deepObjects = unionBy(deepObjects, (<Sentence>o).getWords((<Sentence>o).wordCount() > 0));
            deepObjects = unionBy(deepObjects, (<Sentence>o).getGlyphs((<Sentence>o).glyphCount() > 0));
          } else if (o.tid === 'word') {
            deepObjects = unionBy(deepObjects, (<Word>o).getGlyphs((<Word>o).glyphCount() > 0));
          }
          deepObjects = unionBy(deepObjects, [o]);
        }
      });
    }
    return deepObjects;
  }

  private zoom (zoom: number): void {
    if (this.canvas) {
      this.config.tools.enabled.zoomIn = true;
      this.config.tools.enabled.zoomZero = true;
      this.config.tools.enabled.zoomOut = true;

      if (zoom > 5) {
        zoom = 5;
        this.config.tools.enabled.zoomIn = false;
      }
      if (zoom === 1) {
        this.config.tools.enabled.zoomZero = false;
      }
      if (zoom < 0.1) {
        zoom = 0.1;
        this.config.tools.enabled.zoomOut = false;
      }
      this.canvas.setZoom(zoom);
      this.updateDrawEraseClasses();
      this.savePosition();
    }
  }

  private zoomByDelta (delta: number, point?: fabric.Point): void {
    if (this.canvas) {
      this.config.tools.enabled.zoomIn = true;
      this.config.tools.enabled.zoomZero = true;
      this.config.tools.enabled.zoomOut = true;

      point = point || new fabric.Point(this.canvas.getWidth() / 2, this.canvas.getHeight() / 2);
      let zoom = this.canvas.getZoom();
      zoom = zoom * (1 - (100 / zoom) * (delta / 500));
      if (zoom > 5) {
        zoom = 5;
        this.config.tools.enabled.zoomIn = false;
      }
      if (zoom === 1) {
        this.config.tools.enabled.zoomZero = false;
      }
      if (zoom < 0.1) {
        zoom = 0.1;
        this.config.tools.enabled.zoomOut = false;
      }
      this.canvas.zoomToPoint(point, zoom);
      this.updateDrawEraseClasses();
      this.savePosition();
    }
  }

  private pan (deltaX: number, deltaY: number): void {
    if (this.canvas) {
      this.canvas.viewportTransform[4] += deltaX;
      this.canvas.viewportTransform[5] += deltaY;
      this.setCoords([]);
      this.savePosition();
    }
  }

  private loadPosition (position: WorkspacePosition): void {
    if (
      position &&
      (
        position.x !== 0 &&
        position.y !== 0 &&
        position.zoom !== 1
      )
    ) {
      this.zoom(position.zoom);
      this.pan(
        position.x - this.canvas.viewportTransform[4],
        position.y - this.canvas.viewportTransform[5],
      );
    } else {
      this.reset();
    }
  }

  private savePosition (): void {
    if (this.config.states.loaded) {
      const position: WorkspacePosition = {
        x: this.canvas.viewportTransform[4],
        y: this.canvas.viewportTransform[5],
        zoom: this.canvas.getZoom(),
      };
      this.dataService.updateWorkspacePosition(position);
    }
  }

  private getObjectStyles (objectType: string, state: string): object {
    switch (objectType) {
      case 'area':
        return areaStyles[state];
      case 'annotation':
        return annotationStyles[state];
      case 'glyph':
        return glyphStyles[state];
    }
  }

  private enableBuilderTool (type: BuilderData['type']): void {

    switch (type) {
      case 'area':
        this.canvas.defaultCursor = 'crosshair';
        this.builderData.instance = new AreaBuilder(this.canvas, this.settings.userFullName, this.data.sources[0].id);
        break;
      case 'annotation':
        this.canvas.defaultCursor = 'crosshair';
        this.builderData.instance = new AnnotationBuilder(this.canvas, this.settings.userFullName);
        break;
      case 'glyph':
        this.canvas.defaultCursor = 'crosshair';
        this.canvas.selection = false;
        this.builderData.instance = new GlyphBuilder(this.canvas, this.settings.userFullName, this.builderData.selectedGlyphParent);
        break;
      case 'auto-identify-rect':
        this.canvas.defaultCursor = 'crosshair';
        this.canvas.selection = false;
        this.builderData.instance = new AutoIdentifyRectBuilder(this.canvas, this.builderData.selectedGlyphParent);
        break;
      case 'drawing':
        this.canvas.defaultCursor = 'crosshair';
        this.canvas.selection = false;
        this.canvas.isDrawingMode = true;
        this.builderData.instance = new DrawingBuilder(this.canvas, this.settings.userFullName, {
          type: this.config.tools.selected === 'erase' ? 'erase' : 'draw',
          width: this.data.generate.effects.drawing.width,
        } as DrawData);
        break;
    }

    this.builderData.type = type;
    this.bindBuilderEvents(type);
  }

  private disableBuilderTool (type: BuilderData['type']): void {

    switch (type) {
      case 'area':
      case 'annotation':
        this.canvas.defaultCursor = 'default';
        break;
      case 'glyph':
      case 'auto-identify-rect':
        this.canvas.defaultCursor = 'default';
        this.canvas.selection = true;
        break;
      case 'drawing':
        this.canvas.defaultCursor = 'default';
        this.canvas.isDrawingMode = false;
        break;
    }

    this.builderData.type = null;
    this.builderData.instance.clear();
    this.builderData.instance = null;
    this.unbindBuilderEvents(type);
  }

  private updateDrawEraseClasses (): void {
    const bodyEl = document.body;

    // Clear out any current classes
    bodyEl.classList.remove('draw-tool');
    bodyEl.classList.remove('erase-tool');

    // Add in correct classes
    if (
      this.data.generate.effects.drawing.active &&
      (
        this.config.tools.selected === 'draw' ||
        this.config.tools.selected === 'erase'
      )
    ) {
      // Tool class
      bodyEl.classList.add(this.config.tools.selected + '-tool');

      // Width class
      this.removeClassIfStartsWith(bodyEl, 'cursor-width-');
      const cursorWidth = Math.round(this.data.generate.effects.drawing.width * this.canvas.getZoom());
      bodyEl.classList.add('cursor-width-' + Math.min(cursorWidth, 128));
    }
  }

  private removeClassIfStartsWith (el: HTMLElement, startsWith: string): void {
    if (el && startsWith) {
      el.classList.forEach(className => {
        if (className.startsWith(startsWith)) {
          el.classList.remove(className);
        }
      });
    }
  }

  private cursorLoading (state: boolean): void {
    if (state) {
      document.body.classList.add('workspace-loading');
    } else {
      document.body.classList.remove('workspace-loading');
    }
  }

  private errorHandler (err): Error {
    this.notificationsService.error(this.translate.instant('MODULES.PROJECT.SHARED.WORKSPACE.TS.ERROR.WORKSPACE', {err: err.message }));
    throw new Error(err.message);
  }
}
