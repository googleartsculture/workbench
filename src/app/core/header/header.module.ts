import { TranslateModule } from '@ngx-translate/core';
import { AppRoutingModule } from '../../app-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { SvgModule } from '../../shared/svg/svg.module';
import { TooltipModule } from '../../shared/tooltip/tooltip.module';

@NgModule({
  imports: [
    CommonModule,
    SvgModule,
    AppRoutingModule,
    TranslateModule,
    TooltipModule,
  ],
  declarations: [
    HeaderComponent,
  ],
  providers: [],
  exports: [
    HeaderComponent,
  ],
})
export class HeaderModule {}
