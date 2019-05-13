import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoaderComponent } from './loader.component';
import { SvgModule } from '../svg/svg.module';

@NgModule({
  imports: [
    CommonModule,
    SvgModule,
  ],
  declarations: [
    LoaderComponent,
  ],
  exports: [
    LoaderComponent,
  ],
})
export class LoaderModule {}
