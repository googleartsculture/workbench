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

import { NotificationsService } from './../../core/notifications/notifications.service';
import { DataService } from './../../core/data/data.service';
import { Settings, DevData } from './settings.model';
import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { find } from 'lodash';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnDestroy {
  classificationModels = environment.config.apiServices.classification.models || [];
  config = {
    states: {
      saving: false,
      saved: false,
      loading: true,
    },
    devVisible: false,
  };
  formData = new FormGroup ({
    userFullName: new FormControl('Anonymous', Validators.required),
    clusterAnalysisThreshold: new FormControl(200, Validators.required),
    classificationModel: new FormControl(
      environment.config.apiServices.classification.models.length ? environment.config.apiServices.classification.models[0] : { value: null, disabled: true },
      environment.config.apiServices.classification.models.length ? Validators.required : null
    ),
  });
  devData: DevData = {
    browser: {
      name: null,
      version: null,
    },
    os: {
      name: null,
      version: null,
    },
    screen: {
      width: null,
      height: null,
    },
    window: {
      width: null,
      height: null,
    },
    ua: null,
  };

  private componentSubs: Array<Subscription> = [];
  private settings: Settings;

  constructor(
    private dataService: DataService,
    private notificationsService: NotificationsService,
    private translate: TranslateService
  ) {
    this.setDevData();
    this.componentSubs.push(
      this.dataService.settingsObs.subscribe((settings: Settings) => {
        if (settings) {
          this.settings = settings;
          this.update();
          this.config.states.loading = false;
        }
      })
    );
  }

  ngOnDestroy() {
    this.componentSubs.forEach(sub => sub.unsubscribe());
  }

  save() {
    this.config.states.saved = false;
    this.config.states.saving = true;

    // puts form data back into format it was (nested objects)
    const data: Settings = {
      userFullName: this.formData.controls.userFullName.value,
      clusterAnalysis: {
        threshold: this.formData.controls.clusterAnalysisThreshold.value,
      },
      classification: {
        model: this.formData.controls.classificationModel.value
      },
    };

    this.dataService.saveSettings(data).then(() => {
      this.config.states.saved = true;
      this.config.states.saving = false;

      for (const key in this.formData.controls) {
        if (this.formData.controls.hasOwnProperty(key)) {
          const prop = this.formData.controls[key];
          prop.markAsPristine();
        }
      }
    }, (err) => {
      this.config.states.saved = false;
      this.config.states.saving = false;
      this.notificationsService.error(this.translate.instant('MODULES.SETTINGS.TS.ERROR.SAVE'));
      console.warn(this.translate.instant('MODULES.SETTINGS.TS.WARN.SAVE'), err);
    });
  }

  private update(): void {
    let classificationModel = null;
    if (this.classificationModels && this.classificationModels.length) {
      if (this.settings.classification.model) {
        classificationModel = find(this.classificationModels, {
          displayName: this.settings.classification.model.displayName,
          name: this.settings.classification.model.name,
          version: this.settings.classification.model.version,
        });
        if (!classificationModel) {
          classificationModel = this.classificationModels[0];
          this.save();
        }
      } else {
        classificationModel = this.classificationModels[0];
        this.save();
      }
    }
    this.formData.setValue({
      userFullName: this.settings.userFullName || 'Anonymous',
      clusterAnalysisThreshold: this.settings.clusterAnalysis.threshold,
      classificationModel: classificationModel,
    });
  }

  private setDevData(): void {
    this.devData.browser = this.getBrowserInfo();
    this.devData.os = this.getOSInfo();
    this.devData.screen = {
      width: screen.width,
      height: screen.height,
    };
    this.devData.window = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.devData.ua = navigator.userAgent;
  }

  private getBrowserInfo(): DevData['browser'] {
    const ua = navigator.userAgent;
    let name = navigator.appName;
    let version = parseFloat(navigator.appVersion).toString();
    let nameOffset;
    let verOffset;
    let ix;

    if ((verOffset = ua.indexOf('Opera')) !== -1) {
      // Opera
      name = 'Opera';
      version = ua.substring(verOffset + 6);
      if ((verOffset = ua.indexOf('Version')) !== -1) {
        version = ua.substring(verOffset + 8);
      }
    } else if ((verOffset = ua.indexOf('OPR')) !== -1) {
      // Opera Next
      name = 'Opera';
      version = ua.substring(verOffset + 4);
    } else if ((verOffset = ua.indexOf('Edge')) !== -1) {
      // Edge
      name = 'Microsoft Edge';
      version = ua.substring(verOffset + 5);
    } else if ((verOffset = ua.indexOf('MSIE')) !== -1) {
      // MSIE
      name = 'Microsoft Internet Explorer';
      version = ua.substring(verOffset + 5);
    } else if ((verOffset = ua.indexOf('Chrome')) !== -1) {
      // Chrome
      name = 'Chrome';
      version = ua.substring(verOffset + 7);
    } else if ((verOffset = ua.indexOf('Safari')) !== -1) {
      // Safari
      name = 'Safari';
      version = ua.substring(verOffset + 7);
      if ((verOffset = ua.indexOf('Version')) !== -1) {
        version = ua.substring(verOffset + 8);
      }
    } else if ((verOffset = ua.indexOf('Firefox')) !== -1) {
      // Firefox
      name = 'Firefox';
      version = ua.substring(verOffset + 8);
    } else if (ua.indexOf('Trident/') !== -1) {
      // MSIE 11+
      name = 'Microsoft Internet Explorer';
      version = ua.substring(ua.indexOf('rv:') + 3);
    } else if ((nameOffset = ua.lastIndexOf(' ') + 1) < (verOffset = ua.lastIndexOf('/'))) {
      // Other browsers
      name = ua.substring(nameOffset, verOffset);
      version = ua.substring(verOffset + 1);
      if (name.toLowerCase() === name.toUpperCase()) {
        name = navigator.appName;
      }
    }
    // Clean things up
    if ((ix = version.indexOf(';')) !== -1) {
      version = version.substring(0, ix);
    }
    if ((ix = version.indexOf(' ')) !== -1) {
      version = version.substring(0, ix);
    }
    if ((ix = version.indexOf(')')) !== -1) {
      version = version.substring(0, ix);
    }

    return {
      name: name,
      version: version,
    };
  }

  private getOSInfo(): DevData['os'] {
    const ua = navigator.userAgent;
    const av = navigator.appVersion;
    let name = '';
    let version = '';

    // Name
    const clientStrings = [
      { s: 'Windows 10', r: /(Windows 10.0|Windows NT 10.0)/ },
      { s: 'Windows 8.1', r: /(Windows 8.1|Windows NT 6.3)/ },
      { s: 'Windows 8', r: /(Windows 8|Windows NT 6.2)/ },
      { s: 'Windows 7', r: /(Windows 7|Windows NT 6.1)/ },
      { s: 'Windows Vista', r: /Windows NT 6.0/ },
      { s: 'Windows Server 2003', r: /Windows NT 5.2/ },
      { s: 'Windows XP', r: /(Windows NT 5.1|Windows XP)/ },
      { s: 'Windows 2000', r: /(Windows NT 5.0|Windows 2000)/ },
      { s: 'Windows ME', r: /(Win 9x 4.90|Windows ME)/ },
      { s: 'Windows 98', r: /(Windows 98|Win98)/ },
      { s: 'Windows 95', r: /(Windows 95|Win95|Windows_95)/ },
      { s: 'Windows NT 4.0', r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ },
      { s: 'Windows CE', r: /Windows CE/ },
      { s: 'Windows 3.11', r: /Win16/ },
      { s: 'Android', r: /Android/ },
      { s: 'Open BSD', r: /OpenBSD/ },
      { s: 'Sun OS', r: /SunOS/ },
      { s: 'Linux', r: /(Linux|X11)/ },
      { s: 'iOS', r: /(iPhone|iPad|iPod)/ },
      { s: 'Mac OS X', r: /Mac OS X/ },
      { s: 'Mac OS', r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
      { s: 'QNX', r: /QNX/ },
      { s: 'UNIX', r: /UNIX/ },
      { s: 'BeOS', r: /BeOS/ },
      { s: 'OS/2', r: /OS\/2/ },
      { s: 'Search Bot', r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/ }
    ];
    for (const id in clientStrings) {
      if (clientStrings[id]) {
        const cs = clientStrings[id];
        if (cs.r.test(ua)) {
          name = cs.s;
          break;
        }
      }
    }

    // Version
    if (/Windows/.test(name)) {
      version = /Windows (.*)/.exec(name)[1];
      name = 'Windows';
    }
    switch (name) {
      case 'Mac OS X':
        version = /Mac OS X (10[\.\_\d]+)/.exec(ua)[1];
        break;

      case 'Android':
        version = /Android ([\.\_\d]+)/.exec(ua)[1];
        break;

      case 'iOS':
        const versionExec = /OS (\d+)_(\d+)_?(\d+)?/.exec(av);
        version = versionExec[1] + '.' + versionExec[2] + '.' + (versionExec[3] || '0');
        break;
    }
    // Clean things up
    version = version.split('_').join('.');

    return {
      name: name,
      version: version,
    };
  }
}
