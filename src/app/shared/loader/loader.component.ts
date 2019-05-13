import { Component, Input, HostBinding, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent implements OnChanges {

  @Input () loading: boolean;
  @Input () appLoaderHideSpinner?: boolean;

  @Input () appLoaderBgLight?: boolean;
  @Input () appLoaderBgTransparent?: boolean;

  @Input () appLoaderBasic?: boolean;
  @Input () appLoaderSmall?: boolean;
  @Input () appLoaderSmallDark?: boolean;
  @Input () appLoaderAside?: boolean;

  @HostBinding('class.is-hidden') hidden = false;

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.loading) {
      this.hidden = !changes.loading.currentValue;
    }
  }

}
