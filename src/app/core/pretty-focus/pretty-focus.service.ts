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
