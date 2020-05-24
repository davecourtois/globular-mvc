// I will made use of polymer instead of materialyze for the main
// layout because materialyse dosen't react to well with the shadow doom.
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-ripple/paper-ripple.js';
import '@polymer/iron-collapse/iron-collapse.js';

import { Model } from '../Model';
import { Menu } from './Menu';

/**
 * Login/Register functionality.
 */
export class NotificationMenu extends Menu {
    // attributes.

    // Create the applicaiton view.
    constructor() {
        super("notification", "social:notifications-none")

        // The div inner panel.
        let html = `
        <style>
            #notifications{
                display: flex;
                flex-direction: column;
            }

            #notifications-config{
                flex-grow: 1;

            }

            #application-notifications #user-nofitications{
                display: flex;
                flex-direction: column;
            }

            .header{
                display: flex;
                min-width: 256px;
                position: relative;
                font-size: 12pt;
                align-items: center;
                padding: .5rem;
            }

            .header:hover{
                cursor: pointer;
            }

            .body{
                min-width: 256px;
                min-height: 100px;
                max-height: 30rem;
                overflow-y: auto;
            }

            .btn_div{
                display: flex; 
                flex-grow: 1; 
                justify-content: 
                flex-end;
            }

            .btn {
                position: relative;
            }

            .btn:hover{
                cursor: pointer;
            }

            iron-collapse{
                border-bottom: 1px solid #e8e8e8;
                border-top: 1px solid #e8e8e8;
            }

            iron-collapse{
                border-bottom: 1px solid #e8e8e8;
                border-top: 1px solid #e8e8e8;
            }

            .notification_panel{
                display: flex; 
                padding: .75rem; 
                font-size: 12pt;
            }
        </style>

        <div>
            <div class="header" style="border-bottom: 1px solid #e8e8e8;">
                <div>Notifications</div>
                <div class="btn_div">
                    <div class="btn">
                        <iron-icon id="notifications-config" icon="settings"></iron-icon>
                        <paper-ripple class="circle" recenters></paper-ripple>
                    </div>
                </div>
            </div>

            <div id="application-notifications">
                <div class="header" id="application-notifications-btn">Application
                    <paper-ripple recenters></paper-ripple>
                </div>
                <iron-collapse id="application-notifications-collapse" opened = "[[opened]]">
                    <div id="application-nofitications-panel" class="body"></div>
                </iron-collapse>
            </div>

            <div id="user-nofitications">
                <div class="header" id="user-notifications-btn">User 
                    <paper-ripple recenters></paper-ripple>
                </div>
                <iron-collapse  id="user-notifications-collapse" style="">
                    <div id="user-nofitications-panel" class="body"></div>
                </iron-collapse>
            </div>

        </div>
        `

        let range = document.createRange()
        this.getMenuDiv().appendChild(range.createContextualFragment(html));

        // Action's
        this.shadowRoot.appendChild(this.getMenuDiv())

        this.userNotificationsBtn = this.shadowRoot.getElementById("user-notifications-btn")
        this.applicationNotificationBtn = this.shadowRoot.getElementById("application-notifications-btn")

        let userNotificationsCollapse = this.shadowRoot.getElementById("user-notifications-collapse");
        let applicationNotificationsCollapse = this.shadowRoot.getElementById("application-notifications-collapse");
        this.applicationNotificationsPanel = this.shadowRoot.getElementById("application-nofitications-panel")
        this.userNotificationsPanel = this.shadowRoot.getElementById("user-nofitications-panel")

        // Now I will set the animation
        this.userNotificationsBtn.onclick = () => {
            userNotificationsCollapse.toggle()
            if (applicationNotificationsCollapse.opened) {
                applicationNotificationsCollapse.toggle()
            }
            if (userNotificationsCollapse.opened == true) {
                this.userNotificationsBtn.style.borderTop = "1px solid #e8e8e8"
            } else {
                this.userNotificationsBtn.style.borderTop = ""
            }
        }

        // Now I will set the animation
        this.applicationNotificationBtn.onclick = () => {
            applicationNotificationsCollapse.toggle()
            if (userNotificationsCollapse.opened) {
                userNotificationsCollapse.toggle()
            }
            if (userNotificationsCollapse.opened == true) {
                this.userNotificationsBtn.style.borderTop = "1px solid #e8e8e8"
            } else {
                this.userNotificationsBtn.style.borderTop = ""
            }
        }

        this.getIconDiv().addEventListener("click", () => {
            // reset the notification count.
            if (this.notificationCount != undefined) {
                this.notificationCount.parentNode.removeChild(this.notificationCount)
                this.notificationCount = undefined
            }

            let now = new Date().getTime()
            localStorage.setItem("notifications_read_date", now.toString())

        })

        this.shadowRoot.removeChild(this.getMenuDiv())
    }

    init() {
        // The logout event.
        Model.eventHub.subscribe("logout_event",
            (uuid) => {
                /** nothing to do here. */
            },
            (account) => {
                this.clearUserNotifications()
                Model.eventHub.unSubscribe(account._id + "_notification_event", this.account_notification_listener)
            }, true)

        // The logout event.
        Model.eventHub.subscribe("login_event",
            (uuid) => {
                /** nothing to do here. */
            },
            (account) => {
                Model.eventHub.subscribe(account._id + "_notification_event",
                    (uuid) => {
                        this.account_notification_listener = uuid
                    },
                    (notification) => {
                        this.appendNofication(this.userNotificationsPanel, JSON.parse(notification))
                    }, false)
            }, true)

        Model.eventHub.subscribe("set_application_notifications_event",
            (uuid) => {
                /** nothing to do here. */
            },
            (notifications) => {
                this.setApplicationNofications(notifications)
            }, true)

        Model.eventHub.subscribe("set_user_notifications_event",
            (uuid) => {
                /** nothing to do here. */
            },
            (notifications) => {
                this.setUserNofications(notifications)
            }, true)

        // Network event.
        Model.eventHub.subscribe(Model.application + "_notification_event",
            (uuid) => {
                /** nothing to do here. */
            },
            (notification) => {
                this.setNotificationCount()
                notification = JSON.parse(notification)
                notification._date = new Date(notification._date)
                this.appendNofication(this.applicationNotificationsPanel, notification)
            }, false)

    }

    // clear the notifications.
    clear() {

    }

    setNotificationCount() {
        let iconDiv = this.getIconDiv()
        for (var i = 0; i < iconDiv.children.length; i++) {
            if (iconDiv.children[i].id == "notification-count") {
                this.notificationCount = iconDiv.children[i]
                break
            }
        }

        if (this.notificationCount == undefined) {
            let html = `
            <style>

                .notification-count{
                    position: absolute;
                    display: flex;
                    top: 0px;
                    right: -5px;
                    background-color: var(--paper-badge-background);
                    border-radius: 10px;
                    width: 20px;
                    height: 20px;
                    justify-content: center;
                    align-items: center;
                    font-size: 8pt;
                }
            </style>
            <div id="notification-count" class="notification-count">
                0
            </div>
            `
            // Set icon.
            this.getIcon().icon = "social:notifications"

            let range = document.createRange()
            iconDiv.appendChild(range.createContextualFragment(html));
            this.notificationCount = this.shadowRoot.getElementById("notification-count")
        }
    }

    // Set user notifications
    setUserNofications(notifications) {
        for (var i = 0; i < notifications.length; i++) {
            let notification = notifications[i]
            this.appendNofication(this.userNotificationsPanel, notification)
        }
    }

    // Clear all user notifications.
    clearUserNotifications() {
        this.userNotificationsPanel.innerHTML = ""
    }

    // Set the application notifications.
    setApplicationNofications(notifications) {
        for (var i = 0; i < notifications.length; i++) {
            let notification = notifications[i]
            this.appendNofication(this.applicationNotificationsPanel, notification)
        }
    }

    clearApplicationNotifications() {
        this.applicationNotificationsPanel.innerHTML = ""
    }

    // Create the notification panel.
    appendNofication(parent, notification) {

        let html = `
        <div id="${notification._id}" class="notification_panel">
            <div "${notification._id}_recipient">
            </div>
            <div style="display: flex; flex-direction: column;">
                <div id="${notification._id}_text" style="">
                </div>
                <div id="${notification._id}_date" style="font-size: 10pt;">
                </div>
            </div>
        </div>
        `
        // Set icon.
        this.getIcon().icon = "social:notifications"

        let range = document.createRange()
        parent.appendChild(range.createContextualFragment(html));

        let isHidden = this.shadowRoot.getElementById(notification._id) == undefined
        // Action's
        if (isHidden) {
            this.shadowRoot.appendChild(this.getMenuDiv())
        }

        this.shadowRoot.getElementById(notification._id + "_text").innerHTML = notification._text

        let date = new Date(notification._date)

        this.shadowRoot.getElementById(notification._id + "_date").innerHTML = date.toLocaleDateString()

        if (isHidden) {
            this.shadowRoot.removeChild(this.getMenuDiv())
        }

        // Now the new notification count badge.
        let count = 0;
        let notifications_read_date = 0;
        if (localStorage.getItem("notifications_read_date") != undefined) {
            notifications_read_date = parseInt(localStorage.getItem("notifications_read_date"))
        }

        if (notification._date.getTime() > notifications_read_date) {

            if (this.notificationCount != undefined) {
                count = parseInt(this.notificationCount.innerHTML)
            } else {
                this.setNotificationCount()
            }
            
            count++
            this.notificationCount.innerHTML = count.toString()
        }

    }

}

customElements.define('globular-notification-menu', NotificationMenu)