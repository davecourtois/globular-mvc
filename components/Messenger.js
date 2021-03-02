// I will made use of polymer instead of materialyze for the main
// layout because materialyse dosen't react to well with the shadow doom.
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/social-icons'
import '@polymer/iron-icons/editor-icons'
import '@polymer/iron-icons/communication-icons'
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-ripple/paper-ripple.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/iron-autogrow-textarea/iron-autogrow-textarea.js';
import '@polymer/paper-tabs/paper-tabs.js';
import '@polymer/paper-tabs/paper-tab.js';
import '@polymer/iron-autogrow-textarea/iron-autogrow-textarea.js';
import { Autocomplete } from './Autocomplete'

import { Menu } from './Menu';
import { theme } from "./Theme";
import { Account } from "../Account"
import { Model } from "../Model"
import { PermissionManager } from '../Permission';
import { ConversationManager } from '../Conversation';


/**
 * Communication with your contact's
 */
export class MessengerMenu extends Menu {
    // attributes.

    // Create the contact view.
    constructor() {
        super("Messenger", "communication:message", "Messenger")

        this.account = null;

        // Actions handlers

        // When new conversation is receive.
        this.onConversationRequest = null;

        // When a new message is receive.
        this.onReceiveMessage = null;


        this.width = 350;
        if (this.hasAttribute("width")) {
            this.width = parseInt(this.getAttribute("width"));
        }

        this.height = 550;
        if (this.hasAttribute("height")) {
            this.height = parseInt(this.getAttribute("height"));
        }

    }

    // Init the message menu at login time.
    init(account) {

        // Keep the account reference.
        this.account = account;

        // Event listener when a new conversation is created...
        Model.eventHub.subscribe("create_new_conversation_event",
            (uuid) => { },
            (data) => {
                let conversation = JSON.parse(data)
                console.log("---> new public conversation created: ", conversation)
            },
            false)

        Model.eventHub.subscribe(`create_new_conversation_${this.account.name_}_event`,
            (uuid) => { },
            (data) => {
                let conversation = JSON.parse(data)
                console.log("---> new private conversation created: ", this.account.name_, conversation)
            },
            false)

        let html = `
            <style>
            ${theme}
            #Messages-div {
                display: flex;
                flex-wrap: wrap;
                padding: 10px;
                height: 100%;
                flex-direction: column;
                overflow: hidden;
                min-width: 389.5px;
            }
                          
            #conversations-lst{
                flex: 1;
                overflow: auto;
               
            }

            .conversations-lst{
                display: flex;
                flex-direction: column;
            }

            .btn: hover{
                cursor: pointer;
            }

            #conversation-search-results{
                position: relative;
            }

            </style>

            <div id="Messages-div">
                <div style="display: flex; align-items: center;">
                    <paper-input type="text" label="Search" id="search-conversation-box" width="${this.width}" style="flex-grow: 1;"></paper-input>
                    <div id="new-converstion-btn" class="btn" style="position: relative;">
                        <iron-icon style="flex-grow: 1; --iron-icon-fill-color:var(--palette-text-primary);" icon="add"></iron-icon>
                        <paper-ripple class="circle" recenters=""></paper-ripple>
                    </div>
                </div>
                <div id="conversation-search-results"></div>
                <paper-tabs selected="0">
                    <paper-tab id="owned-conversations-tab">Owned</paper-tab>
                    <paper-tab id="participating-conversations-tab">Participating</paper-tab>
                    <paper-tab id="invitated-conversations-tab">Invitation</paper-tab>
                </paper-tabs>
                <div id="conversations-lst">
                    <div id="owned-conversations-lst" class="conversations-lst"></div>
                    <div id="participating-conversations-lst" class="conversations-lst" style="none"></div>
                    <div id="invitated-conversations-lst" class="conversations-lst" style="none"></div>
                </div>
            </div>
        `


        let range = document.createRange()
        this.getMenuDiv().innerHTML = "" // remove existing elements.
        this.getMenuDiv().appendChild(range.createContextualFragment(html));

        this.getMenuDiv().style.height = this.height + "px";
        this.getMenuDiv().style.overflowY = "auto";
        this.shadowRoot.appendChild(this.getMenuDiv())

        let ownedConversationTab = this.shadowRoot.querySelector("#owned-conversations-tab")
        this.ownedConversationLst = this.shadowRoot.querySelector("#owned-conversations-lst")

        let participatingConversationTab = this.shadowRoot.querySelector("#participating-conversations-tab")
        this.participatingConversationLst = this.shadowRoot.querySelector("#participating-conversations-lst")

        let invitedConversationTab = this.shadowRoot.querySelector("#invitated-conversations-tab")
        this.invitedConversationLst = this.shadowRoot.querySelector("#invitated-conversations-lst")

        ownedConversationTab.onclick = () => {
            this.ownedConversationLst.style.display = "flex"
            this.participatingConversationLst.style.display = "none"
            this.invitedConversationLst.style.display = "none"
        }

        participatingConversationTab.onclick = () => {
            this.ownedConversationLst.style.display = "none"
            this.participatingConversationLst.style.display = "flex"
            this.invitedConversationLst.style.display = "none"
        }

        invitedConversationTab.onclick = () => {
            this.invitedConversationLst.style.display = "flex"
            this.ownedConversationLst.style.display = "none"
            this.participatingConversationLst.style.display = "none"
        }

        // Find a conversation...
        let searchBox = this.shadowRoot.querySelector("#search-conversation-box");
        searchBox.onkeyup = (evt) => {
            let searchConverstionResults = this.shadowRoot.querySelector("#search-conversation-results")
            if (searchConverstionResults != undefined) {
                searchConverstionResults.innerHTML = ""
            }

            if (evt.code == "Enter") {
                ConversationManager.findConversations(searchBox.value,
                    (conversations) => {
                        let html = `
                        <style>
                            #search-conversation-results{
                                position: absolute;
                                top: 0px;
                                left: 0px;
                                display: flex;
                                flex-direction: column;
                                z-index: 100;
                                max-height: 450px;
                                overflow-y: auto;
                            }
                        </style>
                        <paper-card id="search-conversation-results">
                            
                        </paper-card>
                        `

                        this.shadowRoot.querySelector("#conversation-search-results").appendChild(document.createRange().createContextualFragment(html))

                        searchConverstionResults = this.shadowRoot.querySelector("#search-conversation-results")
                        for (var i = 0; i < conversations.length; i++) {
                            let conversationInfos = new ConversationInfos(null, this.account.name_)
                            conversationInfos.init(conversations[i])
                            searchConverstionResults.appendChild(conversationInfos)
                        }
                    },
                    (err) => {
                        console.log(err)
                    })
            } else {

            }
        }


        this.newCoversationBtn = this.shadowRoot.querySelector("#new-converstion-btn")

        this.newCoversationBtn.onclick = () => {
            // simply publish create new conversation...
            Model.eventHub.publish("__create_new_conversation_event__", {}, true)
        }

        /** Event's subscribe... */
        Model.eventHub.subscribe("__new_conversation_event__",
            (uuid) => { },
            (conversation) => {
                this.appendOwnedConversation(conversation)
            },
            true)


        /** Load conversations */
        Model.eventHub.subscribe("__load_owned_conversations_event__",
            (uuid) => { },
            (conversations) => {
                for (var i = 0; i < conversations.length; i++) {
                    this.appendOwnedConversation(conversations[i])
                }
            },
            true)


        Model.eventHub.subscribe("__load_participating_conversations_event__",
            (uuid) => { },
            (conversations) => {
                for (var i = 0; i < conversations.length; i++) {
                    //this.appendOwnedConversation(conversations[i])
                }
            },
            true)

        this.shadowRoot.removeChild(this.getMenuDiv())

    }

    // Display base conversation info
    appendOwnedConversation(conversation) {
        let conversationInfos = new ConversationInfos(null, this.account.name_)
        conversationInfos.init(conversation)
        this.ownedConversationLst.appendChild(conversationInfos)
    }
}

customElements.define('globular-messenger-menu', MessengerMenu)

/**
 * Display conversation basic info...
 */
export class ConversationInfos extends HTMLElement {

    constructor(opened, account) {
        super();

        this.account = account;

        // Set the shadow dom.
        this.attachShadow({ mode: "open" });

        if (this.hasAttribute("opened")) {
            opened = `opened="${this.getAttribute("opened")}"`
        }

        this.shadowRoot.innerHTML = `
        <style>
            ${theme}

            .conversation-infos{
                transition: background 0.2s ease,padding 0.8s linear;
                background-color: var(--palette-background-paper);
                color: var(--palette-text-primary);
                padding-left: 10px;
                padding-right: 10px;
                display: flex;
                flex-direction: column;
                min-width: 295px;
                border-bottom: 1px solid var(--palette-divider);
            }

            .conversation-infos .header{
                display: flex;
            }

            .conversation-infos .header .title{
                padding-top: 5px;
                font-size: 1.1rem;
                flex-grow: 1;
            }

            .conversation-infos .action{
                display: flex;
                align-items: center;
                justify-content: flex-end;
            }

            .conversation-infos:hover {
                filter: invert(10%);
            }

            .conversation-infos paper-button{
                font-size:.65em; 
                width: 20px;
            }

            .conversation-infos .info{
                display:table; 
                border-spacing: 5px;
            }

            .conversation-infos .info .row{
                display: table-row;
            }

            .conversation-infos .info .row div{
                font-size: .85rem;
                display: table-cell;
            }

            .conversation-infos .info .row .label{
                padding-right: 10px;
                font-weight: 410;
            }

            .keywords{
                display: flex;
                padding-right: 10px;
            }

            .keywords span{
                margin-right: 10px;
                font-style: italic;
                background-color: yellow;
                text-align: center;
            }

            paper-button{
                display: flex;
                font-size: .85rem;
                border: none;
                color: var(--palette-text-accent);
                background: var(--palette-primary-accent);
                max-height: 32px;
            }

            paper-icon-button {
                color: var(--paper-pink-500);
                --paper-icon-button-ink-color: var(--paper-indigo-500);
            }

        </style>
        <div class="conversation-infos">
            <div class="header">
                <span class="title"></span>
                <div style="display: flex; width: 32px; height: 32px; justify-content: center; align-items: center;position: relative;">
                    <iron-icon  id="hide-btn"  icon="unfold-less" style="flex-grow: 1; --iron-icon-fill-color:var(--palette-text-primary);" icon="add"></iron-icon>
                    <paper-ripple class="circle" recenters=""></paper-ripple>
                </div>
            </div>
            <iron-collapse id="conversation-infos-collapse" ${opened}>
                <div class="info" style="">
                    <div class="row"> 
                        <div class="label">Created</div> <div class="created"></div>
                    </div>
                    <div class="row"> 
                        <div class="label">Last message</div> <div class="last-message"></div>
                    </div>
                    <div class="row"> 
                        <div class="label">Keywords</div> <div class="keywords"></div>
                    </div>
                    <div class="row"> 
                        <div class="label">Owner'(s)</div> <div class="owners"></div>
                    </div>
                </div>
            </iron-collapse>
            <slot class="action"></slot>
        </div>
        `

        this.titleDiv = this.shadowRoot.querySelector(".title")
        this.created = this.shadowRoot.querySelector(".created")
        this.lastMessage = this.shadowRoot.querySelector(".last-message")
        this.keywords = this.shadowRoot.querySelector(".keywords")
        this.owners = this.shadowRoot.querySelector(".owners")
        this.hideBtn = this.shadowRoot.querySelector("#hide-btn")

        this.hideBtn.onclick = () => {
            let button = this.shadowRoot.querySelector("#hide-btn")
            let content = this.shadowRoot.querySelector("#conversation-infos-collapse")
            if (button && content) {
                if (!content.opened) {
                    button.icon = "unfold-more"
                } else {
                    button.icon = "unfold-less"
                }
                content.toggle();
            }
        }

        this.conversation = null;
    }

    //
    init(conversation) {

        this.conversation = conversation;

        // Set the value in the interfaces.
        this.titleDiv.innerHTML = conversation.getName();
        let creationTime = new Date(conversation.getCreationTime() * 1000)
        this.created.innerHTML = creationTime.toLocaleDateString() + " " + creationTime.toLocaleTimeString()
        if (conversation.getLastMessageTime() > 0) {
            let lastMessageTime = new Date(conversation.getLastMessageTime() * 1000)
            this.created.innerHTML = lastMessageTime.toLocaleDateString() + " " + lastMessageTime.toLocaleTimeString()
        } else {
            this.lastMessage.innerHTML = "no messages reveceived yet..."
        }

        conversation.getKeywordsList().forEach((keyword) => {
            let span = document.createElement("span")
            span.innerHTML = keyword
            this.keywords.appendChild(span)
        })

        // Here  I will display the list of owner for that conversation.
        PermissionManager.getRessourcePermissions(conversation.getUuid(),
            (permissions) => {
                permissions.getOwners().getAccountsList().forEach(owner => {
                    let span = document.createElement("span")
                    span.innerHTML = owner
                    this.owners.appendChild(span)
                    if (owner == this.account) {
                        this.setJoinButton();
                        this.setDeleteButton()
                    }
                })
            },
            (err) => { })

        // Remove it from it parent and delete it...
        Model.eventHub.subscribe(`delete_conversation_${conversation.getUuid()}_evt`,
            (uuid) => {

            },
            (evt) => {
                this.parentNode.removeChild(this)
            },
            false
        )

    }

    /** Display join conversation button */
    setJoinButton(onJoinConversation) {
        this.innerHtml = ""
        let range = document.createRange()
        this.appendChild(range.createContextualFragment(`<paper-button style="font-size:.65em; width: 20px; align-self: flex-end;" id="join_btn">Join</paper-button>`))

        this.querySelector("#join_btn").onclick = () => {
            ConversationManager.joinConversation(this.conversation.getUuid(),
                (messages) => {
                    if (onJoinConversation != null) {
                        onJoinConversation(messages);
                    }

                    // local event
                    Model.eventHub.publish("__join_conversation_evt__", { conversation: this.conversation, messages: messages }, true)

                    // network event.
                    Model.eventHub.publish(`join_conversation_${this.conversation.getUuid()}_evt`, this.account.name, false)
                },
                (err) => {
                    console.log(err);
                })
        }
    }

    /** Display delete conversation button */
    setDeleteButton(onDeleteConversation) {
        this.innerHtml = ""
        let range = document.createRange()
        this.appendChild(range.createContextualFragment(`<paper-button style="font-size:.65em; width: 20px; align-self: flex-end;" id="delete_btn">Delete</paper-button>`))

        this.querySelector("#delete_btn").onclick = () => {
            ConversationManager.deleteConversation(this.conversation.getUuid(), () => {
                // Here the conversation has been deleted...
                Model.eventHub.publish(`delete_conversation_${this.conversation.getUuid()}_evt`, {}, false)
                if (onDeleteConversation != null) {
                    onDeleteConversation();
                }

            }, (err) => { console.log(err) })
        }

    }

}

customElements.define('globular-conversation-infos', ConversationInfos)


/**
 * Messenger conversation manager.
 */
export class Messenger extends HTMLElement {

    constructor(account) {
        super();
        this.account = account;

        // Set the shadow dom.
        this.attachShadow({ mode: "open" });
        this.listeners = {}

        this.shadowRoot.innerHTML = `
        <style>
            ${theme}

            #layout-div-1{
                display: flex;

            }

            #layout-div-1-1{
                display: flex;
                flex-direction: column;
            }

            #layout-div-1-2{
                flex-grow: 1;
            }


            .container{
                display: none;
                flex-direction: column;
                position:fixed;
                bottom: 0px;
                right: 0px;
                background-color: var(--palette-background-paper);
                color: var(--palette-text-primary);
            }

            .header{
                display: flex;
            }

            .summary{
                display: flex;
                flex-grow: 1;
                font-size: 1.1rem;
                align-items: center;
            }

            .btn{
                display: flex; 
                width: 32px; 
                height: 32px; 
                justify-content: center; 
                align-items: 
                center;position: relative;
            }

            .btn iron-icon{
                --iron-icon-fill-color:var(--palette-text-primary);
            }

            .conversations-detail{
                border-bottom: 1px solid var(--palette-divider);
                display: flex;
            }

        </style>

        <paper-card class="container">
            <div class="header">
                <div class="btn">
                    <iron-icon  id="hide-btn-0"  icon="expand-more" style="" icon="add"></iron-icon>
                    <paper-ripple class="circle" recenters=""></paper-ripple>
                </div>
                <div class="summary"></div>
                <div class="btn">
                    <iron-icon  id="hide-btn-1"  icon="unfold-less" icon="add"></iron-icon>
                    <paper-ripple class="circle" recenters=""></paper-ripple>
                </div>
            </div>
            <iron-collapse class="conversations-detail">
                
                <globular-conversations-list></globular-conversations-list>
                <div style="display: flex; flex-direction: column; margin-left: 10px;">
                    <paper-tabs selected="0">
                        <paper-tab id="paticipants-tab">Participants</paper-tab>
                        <paper-tab id="attached-files-tab">Files</paper-tab>
                        <paper-tab id="permissions-tab">Permissions</paper-tab>
                    </paper-tabs>
                    <globular-attached-files-list></globular-attached-files-list>
                    <globular-paticipants-list></globular-paticipants-list>
                </div>
            </iron-collapse>
            <iron-collapse class="messenger-content">
                <globular-messages-panel></globular-messages-panel>
                <globular-message-editor></globular-message-editor>
            </iron-collapse>
        </paper-card>
        `
        this.shadowRoot.querySelector("#hide-btn-0").onclick = () => {
            let button = this.shadowRoot.querySelector("#hide-btn-0")
            let content = this.shadowRoot.querySelector(".conversations-detail")
            if (button && content) {
                if (!content.opened) {
                    button.icon = "expand-less"
                } else {
                    button.icon = "expand-more"
                }
                content.toggle();
            }
        }

        this.shadowRoot.querySelector("#hide-btn-1").onclick = () => {
            let button = this.shadowRoot.querySelector("#hide-btn-1")
            let content = this.shadowRoot.querySelector(".messenger-content")
            if (button && content) {
                if (!content.opened) {
                    button.icon = "unfold-more"
                } else {
                    button.icon = "unfold-less"
                }
                content.toggle();
            }
        }

        // Here I will get interfaces components and initialyse each of them.
        this.conversationsList = this.shadowRoot.querySelector("globular-conversations-list");
        this.conversationsList.setAccount(this.account)
        this.attachedFilesList = this.shadowRoot.querySelector("globular-attached-files-list");
        this.attachedFilesList.setAccount(this.account)
        this.participantsList = this.shadowRoot.querySelector("globular-paticipants-list");
        this.participantsList.setAccount(this.account)
        this.messagesPanel = this.shadowRoot.querySelector("globular-messages-panel");
        this.messagesPanel.setAccount(this.account)
        this.messageEditor = this.shadowRoot.querySelector("globular-message-editor");
        this.messageEditor.setAccount(this.account)

        // Join a conversation local event...
        Model.eventHub.subscribe(`__join_conversation_evt__`,
            (uuid) => { },
            (evt) => {
                this.openConversation(evt.conversation, evt.messages)
                
                // Set the name in the summary title.
                this.shadowRoot.querySelector(".summary").innerHTML = evt.conversation.getName();
            }, true)

    }

    // Here I will open the converstion.
    openConversation(conversation, messages) {

        this.shadowRoot.querySelector(".container").style.display = "flex";
        let conversationUuid = conversation.getUuid()

        Model.eventHub.subscribe(`delete_conversation_${conversationUuid}_evt`,
            (uuid) => { },
            (evt) => {
                this.closeConversation(conversation);
                if(this.conversationsList.children.length == 0){
                    this.shadowRoot.querySelector(".summary").innerHTML = "";
                    this.shadowRoot.querySelector(".container").style.display = "none";
                }
            },
            false)

        Model.eventHub.subscribe(`join_conversation_${conversationUuid}_evt`,
            (uuid) => { },
            (evt) => {
                console.log("Participant enter the conversation ", evt)
            },
            false)

    }

    closeConversation(conversation) {
        console.log("-------------> close a conversation!", conversation)
    }

}

customElements.define('globular-messenger', Messenger)

/**
 * This is where the conversations messages are displayed
 */
export class MessagesPanel extends HTMLElement {

    constructor() {
        super();
        this.account = null;
        this.conversation = null;
        this.listener = null;

        // Set the shadow dom.
        this.attachShadow({ mode: "open" });

        this.shadowRoot.innerHTML = `
        <style>
            ${theme}

            .container{
                min-height: 300px;
                padding-left: 40px;
                padding-right: 40px;
                background-color: var(--palette-background-default);
                
                overflow-y: auto;
            }

            .conversation-message{
                display: flex;
                flex-direction: column;
                background-color: var(--palette-background-paper);
                border: 2px solid var(--palette-divider);
                border-radius: 10px;
                margin-top: 5px;
                margin-bottom: 10px;
            }

            .conversation-message .body{
                padding: 10px;
                font-size: 1rem;
            }


        </style>
        <div class="container">

        </div>
        `

        this.messagesContainer = this.shadowRoot.querySelector(".messages-container");

        Model.eventHub.subscribe(`__join_conversation_evt__`,
            (uuid) => { },
            (evt) => {
                // simply reset the messages...
                this.shadowRoot.querySelector(".container").innerHTML = "";

                this.conversation = evt.conversation;
                if (this.listener != null) {
                    Model.eventHub.unSubscribe(`__received_message_${evt.conversation.getUuid()}_evt__`, this.listener)
                }

                Model.eventHub.subscribe(`__received_message_${evt.conversation.getUuid()}_evt__`,
                    (uuid) => {
                        this.listener = uuid;
                    },
                    (msg) => {
                        this.appendMessage(msg)
                    }, true)

                // I will use the list of message form the event to set 
                for (var i = 0; i < evt.messages.length; i++) {
                    this.appendMessage(evt.messages[i])
                }

            }, true)


    }

    setAccount(account) {
        this.account = account
    }

    /** Append a new message into the list... */
    appendMessage(msg) {

        let html = `
        <div class="conversation-message">
            <div class="body">
                ${msg.getText()}
            </div>
        </div>
        `
        this.shadowRoot.querySelector(".container").appendChild(document.createRange().createContextualFragment(html))

        console.log("--------->", msg.getText())
    }
}


customElements.define('globular-messages-panel', MessagesPanel)

/**
 * This is where the user write new messages.
 */
export class MessageEditor extends HTMLElement {
    constructor() {
        super();
        this.account = null;
        this.conversation = null;

        // Set the shadow dom.
        this.attachShadow({ mode: "open" });

        this.shadowRoot.innerHTML = `
        <style>
            ${theme}

            .container{
                display:flex;
                flex-grow:1;
                padding: 2px;
            }

            .toolbar {
                display: flex;
            }

            .btn{
                display: flex; 
                width: 32px; 
                height: 32px; 
                justify-content: center; 
                align-items: center;
                position: relative;
            }

            .btn:hover{
                cursor: pointer;
            }

            .btn iron-icon{
                flex-grow: 1; 
                --iron-icon-fill-color:var(--palette-text-primary);
            }

            iron-autogrow-textarea {
                border: 1px solid var(--palette-divider);
                border-radius: 3px;
                font-size: 1rem;
            }

        </style>
        <div class="container">
            <div class="toolbar">
                <iron-autogrow-textarea id="text-writer-box"></iron-autogrow-textarea>
                <div class="btn">
                    <iron-icon  id="send-btn" icon="send"></iron-icon>
                    <paper-ripple class="circle" recenters=""></paper-ripple>
                </div>
                <div class="btn">
                    <iron-icon  id="attach-file-btn" icon="editor:insert-drive-file"></iron-icon>
                    <paper-ripple class="circle" recenters=""></paper-ripple>
                </div>
            </div>
        </div>
        `

        Model.eventHub.subscribe(`__join_conversation_evt__`,
            (uuid) => { },
            (evt) => {
                this.conversation = evt.conversation;
            }, true)

        this.send = this.shadowRoot.querySelector("#send-btn")
        this.textWriterBox = this.shadowRoot.querySelector("#text-writer-box")

        this.send.onclick = () => {
            let txt = this.textWriterBox.value;
            this.textWriterBox.value = ""
            let replyTo = ""
            ConversationManager.sendMessage(this.conversation.getUuid(), this.account.name, txt, replyTo,
                () => {
                    /** Nothing here... */
                },
                (err) => {
                    console.log(err)
                })
        }

    }

    setAccount(account) {
        this.account = account
    }
}


customElements.define('globular-message-editor', MessageEditor)


/**
 * Display the list of open conversation (where the user are logged in).
 */
export class ConversationsList extends HTMLElement {

    constructor() {
        super();
        this.account = null;

        // Here I will keep the opened converstion infos...
        this.conversations = {}

        // keep track of conversation listener to delete them if require.
        this.listeners = {}

        // Set the shadow dom.
        this.attachShadow({ mode: "open" });

        this.shadowRoot.innerHTML = `
        <style>
            ${theme}

            .container{
                min-height: 140px;
                font-size: 14px;
                font-weight: 400;
                padding-top: 5px;
                border-right: 1px solid var(--palette-divider);
            }

            .container .active{
                font-weight: 500;
            }

        </style>
        <div class="container">
            
        </div>
        `

        Model.eventHub.subscribe(`__join_conversation_evt__`,
            (uuid) => {

            },
            (evt) => {
                this.openConversation(evt.conversation, evt.messages)

            }, true)



    }

    setAccount(account) {
        this.account = account
    }

    /**
     * Append a new conversation in the conversation panel.
     * @param {*} conversation The conversation object.
     * @param {*} messages The list of actual message.
     */
    openConversation(conversation, messages) {

        if (this.conversations[conversation.getUuid()] != undefined) {
            // simply set as active conversation...
            /** I will unactivate all other conversations... */
            let conversationsListRows = this.shadowRoot.querySelectorAll(`.conversation-list-row`);
            for (var i = 0; i < conversationsListRows.length; i++) {
                conversationsListRows[i].classList.remove("active");
            }
            let selector = this.shadowRoot.querySelector(`#coversation_${conversation.getUuid()}_selector`)
            selector.classList.add("active")
            return
        }


        // keep in memory conversation and message.
        this.conversations[conversation.getUuid()] = { conversation: conversation, messages: messages }

        let html = `
            <style>
                .conversation-list-row{
                    display: flex;
                    background-color: var(--palette-background-paper);
                    transition: background 0.2s ease,padding 0.8s linear;
                    padding: 10px;
                    position: relative;
                }

                .conversation-list-row .active{
                    font-weight: 500;
                }

                .conversation-list-row:hover {
                    filter: invert(10%);
                    cursor: pointer;
                }

            </style>
            <div id="coversation_${conversation.getUuid()}_selector" class="conversation-list-row">
                <div>${conversation.getName()}</div>
                <paper-ripple></paper-ripple>
            </div>
        `

        this.shadowRoot.querySelector(".container").appendChild(document.createRange().createContextualFragment(html))

        let selector = this.shadowRoot.querySelector(`#coversation_${conversation.getUuid()}_selector`)
        let conversationUuid = conversation.getUuid();
        this.listeners[conversationUuid] = []

        Model.eventHub.subscribe(`__received_message_${conversationUuid}_evt__`,
            (uuid) => {
                this.listeners[conversationUuid].push({ evt: `__received_message_${conversationUuid}_evt__`, listenr: uuid })
            },
            (msg) => {
                // keep the message in the list of messages.
                this.conversations[conversationUuid].messages.push(msg)

            }, true)

        Model.eventHub.subscribe(`delete_conversation_${conversationUuid}_evt`,
            (uuid) => {
                this.listeners[conversationUuid].push({ evt: `delete_conversation_${conversation.getUuid()}_evt`, listener: uuid })
            },
            (evt) => {
                // Here I will unsubscribe to each event from it...
                this.listeners[conversationUuid].forEach((value) => {
                    Model.eventHub.unSubscribe(value.evt, value.listener)
                })
                delete this.conversations[conversationUuid];

                let selector = this.shadowRoot.querySelector(`#coversation_${conversationUuid}_selector`)
                if (selector != null) {
                    // remove it from the vue...
                    selector.parentNode.removeChild(selector)
                }

                // Now I will set the current conversation on the first selector found...
                if (selector.classList.contains("active")) {

                    if (this.shadowRoot.querySelector(".conversation-list-row") != undefined) {
                        this.shadowRoot.querySelector(".conversation-list-row").click()
                    }
                }

            },
            false);

        selector.onclick = () => {
            // Set the active conversation...
            Model.eventHub.publish("__join_conversation_evt__", this.conversations[conversationUuid], true)

        }

        selector.click()
    }

}


customElements.define('globular-conversations-list', ConversationsList)


/**
 * Display the list of file attached with that conversation.
 */
export class AttachedFilesList extends HTMLElement {

    constructor() {
        super();
        this.account = null;

        // Set the shadow dom.
        this.attachShadow({ mode: "open" });

        this.shadowRoot.innerHTML = `
        <style>
            ${theme}

            .container{
                
            }

        </style>

        <div class="container">
  
        </div>
        `

        Model.eventHub.subscribe(`__join_conversation_evt__`,
            (uuid) => { },
            (evt) => {

                console.log("---> set attached file for conversation... ");

            }, true)
    }

    setAccount(account) {
        this.account = account
    }
}


customElements.define('globular-attached-files-list', AttachedFilesList)

/**
 * Participants for the active conversation.
 */
export class ParticipantsList extends HTMLElement {

    constructor() {
        super();
        this.account = null;

        // Set the shadow dom.
        this.attachShadow({ mode: "open" });

        this.shadowRoot.innerHTML = `
        <style>
            ${theme}

            .container{
                
            }

        </style>
        <div class="container">
        </div>
        `

        Model.eventHub.subscribe(`__join_conversation_evt__`,
            (uuid) => { },
            (evt) => {
                console.log("---> set paticipants list for convesation...")
            }, true)
    }

    setAccount(account) {
        this.account = account
    }
}


customElements.define('globular-paticipants-list', ParticipantsList)