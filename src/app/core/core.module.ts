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
