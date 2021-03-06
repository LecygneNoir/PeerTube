import { Component, Input, OnInit } from '@angular/core'
import { UserNotificationService } from '@app/shared/users/user-notification.service'
import { UserNotificationType } from '../../../../../shared'
import { ComponentPagination, hasMoreItems } from '@app/shared/rest/component-pagination.model'
import { Notifier } from '@app/core'
import { UserNotification } from '@app/shared/users/user-notification.model'

@Component({
  selector: 'my-user-notifications',
  templateUrl: 'user-notifications.component.html',
  styleUrls: [ 'user-notifications.component.scss' ]
})
export class UserNotificationsComponent implements OnInit {
  @Input() ignoreLoadingBar = false
  @Input() infiniteScroll = true

  notifications: UserNotification[] = []

  // So we can access it in the template
  UserNotificationType = UserNotificationType

  componentPagination: ComponentPagination = {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: null
  }

  constructor (
    private userNotificationService: UserNotificationService,
    private notifier: Notifier
  ) { }

  ngOnInit () {
    this.loadMoreNotifications()
  }

  loadMoreNotifications () {
    this.userNotificationService.listMyNotifications(this.componentPagination, undefined, this.ignoreLoadingBar)
        .subscribe(
          result => {
            this.notifications = this.notifications.concat(result.data)
            this.componentPagination.totalItems = result.total
          },

          err => this.notifier.error(err.message)
        )
  }

  onNearOfBottom () {
    if (this.infiniteScroll === false) return

    this.componentPagination.currentPage++

    if (hasMoreItems(this.componentPagination)) {
      this.loadMoreNotifications()
    }
  }

  markAsRead (notification: UserNotification) {
    this.userNotificationService.markAsRead(notification)
        .subscribe(
          () => {
            notification.read = true
          },

          err => this.notifier.error(err.message)
        )
  }

  markAllAsRead () {
    this.userNotificationService.markAllAsRead()
        .subscribe(
          () => {
            for (const notification of this.notifications) {
              notification.read = true
            }
          },

          err => this.notifier.error(err.message)
        )
  }
}
