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

import { Injectable } from '@angular/core';

@Injectable()
export class PrettyFocusService {

  constructor() {}

  init() {
    const element = document.body;
    const restrictedTypes = ['mouse', 'touch'];
    const restrictClass = 'focus-disabled';
    let inputType = 'mouse';
    let interactLock = false;

    function interact(e) {
      if (!interactLock) {
        switch (e.type) {
          case 'mousedown':
            interactLock = false;
            inputType = 'mouse';
            break;
          case 'touchstart':
            interactLock = true;
            inputType = 'touch';
            break;
          default:
          case 'keydown':
            inputType = 'keyboard';
            break;
        }
      }
    }

    function preFocus() {
      for (let i = 0; i < restrictedTypes.length; i++) {
        if (inputType === restrictedTypes[i]) {
          element.classList.add(restrictClass);
          break;
        }
      }
    }

    function preBlur() {
      element.classList.remove(restrictClass);
    }

    element.addEventListener('mousedown', interact);
    element.addEventListener('touchstart', interact);
    element.addEventListener('keydown', interact);
    element.addEventListener('focus', preFocus, true);
    element.addEventListener('blur', preBlur, true);
  }
}
