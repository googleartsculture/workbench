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


import {filter} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject ,  Observable } from 'rxjs';
import { Notification } from './notification.model';

@Injectable()
export class NotificationsService {

  private subject = new BehaviorSubject<Notification>(null);

  constructor () {}

  // subscribe to notifications
  public getNotification (id?: string): Observable<any> {
    return this.subject.asObservable().pipe(filter((x: Notification) => {
      return x && x.id === id;
    }));
  }

  // convenience methods
  public success (message: string): void {
    this.notification(new Notification({ message, type: 'success' }));
  }

  public error (message: string): void {
    this.notification(new Notification({ message, type: 'error' }));
  }

  public info (message: string): void {
    this.notification(new Notification({ message, type: 'info' }));
  }

  public warn (message: string): void {
    this.notification(new Notification({ message, type: 'warning' }));
  }

  private notification (alert: Notification): void {
    this.subject.next(alert);
  }

  private clear (id?: string): void {
    this.subject.next(new Notification({ id }));
  }
}
