import { Model } from "../Model";
import { theme } from "./Theme";
import '@polymer/paper-input/paper-input.js';

/**
 * 
 * <globular-form >
 *      <globular-form-section>
 *          <globular-string-field label="grape">
 *          </globular-string-field>
 *          <globular-string-field label="grapefruit" x="2" y="1">
 *          </globular-string-field>
 *      <globular-form-section>
 *      <globular-form-section>
 *          <globular-string-field label="Grapefruit Pie" x="1" y="1" width="2" height="3" xsmall ysmall widthsmall heightsmall xlarge ylarge widthlarge heightlarge>
 *          </globular-string-field>
 *      <globular-form-section>
 * </globular-form>
 */
export class Form extends HTMLElement {
    //Should be defined with screen size as well. Might be useful to make it grid instead of flex.
    constructor() {
        super()

        // Set the shadow dom.
        this.attachShadow({ mode: "open" });

        // Setup basic HTML
        this.shadowRoot.innerHTML = `
            <style>
                ${theme}
                #container {
                    display: flex;
                    flex-direction: column;
                }    
            </style>
            <div id="container">
                <span>HELLO SIRS </span>
                <slot>
                </slot>
            </div>
        `

        this.container = this.shadowRoot.getElementById("container")
    }

    clear() {
        this.container.innerHTML = ''
    }

    appendFormSection() {
        //TODO: Create a new form section and append it to this item within the container
        // Create side menu item for each new section which navigates to the new form section.
    }
}

customElements.define("globular-form", Form);

export class FormSection extends HTMLElement {

    // Must be defined following the screen size.
    constructor(title, subtitle, sectionWidth, sectionHeight) {
        super()

        // Set the shadow dom.
        this.attachShadow({ mode: "open" });

        // Setup basic HTML
        this.shadowRoot.innerHTML = `
            <style>
                ${theme}
                #container {
                    display: grid;
                    grid-template-columns: repeat(${sectionWidth}, 1fr);
                    grid-template-rows: repeat(${sectionHeight}, 1fr);
                }
            </style>
            <div>
                <slot id="container">
                </slot>
            </div>
        `

        this.container = this.shadowRoot.getElementById("container")
    }

    clear() {
        this.container.innerHTML = ''
    }

    appendField(field) {
        if (field) {
            this.appendChild(field)
        }
    }
}

customElements.define("globular-form-section", FormSection);

/**
 * Never instantiate a Field variable. This is meant to be an abstract class that must be implemented by a derived class in order to be used properly.
 */
class Field extends HTMLElement {

    /**
     * 
     * @param {*} label 
     * @param {*} initialValue The initial value that the input will show
     * @param {*} x The initial position of the Field on the x axis. Starts at 1.
     * @param {*} y The initial position of the Field on the y axis. Starts at 1.
     * @param {*} width The width of the Field in grid units.
     * @param {*} height The height of the Field in grid units.
     * @param {*} xSmall 
     * @param {*} ySmall 
     * @param {*} widthSmall 
     * @param {*} heightSmall 
     * @param {*} xPhone 
     * @param {*} yPhone 
     * @param {*} widthPhone 
     * @param {*} heightPhone 
     */
    constructor(label, initialValue, x = 0, y = 0, width = 0, height = 0, xSmall = 0, ySmall = 0, widthSmall = 0, heightSmall = 0, xPhone = 0, yPhone = 0, widthPhone = 0, heightPhone = 0) {
        super()
        this.initialValue = initialValue

        let hostHtml = this._setAllSizes(x, y, width, height, xSmall, ySmall, widthSmall, heightSmall, xPhone, yPhone, widthPhone, heightPhone)

        // Set the shadow dom.
        this.attachShadow({ mode: "open" });

        // Setup basic HTML
        this.shadowRoot.innerHTML = `
            <style>
                ${theme}

                .field-label {
                   line-height: 1rem;
                   font-size: .6875rem;
                   font-weight: 500;
                   flex-basis: 156px;
                   letter-spacing: .07272727em;
                   text-transform: uppercase;
                   hyphens: auto;
                   word-break: break-word;
                   word-wrap: break-word;
                }
          
                ${hostHtml}
              </style>
          
              <div id="container">
                <div id="name-div" class="field-label">${label}</div>
              <div>
        `

        this.container = this.shadowRoot.getElementById("container")
    }

    _setAllSizes(x, y, width, height, xSmall, ySmall, widthSmall, heightSmall, xPhone, yPhone, widthPhone, heightPhone) {
        let hostHtml = this._setSize(x, y, width, height)
        hostHtml += this._setConditionalSize(800, xSmall, ySmall, widthSmall, heightSmall)
        hostHtml += this._setConditionalSize(500, xPhone, yPhone, widthPhone, heightPhone)
        return hostHtml
    }

    _setConditionalSize(pixelWidth, x, y, width, height) {
        let conditionalHtml = ``
        if(!pixelWidth || pixelWidth < 0){
            return conditionalHtml
        }
        conditionalHtml = `@media only screen and (max-width: ${pixelWidth}px) {
            ${this._setSize(x, y, width, height)}
        }`

        return conditionalHtml
        
    }
    
    /**
     * Sets the CSS for the size of the host element. 
     * 
     * If x or y are 0 or negative, then there cannot be a width or a height since the grid is dependent on initial position. 
     * The position will also be automatically placed with the grid.
     * 
     * If width or height
     * 
     * @param {*} x The initial position of the Field on the x axis. Starts at 1.
     * @param {*} y The initial position of the Field on the y axis. Starts at 1.
     * @param {*} width The width of the Field in grid units.
     * @param {*} height The height of the Field in grid units.
     */
    _setSize(x, y, width, height) {
        let hostHtml = `:host {
            `
        if (x && x > 0) {
            hostHtml += `grid-column: ${x}`
            if (width && width > 0) {
                hostHtml += ` / ${x + width}`
            }
            hostHtml += `;
                `
        }

        if (y && y > 0) {
            hostHtml += `grid-row: ${y}`
            if (height && height > 0) {
                hostHtml += ` / ${y + height}`
            }
            hostHtml += `;
                `
        }

        hostHtml += `}
            `
        return hostHtml
    }

    /**
     * Hides all the field's elements
     */
    hide() {
        this.container.style.display = "none";
    }

    /**
     * Shows all the field's elements
     */
    show() {
        this.container.style.display = "";
    }

    /**
     * Reset the value of the view and input elements of the configuration with their initial value.
     */
    reset() {
        this.setValue(this.initialValue)
    }

    /**
     * Changes the initial value of the component to the new value. Modifies the current value.
     * @param {*} v New reset value
     */
    set(v) {
        this.initialValue = v
        this.setValue(v)
    }

    /**
     * Returns the value of the current input.
     * 
     * Abstract method.
     * Must be reimplemented in derived classes.
     */
    getValue() {
        return ""
    }

    /**
     * Sets the value of the current input of the view and input elements.
     * 
     * Abstract method.
     * Must be implemented in derived classes.
     * @param {*} v New value for the current input
     */
    setValue(v) { }

    /**
     * Sets the value of the view and input elements to a nill value.
     * 
     * Abstract method.
     * Must be implemented in derived classes.
     */
    clear() { }

    /**
     * Disables the input element and enables the view element.
     *  
     * Abstract method.
     * Must be implemented in derived classes.
     */
    lock() { }

    /**
     * Enables the input element and disables the view element.
     * 
     * Abstract method.
     * Must be implemented in derived classes.
     */
    unlock() { }

}

export class StringField extends Field {

    /**
     * 
     * @param {*} label 
     * @param {*} initialValue The initial value that the input will show.
     * @param {*} x The initial position of the Field on the x axis. Starts at 1.
     * @param {*} y The initial position of the Field on the y axis. Starts at 1.
     * @param {*} width The width of the Field in grid units.
     * @param {*} height The height of the Field in grid units.
     */
    constructor(label, initialValue = "", x = 0, y = 0, width = 0, height = 0) {
        super(label, initialValue, x, y, width, height)
        // Add validation for the input
        let html = `
            <paper-input id="field-input" label="" raised required></paper-input>
            <div id="field-view"></div>
        `
        let range = document.createRange();
        this.container.appendChild(range.createContextualFragment(html))
        this.input = this.shadowRoot.getElementById("field-input");
        this.view = this.shadowRoot.getElementById("field-view")

        //By default, show the input element and not the input element
        this.unlock()
    }

    getValue() {
        return this.input.value
    }

    setValue(v) {
        this.input.value = value
        this.view.innerHTML = value
    }

    clear() {
        this.setValue("")
    }

    lock() {
        this.view.innerHTML = this.input.value

        // Temporary: Change the method to remove and replace the elements
        this.input.style.display = "none"
        this.view.style.display = ""
    }

    unlock() {
        this.input.style.display = ""
        this.view.style.display = "none"
    }

}

customElements.define("globular-string-field", StringField);
