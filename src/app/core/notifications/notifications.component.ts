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
