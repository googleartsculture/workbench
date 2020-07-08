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

import { Component, OnInit, Input } from '@angular/core';
import { NotificationsService } from './notifications.service';
import { Notification } from './notification.model';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
    @Input() id: string;

    private timeout = 5000;
    private animationTime = 500;

    public notifications: Notification[] = [];
    public active = false;

  constructor(
    private notificationsService: NotificationsService,
  ) {}

  ngOnInit () {
    this.notificationsService.getNotification(this.id).subscribe((notification: Notification) => {
      if (!notification.message) {
        this.notifications = [];
        return;
      }
      this.add(notification);
      setTimeout(() => {
        this.remove(notification);
      }, this.timeout);
    });
  }

  private add (notification): void {
    this.notifications.push(notification);
    this.active = true;
  }

  public remove (notification: Notification): void {
    if (this.notifications.length > 1) {
      this.notifications = this.notifications.filter((x) => {
        return x !== notification;
      });
    } else {
      this.clearAll();
    }
  }

  private clearAll (): void {
    this.active = false;
    setTimeout(() => {
      this.notifications = [];
    }, this.animationTime);
  }
}
