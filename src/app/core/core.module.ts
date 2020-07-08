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

import { UtilsService } from './utils/utils.service';
import { StorageService } from './storage/storage.service';
import { ApiService } from './api/api.service';
import { HeaderModule } from './header/header.module';
import { NgModule } from '@angular/core';
import { BrowserDetectModule } from './browser-detect/browser-detect.module';
import { PrettyFocusModule } from './pretty-focus/pretty-focus.module';
import { TranslationsModule } from './translations/translations.module';
import { WebfontsModule } from './webfonts/webfonts.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PortraitNoticeModule } from './portrait-notice/portrait-notice.module';
import { FooterModule } from './footer/footer.module';
import { DataService } from './data/data.service';

@NgModule({
  exports: [
    BrowserDetectModule,
    PrettyFocusModule,
    TranslationsModule,
    WebfontsModule,
    NotificationsModule,
    PortraitNoticeModule,
    HeaderModule,
    FooterModule
  ],
  providers: [
    ApiService,
    DataService,
    StorageService,
    UtilsService,
  ],
})
export class CoreModule {}
