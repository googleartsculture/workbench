import { AppRoutingModule } from './../../app-routing.module';
import { SvgModule } from './../../shared/svg/svg.module';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FooterComponent } from './footer.component';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
    CommonModule,
    SvgModule,
    TranslateModule,
    AppRoutingModule,
  ],
  declarations: [
    FooterComponent,
  ],
  exports: [
    FooterComponent,
  ],
})
export class FooterModule {}
