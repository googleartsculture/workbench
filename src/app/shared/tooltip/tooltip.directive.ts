import { Directive, ElementRef, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import * as Tooltip from 'tooltip.js';
import { Placement } from 'popper.js';

import { TranslationsService } from '../../core/translations/translations.service';

@Directive({
  selector: '[appTooltip]',
})
export class TooltipDirective implements OnInit, OnDestroy, OnChanges {

  private config: Tooltip.Options = {
    delay: {
      hide: 0,
      show: 500,
    },
    html: true,
    placement: 'top',
    template: `<div class="c-tooltip tooltip" role="tooltip">
                <div class="c-tooltip__arrow tooltip-arrow"></div>
                <div class="c-tooltip__inner tooltip-inner"></div>
              </div>`,
    title: '',
  };
  private tooltip: any;
  private isTouch: boolean;

  @Input () appTooltipTitle: string;
  @Input () appTooltipCopy?: string;
  @Input () appTooltipDisabled?: boolean;
  @Input () appTooltipPosition?: Placement;

  @HostListener('mouseleave') onMouseLeave() {
    if (this.tooltip) {
      this.tooltip.hide();
    }
  }

  constructor(
    private el: ElementRef,
    private translationsService: TranslationsService,
  ) { }

  ngOnInit (): void {
    document.documentElement.classList.contains('is-touch') ? this.isTouch = true : this.isTouch = false;
    this.translationsService.i18nObs.subscribe(() => this.init());
  }

  ngOnDestroy (): void {
    this.destroyTooltip();
  }

  ngOnChanges (changes: SimpleChanges): void {

    // Tooltip copy changes
    if (
        this.tooltip &&
        ((changes.appTooltipCopy && changes.appTooltipCopy.previousValue) ||
        (changes.appTooltipTitle && changes.appTooltipTitle.previousValue))
    ) {
      if (changes.appTooltipTitle && changes.appTooltipTitle.currentValue) {
        this.tooltip.updateTitleContent(this.generateTitle(changes.appTolltipTitle.currentValue, this.appTooltipCopy));
      }
      if (changes.appTooltipCopy && changes.appTooltipCopy.currentValue) {
        this.tooltip.updateTitleContent(this.generateTitle(this.appTooltipTitle, changes.appTooltipCopy.currentValue));
      }
    }

    // Tooltip disabled state changes
    if (changes.appTooltipDisabled && changes.appTooltipDisabled.previousValue != null) {
      if (changes.appTooltipDisabled.currentValue === true) {
        this.destroyTooltip();
      }
      if (changes.appTooltipDisabled.currentValue === false) {
        this.init();
      }
    }
  }

  private destroyTooltip (): void {
    if (this.tooltip) { this.tooltip.dispose(); }
  }

  private generateTitle (title: string, copy?: string): string {
    let str = `<h6 class="c-tooltip__title">${ title }</h6>`;
    if (copy) {
      str += `<p class="c-tooltip__copy">${ copy }</p>`;
    }
    return str;
  }

  private init (): void {
    if (this.tooltip || !this.appTooltipTitle || this.appTooltipDisabled || this.isTouch) {
      return;
    }

    if (this.appTooltipCopy) {
      this.config.title = this.generateTitle(this.appTooltipTitle, this.appTooltipCopy);
    } else {
      this.config.title = this.generateTitle(this.appTooltipTitle);
    }
    if (this.appTooltipPosition) {
      this.config.placement = this.appTooltipPosition;
    }
    this.tooltip = new Tooltip.default(this.el.nativeElement, this.config);
  }
}
