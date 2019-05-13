import { Component, OnInit } from '@angular/core';

import { BrowserDetectService, BrowserDetectData } from './browser-detect.service';

@Component({
  selector: 'app-browser-detect',
  templateUrl: './browser-detect.component.html',
  styleUrls: ['./browser-detect.component.scss']
})
export class BrowserDetectComponent implements OnInit {

  supportedData: BrowserDetectData;

  constructor (
    private browserDetectService: BrowserDetectService,
  ) {}

  ngOnInit () {
    this.supportedData = this.browserDetectService.init();
  }
}
