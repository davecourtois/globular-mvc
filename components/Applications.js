// I will made use of polymer instead of materialyze for the main
// layout because materialyse dosen't react to well with the shadow doom.
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/social-icons'
import '@polymer/iron-icons/editor-icons'
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-ripple/paper-ripple.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/iron-autogrow-textarea/iron-autogrow-textarea.js';
import '@polymer/paper-radio-button/paper-radio-button.js';
import '@polymer/paper-radio-group/paper-radio-group.js';

import { Menu } from './Menu';
import { Application } from '../Application';
import { theme } from "./Theme";

/**
 * Login/Register functionality.
 */
export class ApplicationsMenu extends Menu {
    // attributes.

    // Create the application view.
    constructor() {
        super("applications", "apps", "Applications")
        let html = `
            <style>
                                
                #applications_menu_div{
                    background-color: var(--palette-background-paper);
                }

                #applications-div {
                    display: none;
                    flex-wrap: wrap;
                    padding: 10px;
                    width: 300px;
                    height: 100%;
                }

            </style>
            <div id="applications-div">
                <globular-applications-panel id="application-panel-toolbar-menu"></globular-applications-panel>
            </div>
        `

        this.shadowRoot.appendChild(this.getMenuDiv())

        let range = document.createRange()
        this.getMenuDiv().innerHTML = "" // remove existing elements.
        this.getMenuDiv().appendChild(range.createContextualFragment(html));
        this.getMenuDiv().style.height = "380px";
        this.getMenuDiv().style.overflowY = "auto";
    }

    init() {

        this.shadowRoot.appendChild(this.getMenuDiv())

        // Action's
        this.getMenuDiv().querySelector("#application-panel-toolbar-menu").init(() => {
            this.shadowRoot.querySelector(`#applications-div`).style.display = "flex"
            this.shadowRoot.removeChild(this.getMenuDiv())
        });


    }
}

customElements.define('globular-applications-menu', ApplicationsMenu)

/**
 * Login/Register functionality.
 */
export class ApplicationsPanel extends HTMLElement {
    // attributes.

    // Create the application view.
    constructor() {
        super()
        // Set the shadow dom.
        this.attachShadow({ mode: 'open' });
        this.size = "normal"
        this.iconSize = 56;
        if (this.hasAttribute("size")) {
            this.size = this.getAttribute("size")
        }

        if (this.size == "large") {
            this.iconSize = 64
        }

        this.shadowRoot.innerHTML = `
        <style>
        ${theme}
            .container {
                display: inline-flex;
                flex-flow: wrap;
            }

            paper-tooltip {
                --paper-tooltip: {
                  font-size: 1rem;
                }
            }

            .application-div {
                display: flex;
                position: relative;
                flex-direction: column;
                align-items: center;
                width:  ${this.iconSize * 1.25}px;
                margin: 5px;
                padding: 25px;
                border-radius: 5px;
                transition: background 0.2s ease,padding 0.8s linear;
                background-color: var(--palette-background-paper);
                --paper-tooltip: {
                    font-size: 1rem;
                  }
            }

            .application-div img{
                filter: invert(0%);
            }
            
            .application-div:hover{
                cursor: pointer;
                -webkit-filter: invert(10%);
                filter: invert(10%);
            }

            .application-div img{
                height: ${this.iconSize}px;
                width:  ${this.iconSize}px;
            }

            .application-div span{
                margin-top: 5px;
                color: #404040;
                display: inline-block;
                font-family: 'Google Sans',Roboto,RobotoDraft,Helvetica,Arial,sans-serif;
                font-size: 1rem;
                letter-spacing: .09px;
                line-height: 16px;
                width: 125px;
                text-align: center;
                color: var(--palette-text-primary);
            }

            .application-div.normal span{
                font-size: .85rem;
                width: 100%;
                text-align: center;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .application-div.normal{
                padding: 10px;
            }

        </style>
        <div class="container"></div>
        `

    }


    // The connection callback.
    connectedCallback() {

    }

    init(callback) {

        Application.getAllApplicationInfo((infos) => {
            let range = document.createRange()
            for (var i = 0; i < infos.length; i++) {
                let application = infos[i]
                let html = `
                <div id="${application.getId()}_div" class="application-div">
                    <paper-ripple recenters></paper-ripple>
                    <img id="${application.getId()}_img"></img>
                    <span id="${application.getId()}_span"></span>
                    <a id="${application.getId()}_lnk" style="display: none;"></a>
                </div>
                <paper-tooltip for="${application.getId()}_div" style="font-size: .85rem;" role="tooltip" tabindex="-1">${application.getDescription()}</paper-tooltip>
                `
                let container = this.shadowRoot.querySelector(".container")
                container.appendChild(range.createContextualFragment(html))
                let div_ = container.querySelector(`#${application.getId()}_div`)

                if (div_ != null) {
                    if (this.size == "normal") {
                        div_.classList.add("normal")
                    }

                    let img = this.shadowRoot.getElementById(application.getId() + "_img")
                    let lnk = this.shadowRoot.getElementById(application.getId() + "_lnk")
                    var currentLocation = window.location;
                    lnk.href = currentLocation.origin + application.getPath();

                    let title = this.shadowRoot.getElementById(application.getId() + "_span")
                    img.src = application.getIcon();
                    title.innerHTML = application.getId();
                    title.title = application.getId();
                    
                    if(application.getAlias().length > 0){
                        title.innerHTML =application.getAlias()
                    }

                    div_.onclick = () => {
                        lnk.click()
                    }

                    // Keep the image up to date.
                    Application.eventHub.subscribe(`update_application_${application.getId()}_settings_evt`,
                        (uuid) => {

                        },
                        (__applicationInfoStr__) => {
                            // Set the icon...
                            let application = JSON.parse(__applicationInfoStr__)
                            img.src = application.icon;
                        }, false)
                }else{
                    console.log("no found ", div_)
                }
            }

            if (callback != undefined) {
                callback()
            }
        }, (err) => {
            console.log(err)
            if (callback != undefined) {
                callback()
            }
        })
    }
}

customElements.define('globular-applications-panel', ApplicationsPanel)