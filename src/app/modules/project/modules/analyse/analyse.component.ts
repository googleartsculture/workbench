import { ClassificationResult, ClassificationRequest } from '../../../../core/api/classification.modal';
import { Settings } from './../../../settings/settings.model';
import { NotificationsService } from './../../../../core/notifications/notifications.service';
import { includes, filter, pull, find, orderBy, map, uniq, concat } from 'lodash';
import { ApiService } from './../../../../core/api/api.service';
import { Glyph } from './../../shared/workspace/glyph.model';
import { WorkspaceComponent } from './../../shared/workspace/workspace.component';
import { Component, ViewChild, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, Subscription } from 'rxjs';
import { DataService } from './../../../../core/data/data.service';
import { WorkspaceSeed, WorkspaceData } from '../../shared/workspace/workspace.model';
import { ProjectAside, ProjectPanel } from '../../project.model';
import { AnalyseConfig, AnalyseTranslationResult, AnalyseTranslationResults } from './analyse.model';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Sentence } from '../../shared/workspace/sentence.model';
import { Word } from '../../shared/workspace/word.model';
import { TranslateService } from '@ngx-translate/core';
import { debounce } from 'lodash';
import * as ArrayMove from 'array-move';
import { TranslationRequest, TranslationResult} from '../../../../core/api/translation.model';
import { WordStorage } from '../../../../core/storage/storage.model';
import Sortable from 'sortablejs';

interface WordCache {
  parentId: Sentence['id'];
  words: Array<Word>;
}

interface GlyphCache {
  parentId: Word['id'];
  glyphs: Array<Glyph>;
}

@Component({
  selector: 'app-analyse',
  templateUrl: './analyse.component.html',
  styleUrls: ['./analyse.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyseComponent implements OnDestroy {

  @ViewChild('workspace', { static: true }) private workspace: WorkspaceComponent;

  updateWorkspace: () => any = debounce(this.updateWorkspaceDebounced, 100, { trailing: true });

  aside: ProjectAside = {
    active: true,
    loaded: false,
  };
  panel: ProjectPanel = {
    active: false,
    loaded: false,
  };
  settings: Settings;
  workspaceData: WorkspaceData['analyse'];
  config: AnalyseConfig = {
    selected: [],
    editing: {
      active: false,
      object: null,
    },
    ai: {
      identify: {
        enabled: false,
        loading: false,
      },
      classification: {
        enabled: false,
        loading: false,
        glyphs: [],
      },
      translation: {
        enabled: false,
        active: false,
        sentences: [],
      },
    },
    sortable: {
      instances: [],
    },
  };

  // Local cache of sentences, words and glyphs
  // Required for template performance
  sentencesCache: Array<Sentence>;
  wordsCache: Array<WordCache>;
  glyphsCache: Array<GlyphCache>;

  private componentSubs: Array<Subscription> = [];
  private workspaceReadySub: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private workspaceReadyObs: Observable<boolean> = this.workspaceReadySub.asObservable();

  enableDragDrop = false;
  private enableHighlighting = true;

  constructor (
    private dataService: DataService,
    private apiService: ApiService,
    private notificationService: NotificationsService,
    private ngxSmartModalService: NgxSmartModalService,
    private translate: TranslateService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.sentencesCache = [];
    this.wordsCache = [];
    this.glyphsCache = [];

    this.componentSubs.push(
      this.apiService.servicesEnabledObs.subscribe(servicesEnabled => {
        this.config.ai.identify.enabled = includes(servicesEnabled, 'clusterAnalysis');
        this.config.ai.classification.enabled = includes(servicesEnabled, 'classification');
        this.config.ai.translation.enabled = includes(servicesEnabled, 'translation');
      }),
      this.dataService.settingsObs.subscribe((settings: Settings) => {
        this.settings = settings;
      })
    );

    // On load
    const loadSub = combineLatest([
      this.dataService.projectObs,
      this.dataService.workspaceSeedObs,
      this.workspaceReadyObs
    ]).subscribe(([project, workspaceSeed, workspaceReady]) => {
      if (project && workspaceSeed && workspaceReady) {
        this.workspaceInit(workspaceSeed);
        loadSub.unsubscribe();
      }
    });
  }

  ngOnDestroy () {
    this.componentSubs.forEach(sub => sub.unsubscribe());
  }

  onWorkspaceReady (): void {
    this.workspaceReadySub.next(true);
  }

  workspaceInit (workspaceSeed: WorkspaceSeed): void {
    this.workspace.init('analyse', workspaceSeed);
  }

  workspaceUpdate (workspaceData: WorkspaceData): void {
    this.workspaceData = workspaceData.analyse;
    this.setListCaches();
    this.config.selected = this.getSelectedGlyphs();
    if (this.enableDragDrop) {
      this.dragDropInit();
    } else {
      setTimeout(() => {
        this.aside.loaded = true;
        this.changeDetector.detectChanges();
      }, 10);
    }
  }

  setListCaches (): void {
    this.sentencesCache = [];
    this.wordsCache = [];
    this.glyphsCache = [];

    if (this.workspaceData) {
      this.workspaceData.sentences.forEach((s: Sentence) => {
        this.sentencesCache.push(s);
        const sentenceWords = s.getWords();
        const wordCache: WordCache = {
          parentId: s.id,
          words: sentenceWords,
        };
        this.wordsCache.push(wordCache);
        sentenceWords.forEach((w: Word) => {
          const glyphCache: GlyphCache = {
            parentId: w.id,
            glyphs: w.getGlyphs(),
          };
          this.glyphsCache.push(glyphCache);
        });
      });
    }
  }

  getSentenceList (): Array<Sentence> {
    // console.log('getSentenceList()');
    return this.sentencesCache || [];
  }

  getWordList (sentence: Sentence): Array<Word> {
    // console.log('getWordList()');
    let words: Array<Word> = [];
    if (sentence) {
      const wordsCache = find(this.wordsCache, { parentId: sentence.id });
      if (wordsCache) {
        words = wordsCache.words;
      }
    }
    return words;
  }

  getGlyphList (type: 'sentence' | 'word', object: Sentence | Word): Array<Glyph> {
    // console.log('getGlyphList(' + type + ')', object);
    let glyphs: Array<Glyph> = [];
    if (object) {
      if (type === 'sentence') {
        (<Sentence>object).words.forEach((wordId: Word['id']) => {
          const glyphsCache = find(this.glyphsCache, { parentId: wordId });
          if (glyphsCache) {
            glyphs = concat(glyphs, glyphsCache.glyphs);
          }
        });
      }
      if (type === 'word') {
        const glyphsCache = find(this.glyphsCache, { parentId: object.id });
        if (glyphsCache) {
          glyphs = glyphsCache.glyphs;
        }
      }
    }
    // console.log(' - glyphs: ', glyphs);
    return glyphs;
  }

  selectGlyph (glyph: Glyph): void {
    this.workspace.selectObjects([glyph], true, false);
  }

  deleteGlyph (glyph: Glyph): void {
    this.workspace.deleteGlyphs([glyph]);
  }

  toggleExpand (type: 'sentence' | 'word', object: Sentence | Word): void {
    if (object) {
      if (type === 'sentence') {
        (<Sentence>object).expanded = !(<Sentence>object).expanded;
        this.changeDetector.detectChanges();
      }
      if (type === 'word') {
        (<Word>object).expanded = !(<Word>object).expanded;
        this.changeDetector.detectChanges();
      }
    }
  }

  nudge (direction: 'up' | 'down', type: 'sentence' | 'word' | 'glyph', object: Sentence | Word | Glyph, parent: Sentence | Word): void {
    if (object) {
      const newOrder = direction === 'up' ? object.order - 1 : object.order + 1;
      if (type === 'sentence') {
        this.workspace.reorderSentences();
        const list = orderBy(this.workspaceData.sentences, 'order');
        ArrayMove.mutate(list, object.order, newOrder);
        let cnt = 0;
        list.forEach((item: Sentence) => {
          if (item) {
            item.order = cnt;
            cnt++;
          }
        });
        this.workspace.reorderObjects();
      }
      if (type === 'word') {
        (<Sentence>parent).reorderWords();
        const list = (<Sentence>parent).getWords();
        ArrayMove.mutate(list, object.order, newOrder);
        let cnt = 0;
        list.forEach((item: Word) => {
          if (item) {
            item.order = cnt;
            cnt++;
          }
        });
        (<Sentence>parent).reorderWords();
      }
      if (type === 'glyph') {
        (<Word>parent).reorderGlyphs();
        const list = (<Word>parent).getGlyphs();
        ArrayMove.mutate(list, object.order, newOrder);
        let cnt = 0;
        list.forEach((item: Glyph) => {
          if (item) {
            item.order = cnt;
            cnt++;
          }
        });
        (<Word>parent).reorderGlyphs();
      }
      this.updateWorkspace();
    }
  }

  highlightSentence (sentence: Sentence, state: boolean): void {
    if (this.enableHighlighting) {
      this.workspace.highlightObjects(this.getGlyphList('sentence', sentence), state);
    }
  }

  highlightSentenceRange (sentence: Sentence, start: number, end: number, state: boolean): void {
    if (this.enableHighlighting) {
      this.getGlyphList('sentence', sentence).forEach((glyph, i) => {
        if (i >= start && i <= end) {
          this.highlightGlyph(glyph, state);
          this.highlightTranslationPanelGlyph(glyph, state);
        }
      });
    }
  }

  highlightWord (word: Word, state: boolean): void {
    if (this.enableHighlighting) {
      this.workspace.highlightObjects(this.getGlyphList('word', word), state);
    }
  }

  highlightGlyph (glyph: Glyph, state: boolean): void {
    if (this.enableHighlighting) {
      this.workspace.highlightObjects([glyph], state);
    }
  }

  highlightTranslationPanelGlyph (glyph: Glyph, state: boolean): void {
    if (this.enableHighlighting) {
      const glyphEl = document.querySelector(`.c-translation-glyphs__item[data-glyph-id="${ glyph.id }"]`);
      if (glyphEl) {
        if (state) {
          glyphEl.classList.add('is-highlighted');
        } else {
          glyphEl.classList.remove('is-highlighted');
        }
      }
    }
  }

  autoClassifyGlyphs (glyphs: Array<Glyph>): void {
    if (this.config.ai.classification.enabled) {

      let identifiedGlyphPresent = false;
      const unlockedGlyphs = filter(glyphs, (g: Glyph) => {
        if (g.gardinerCode) {
          identifiedGlyphPresent = true;
        }
        return !g.locked;
      });

      if (
        unlockedGlyphs.length > 0 &&
        identifiedGlyphPresent &&
        !confirm(this.translate.instant('MODULES.PROJECT.MODULES.ANALYSE.TS.CONFIRM', { glyphs: unlockedGlyphs.length }))
      ) {
        return;
      }

      this.config.ai.classification.loading = true;

      // This will resolve after the entire chain is resolved
      let sequence = Promise.resolve();

      unlockedGlyphs.forEach((glyph) => {
        // Chain one computation onto the sequence
        sequence = sequence.then(() => {
          return new Promise<void>((resolve, reject) => {
            this.autoClassifyGlyph(glyph).then(() => {
              resolve();
            });
          });
        });
      });

      // Do each one of these promise in turn, not all at once
      sequence.then(() => {
        this.config.ai.classification.loading = false;
        this.updateWorkspace();
      }, err => {
        console.warn('Classification ERROR: ', err);
        console.warn(this.translate.instant('MODULES.PROJECT.MODULES.ANALYSE.TS.WARN.CLASSIFICATION'), err);
        this.notificationService.error(this.translate.instant('MODULES.PROJECT.MODULES.ANALYSE.TS.ERROR.CLASSIFICATION'));
        this.config.ai.classification.loading = false;
      });
    }
  }

  autoClassifyGlyph (glyph: Glyph): Promise<void> {
    this.config.ai.classification.glyphs.push(glyph.id);

    this.changeDetector.detectChanges();

    return new Promise((resolve, reject) => {

      this.workspace.getPolyImgOfFacsimile(glyph).then((imgSrc: string) => {

        const data: ClassificationRequest = {
          image: imgSrc,
          limit: 3,
          model_name: this.settings.classification.model ? this.settings.classification.model.name : '',
          model_version: this.settings.classification.model ? this.settings.classification.model.version : '',
          original_height: glyph.height,
          original_width: glyph.width,
          threshold: 0,
          weighted: false,
        };

        // Send to API
        this.apiService.post('classify', data).then((results: Array<ClassificationResult>) => {

          if (results && results.length) {
            glyph.gardinerCodePredictions = orderBy(results, ['score'], ['desc']);
            glyph.gardinerCode = glyph.gardinerCodePredictions[0].glyph;
          } else {
            glyph.gardinerCodePredictions = [];
            glyph.gardinerCode = '';
          }

          // Convert to lowercase
          glyph.gardinerCodePredictions.forEach(p => { p.glyph = p.glyph.toLowerCase(); });
          glyph.gardinerCode = glyph.gardinerCode.toLowerCase();

          pull(this.config.ai.classification.glyphs, glyph.id);

          this.updateWorkspace();

          resolve();
        }, err => {
          console.warn(this.translate.instant('MODULES.PROJECT.MODULES.ANALYSE.TS.WARN.API'), err);
          pull(this.config.ai.classification.glyphs, glyph.id);
          this.changeDetector.detectChanges();
          resolve();
        });

      }, err => {
        pull(this.config.ai.classification.glyphs, glyph.id);
        this.changeDetector.detectChanges();
      });

    });
  }

  manuallyClassifyGlyph (glyph: Glyph): void {
    const modalId = 'glyphPickerModal';
    this.ngxSmartModalService.getModal(modalId).open();
    this.ngxSmartModalService.setModalData({ code: glyph.gardinerCode, result: null }, modalId, true);
    const onDataAddedSub = this.ngxSmartModalService.getModal(modalId).onDataAdded.subscribe((modal: any) => {
      if (modal && modal.result) {
        this.setGlyphCode(glyph, modal.result);
        this.ngxSmartModalService.resetModalData(modalId);
        onDataAddedSub.unsubscribe();
      }
    });
    const onCloseSub = this.ngxSmartModalService.getModal(modalId).onAnyCloseEvent.subscribe((modal: any) => {
      this.ngxSmartModalService.resetModalData(modalId);
      if (onDataAddedSub) {
        onDataAddedSub.unsubscribe();
      }
      onCloseSub.unsubscribe();
    });
  }

  setGlyphCode (glyph: Glyph, code: Glyph['gardinerCode']): void {
    glyph.gardinerCode = code;
    this.updateWorkspace();
  }

  toggleGlyphLock (glyph: Glyph): void {
    glyph.locked = !glyph.locked;
    this.updateWorkspace();
  }

  toggleSentenceSelection (sentence: Sentence): void {
    if (sentence.selected) {
      this.workspace.unselectSentence(sentence);
    } else {
      this.workspace.selectSentence(sentence);
    }
  }

  deleteSentence (sentence: Sentence): void {
    this.workspace.deleteSentence(sentence);
  }

  toggleWordSelection (word: Word): void {
    if (word.selected) {
      this.workspace.unselectWord(word);
    } else {
      this.workspace.selectWord(word);
    }
  }

  deleteWord (word: Word): void {
    this.workspace.deleteWord(word);
  }

  deleteSelectedGlyphs (): void {
    this.workspace.deleteGlyphs(this.config.selected);
  }

  createWord (glyphs: Array<Glyph>): void {
    const wordIds = uniq(map(glyphs, 'parentId'));

    // All in the same word?
    if (wordIds.length === 1) {
      // Are they sequential?
      if (this.isSequentialArray(map(glyphs, 'order'))) {
        this.createWordFromGlyphs(glyphs);
      } else {
        this.notificationService.warn(this.translate.instant('MODULES.PROJECT.MODULES.ANALYSE.CREATE_WORD.SEQ_WARN'));
      }
      return;
    }
    this.notificationService.warn(this.translate.instant('MODULES.PROJECT.MODULES.ANALYSE.CREATE_WORD.SAME_WORD_WARN'));
  }

  createWordFromGlyphs (glyphs: Array<Glyph>): void {

    if (glyphs.length) {
      const beforeWordGlyphs: Array<Glyph['id']> = [];
      const newWordGlyphs: Array<Glyph['id']> = [];
      const afterWordGlyphs: Array<Glyph['id']> = [];

      const parent = glyphs[0].getParent();
      const parentGlyphs = this.getGlyphList('word', parent);
      const startIndex = glyphs[0].order;
      const endIndex = glyphs[glyphs.length - 1].order;
      const sentence = parent.getParent();

      parentGlyphs.forEach((glyph: Glyph) => {
        if (glyph.order < startIndex) {
          beforeWordGlyphs.push(glyph.id);
        } else if (glyph.order > endIndex) {
          afterWordGlyphs.push(glyph.id);
        } else {
          newWordGlyphs.push(glyph.id);
        }
      });

      const currentWord = { add: true, indexCnt: 0, glyphs: [] };
      const newWord1 = { add: true, indexCnt: 0.5, glyphs: [] };
      const newWord2 = { add: true, indexCnt: 0.75, glyphs: [] };

      if (beforeWordGlyphs.length) {
        currentWord.glyphs = beforeWordGlyphs;
        if (newWordGlyphs.length) {
          newWord1.glyphs = newWordGlyphs;
        } else {
          newWord1.add = false;
        }
        if (afterWordGlyphs.length) {
          newWord2.glyphs = afterWordGlyphs;
        } else {
          newWord2.add = false;
        }
      } else {
        if (newWordGlyphs.length) {
          currentWord.glyphs = newWordGlyphs;
        } else {
          currentWord.add = false;
        }
        if (afterWordGlyphs.length) {
          newWord1.glyphs = afterWordGlyphs;
        } else {
          newWord1.add = false;
        }
        newWord2.add = false;
      }

      const wordCreatePromises: Array<Promise<unknown>> = [];

      if (currentWord.add) {
        parent.glyphs = currentWord.glyphs;
        parent.reorderGlyphs();
      }

      if (newWord1.add) {
        const newWordData: WordStorage = {
          author: parent.author,
          created: new Date().getTime(),
          glyphs: [],
          isCartouche: parent.isCartouche,
          order: parent.order + newWord1.indexCnt,
          position: {
            top: parent.top,
            left: parent.left,
            width: parent.width,
            height: parent.height,
          },
          translation: '',
          transliteration: '',
        };
        wordCreatePromises.push(
          this.workspace.createWord(newWordData, parent.parentId, {
            glyphs: newWord1.glyphs,
            expanded: true,
          })
        );
      }

      if (newWord2.add) {
        const afterWordData: WordStorage = {
          author: parent.author,
          created: new Date().getTime(),
          glyphs: [],
          isCartouche: parent.isCartouche,
          order: parent.order + newWord2.indexCnt,
          position: {
            top: parent.top,
            left: parent.left,
            width: parent.width,
            height: parent.height,
          },
          translation: '',
          transliteration: '',
        };
        wordCreatePromises.push(
          this.workspace.createWord(afterWordData, parent.parentId, {
            glyphs: newWord2.glyphs,
            expanded: true,
          })
        );
      }

      Promise.all(wordCreatePromises).then((words) => {
        words.forEach((word: Word) => {
          word.reorderGlyphs();
          sentence.addWord(word);
        });
        sentence.reorderWords();
        this.workspace.reorderObjects();
        this.updateWorkspace();
      });
    }
  }

  updateSentenceTransliteration(sentence: Sentence): void {
    let transliteration = '';
    this.getWordList(sentence).forEach((word: Word) => {
      if (word.transliteration) {
        transliteration += ' ' + word.transliteration;
      }
    });
    sentence.transliteration = transliteration;
    this.updateWorkspace();
  }

  togglePanel(): void {
    this.panel.active = !this.panel.active;
    // if (this.panel.active) {
    //   if (this.workspace.config.selectedGlyphParent) {
    //     const sgp = <HTMLElement>document.getElementById(this.workspace.config.selectedGlyphParent.id);
    //     if (sgp) {
    //       sgp.scrollIntoView({
    //         behavior: 'smooth',
    //         inline: 'center',
    //       });
    //     }
    //   }
    // }
  }

  autoTranslateSentence(sentence: Sentence): void {
    const sentenceTranslation: AnalyseTranslationResults = {
      id: sentence.id,
      loading: true,
      results: [],
    };

    this.config.ai.translation.sentences.push(sentenceTranslation);

    const data: TranslationRequest = {
      sequence: map(this.getGlyphList('sentence', sentence), 'gardinerCode'),
    };

    // Send to API
    this.apiService.post('translate', data).then((results: Array<TranslationResult>) => {
      sentenceTranslation.results = this.parseAutoTranslateResults(results);
      this.updateWorkspace();
      sentenceTranslation.loading = false;
    }, err => {
      console.warn(this.translate.instant('MODULES.PROJECT.MODULES.ANALYSE.TRANSLATION.TS.WARN.API'), err);
      this.notificationService.error(this.translate.instant('MODULES.PROJECT.MODULES.ANALYSE.TRANSLATION.TS.WARN.API'));
      sentenceTranslation.loading = false;
    });

  }

  parseAutoTranslateResults (results: Array<TranslationResult>): Array<AnalyseTranslationResult> {
    const words: Array<AnalyseTranslationResult> = [];
    results.forEach((result) => {

      const word: AnalyseTranslationResult = {
        end: result.end,
        sequence: result.sequence,
        start: result.start,
        translation: null,
        transliteration: result.transliteration,
      };

      // Choose default translation locale
      // English if it exists, otherwise first other (until a UI is planned for
      // surfacing this choice to the user)
      if (result.translations) {
        const translation = find(result.translations, { locale: 'en' });
        if (translation) {
          word.translation = translation;
          words.push(word);
        }
      }
    });
    return words;
  }

  getTranslationData (id: Sentence['id']): AnalyseTranslationResults {
    return find(this.config.ai.translation.sentences, { id: id });
  }

  isLoadingTranslation (id: Sentence['id']): boolean {
    return !!find(this.config.ai.translation.sentences, { id: id });
  }

  autoFillWord(sentence: Sentence, result: any): void {
    // console.log('autoFillWord', sentence, result);
  }

  editGlyph (glyph: Glyph): void {
    this.config.editing.active = true;
    this.config.editing.object = glyph;
    this.panel.active = false;
    this.selectGlyph(glyph);
    this.workspace.panZoomToObject(glyph);
    this.workspace.editPolygonObject(glyph);
  }

  saveGlyph (glyph: Glyph): void {
    this.workspace.saveEditedPolygonObject(glyph);
    this.config.editing.active = false;
    this.config.editing.object = null;
  }

  trackByFn (index: number, item: Sentence | Word | Glyph): number | string {
    if (item) {
      return item.id;
    }
    return index;
  }

  private getSelectedGlyphs (): Array<Glyph> {
    return this.workspace.getSelectedObjects('glyph') as Array<Glyph>;
  }

  private updateWorkspaceDebounced (): void {
    this.changeDetector.detectChanges();
    this.workspace.updateHistory();
    this.workspace.updateData();
  }

  private isSequentialArray (numbers): boolean {
    for (let i = 0; i < numbers.length; i++) {
      if (numbers[i] + 1 < numbers[i + 1] || numbers[i] - 1 > numbers[i - 1]) {
        return false;
      }
    }
    return true;
  }

  private dragDropInit (): void {

    if (this.config.sortable.instances) {
      this.config.sortable.instances.forEach(instance => {
        if (instance) {
          instance.destroy();
        }
      });
      this.config.sortable.instances = [];
    }

    setTimeout(() => { // add timeout to ensure items are in the DOM

      // const listTypes: Array<string> = ['sentences', 'words', 'glyphs'];
      const listTypes: Array<string> = [];
      listTypes.forEach((listType: string) => {
        const listSelector = `.js-drag-drop-${ listType }`;
        const targetSelector = `.js-drag-drop-target-${ listType }`;
        const handleSelector = `.js-drag-drop-handle-${ listType }`;
        const listEls: NodeList = document.querySelectorAll(listSelector);

        listEls.forEach((listEl: HTMLUListElement) => {
          const ins = Sortable.create(listEl, {
            handle: handleSelector,
            draggable: targetSelector,
            animation: 100,
            direction: 'vertical',
            ghostClass: 'is-ghosted',
            group: listType,
            forceFallback: navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
            onStart: () => {
              this.dragDropStart();
            },
            onEnd: () => {
              this.dragDropEnd();
            },
            onAdd: (e) => { // triggers when moving items between lists
              this.dragDropUpdateData(
                e.from.closest('li') ? e.from.closest('li').getAttribute('data-id') : null,
                e.to.closest('li') ? e.to.closest('li').getAttribute('data-id') : null,
                e.item.getAttribute('data-id'),
                e.oldIndex,
                e.newIndex
              );
            },
            onUpdate: (e) => { // triggers when moving items within a list
              this.dragDropUpdateData(
                e.from.closest('li') ? e.from.closest('li').getAttribute('data-id') : null,
                e.to.closest('li') ? e.to.closest('li').getAttribute('data-id') : null,
                e.item.getAttribute('data-id'),
                e.oldIndex,
                e.newIndex
              );
            },
          });

          this.config.sortable.instances.push(ins);
        });
      });
      this.aside.loaded = true; // remove aside loader once drag drop is initialised
      this.changeDetector.detectChanges();
    }, 10);

  }

  private dragDropStart(): void {
    // this.changeDetector.detach();
    this.changeDetector.detectChanges();
  }

  private dragDropEnd(): void {
    // this.changeDetector.reattach();
    this.changeDetector.detectChanges();
  }

  private dragDropUpdateData (
    fromId: Sentence['id'] | Word['id'],
    toId: Sentence['id'] | Word['id'],
    objectId: Sentence['id'] | Word['id'] | Glyph['id'],
    oldIndex: number,
    newIndex: number
  ): void {

    const reorderObjectInList = (
      list: Array<Sentence | Word | Glyph>,
      objectOldIndex: number,
      objectNewIndex: number,
      preOrder: boolean = true
    ): void => {
      if (preOrder) {
        // Ensure items are in order
        list = orderBy(list, 'order');
      }
      // Update item locations
      ArrayMove.mutate(list, objectOldIndex, objectNewIndex);
      // Reset order values
      for (let i = 0; i < list.length; i++) {
        list[i].order = i;
      }
    };

    const resetObjectInListOrder = (list: Array<Sentence | Word | Glyph>): void => {
      // Ensure items are in order
      list = orderBy(list, 'order');
      // Reset order values
      for (let i = 0; i < list.length; i++) {
        list[i].order = i;
      }
    };

    const object: Sentence | Word | Glyph = this.workspace.getObject('id', objectId);
    if (object && object.tid) {
      switch (object.tid) {
        case 'sentence':
          // S to S at top level
          reorderObjectInList(this.workspace.getObjects('tid', ['sentence']), oldIndex, newIndex);
          break;
        case 'word':
          if (fromId === toId) {
            // W to W in a S
            reorderObjectInList(filter(this.workspace.getObjects('tid', ['word']), { parentId: fromId }), oldIndex, newIndex);
          } else {
            // W from S to S
            const fromSentence: Sentence = this.workspace.getObject('id', fromId);
            const toSentence: Sentence = this.workspace.getObject('id', toId);
            // Remove word id from old sentence words list
            fromSentence.words = pull(fromSentence.words, objectId);
            // Update old sentence words order
            resetObjectInListOrder(this.getWordList(fromSentence));
            // Get new sentence words (does not contain new word yet)
            const toSentenceWords = this.getWordList(toSentence);
            // Update word parentId
            (<Word>object).parentId = toId;
            // Put word id in new sentence words list
            toSentence.words.push(objectId);
            // Add new word to local words array at position 0
            toSentenceWords.unshift(object as Word);
            // Move new word from position 0 to required index
            reorderObjectInList(toSentenceWords, 0, newIndex, false);
          }
          break;
        case 'glyph':
          if (fromId === toId) {
            // G to G in a W
            reorderObjectInList(filter(this.workspace.getObjects('tid', ['glyph']), { parentId: fromId }), oldIndex, newIndex);
          } else {
            const toWord: Word = this.workspace.getObject('id', toId);
            const fromWord: Word = this.workspace.getObject('id', fromId);
            if (toWord && fromWord) {
              // G from W to W in a S
              // G from W to W in a different S
              // Remove glyph id from old word glyphs list
              fromWord.glyphs = pull(fromWord.glyphs, objectId);
              // Update old word glyphs order
              resetObjectInListOrder(this.getGlyphList('word', fromWord));
              // Get new word glyphs (does not contain new word yet)
              const toWordGlyphs = this.getGlyphList('word', toWord);
              // Update glyph parentId
              (<Glyph>object).parentId = toId;
              // Put glyph id in new word glyphs list
              toWord.glyphs.push(objectId);
              // Add new word to local words array at position 0
              toWordGlyphs.unshift(object as Glyph);
              // Move new word from position 0 to required index
              reorderObjectInList(toWordGlyphs, 0, newIndex, false);
            }
          }
          break;
      }
    }
    this.workspace.reorderObjects();
    this.updateWorkspace();
  }
}
