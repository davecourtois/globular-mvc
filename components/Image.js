import { theme } from "./Theme";
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-slider/paper-slider.js';

export class ImageCropper extends HTMLElement {
    constructor() {
        super();
        this.oldSrc = '';
    }
    get width() {
        return this.hasAttribute('width');
    }

    get height() {
        return this.hasAttribute('height');
    }

    get rounded() {
        return this.hasAttribute('rounded');
    }

    loadPic(e) {
        var reader = new FileReader();
        this.resetAll();
        reader.readAsDataURL(e.target.files[0]);
        reader.cmp = this;
        reader.onload = function (event) {
            var shdRoot = event.target.cmp.shadowRoot;
            shdRoot.querySelector(".resize-image").setAttribute('src', event.target.result);
            event.target.cmp.oldSrc = event.target.result;
            shdRoot.querySelector(".resize-image").cmp = shdRoot;
            shdRoot.querySelector(".resize-image").onload = function (e) {
                var shdRoot = e.target.cmp;
                shdRoot.querySelector('.slidecontainer').style.display = 'block';
                shdRoot.querySelector('.crop').style.display = 'initial';
                var widthTotal = shdRoot.querySelector(".resize-image").offsetWidth;
                shdRoot.querySelector(".resize-container").style.width = widthTotal + 'px';
                shdRoot.querySelector(".resize-image").style.width = widthTotal + 'px';
                shdRoot.querySelector("#myRange").max = widthTotal + widthTotal;
                shdRoot.querySelector("#myRange").value = widthTotal;
                shdRoot.querySelector("#myRange").min = widthTotal - widthTotal;
            }
        }
    }
    dragElement(elmnt) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        elmnt.onmousedown = dragMouseDown;
        elmnt.ontouchstart = dragMouseDown;

        function dragMouseDown(e) {
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX || e.targetTouches[0].pageX;
            pos4 = e.clientY || e.targetTouches[0].pageY;
            document.onmouseup = closeDragElement;
            document.ontouchend = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
            document.ontouchmove = elementDrag;
        }
        function elementDrag(e) {
            e = e || window.event;
            // calculate the new cursor position:
            pos1 = pos3 - (e.clientX || e.targetTouches[0].pageX);
            pos2 = pos4 - (e.clientY || e.targetTouches[0].pageY);
            pos3 = (e.clientX || e.targetTouches[0].pageX);
            pos4 = (e.clientY || e.targetTouches[0].pageY);
            // set the element's new position:
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }
        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = '';
            document.ontouchend = '';
            document.onmousemove = '';
            document.ontouchmove = '';
        }
    }
    crop() {
        this.shadowRoot.querySelector('.crop').style.display = 'none';
        this.shadowRoot.querySelector('.reset').style.display = 'initial';
        this.shadowRoot.querySelector('.save').style.display = 'initial';
        this.shadowRoot.querySelector('.slidecontainer').style.display = 'none';
        var image = this.shadowRoot.querySelector('.resize-image');

        var resize_canvas = document.createElement('canvas');
        resize_canvas.width = image.offsetWidth;
        resize_canvas.height = image.offsetHeight;
        resize_canvas.getContext('2d').drawImage(image, 0, 0, image.offsetWidth, image.offsetHeight);

        image.setAttribute('src', resize_canvas.toDataURL("image/jepg"));

        var imageContainer = this.shadowRoot.querySelector('.resize-container');
        var centerContainer = this.shadowRoot.querySelector('.center');
        var left = centerContainer.offsetLeft - imageContainer.offsetLeft;
        var top = centerContainer.offsetTop - imageContainer.offsetTop;
        var width = centerContainer.offsetWidth;
        var height = centerContainer.offsetHeight;
        var newTop = centerContainer.offsetTop;
        var newLeft = centerContainer.offsetLeft;

        var crop_canvas = document.createElement('canvas');
        crop_canvas.width = width;
        crop_canvas.height = height;
        crop_canvas.getContext('2d').drawImage(resize_canvas, left, top, width, height, 0, 0, width, height);

        var imageC = this.shadowRoot.querySelector('.imageCropped');
        imageC.src = crop_canvas.toDataURL("image/jepg");
        this.shadowRoot.querySelector('.resize-image').setAttribute('src', '');
    }
    slide(w) {
        this.shadowRoot.querySelector(".resize-container").style.width = (w) + 'px';
        this.shadowRoot.querySelector(".resize-image").style.width = (w) + 'px';
    }
    getCropped() {
        return this.shadowRoot.querySelector(".imageCropped").getAttribute('src');
    }
    resetAll() {
        this.shadowRoot.querySelector(".reset").style.display = 'none';
        this.shadowRoot.querySelector(".save").style.display = 'none';
        this.shadowRoot.querySelector(".crop").style.display = 'none';
        this.shadowRoot.querySelector(".slidecontainer").style.display = 'none';
        this.shadowRoot.querySelector(".resize-container").removeAttribute('style');
        this.shadowRoot.querySelector(".resize-image").setAttribute('src', '');
        this.shadowRoot.querySelector(".imageCropped").setAttribute('src', '');
        this.shadowRoot.querySelector(".resize-image").style.width = '100%';
        this.shadowRoot.querySelector("#myRange").max = 10;
        this.shadowRoot.querySelector("#myRange").value = 5;
        this.shadowRoot.querySelector("#myRange").min = 0;
    }
    reset() {
        this.resetAll();
        this.shadowRoot.querySelector(".resize-image").setAttribute('src', this.oldSrc);
    }
    connectedCallback() {
        let shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = `
        <style>
          ${theme}
          .slidecontainer {
            width: 100%;
            display:none;
            z-index: 1;
            position: relative;
            margin-top:8px;
          }
          .slider {
            -webkit-appearance: none;
            width: 100%;
            height: 15px;
            border-radius: 5px;
            background: #d3d3d3;
            outline: none;
            opacity: 0.9;
            -webkit-transition: .2s;
            transition: opacity .2s;
          }
          .slider:hover {
            opacity: 1;
          }
          .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            background: #2196F3;
            cursor: pointer;
          }
          .slider::-moz-range-thumb {
            width: 25px;
            height: 25px;
            border-radius: 50%;
            background: #2196F3;
            cursor: pointer;
            border:none;
          }
          .resize-container {
            position: relative;
            display: inline-block;
            cursor: move;
            margin: 0 auto;
          }
          .resize-container img {
            display: block;
          }
          .resize-container:hover img,
          .resize-container:active img {
            outline: 2px dashed gray;
          }
          .parent{
            width:99%;
            height:99%;
            overflow: hidden;
            position:absolute;
            top:0px;
            left:0px;
          }
          .center{
            position: absolute;
            width: 150px;
            height: 150px;
            top: calc(50% - 150px/2);
            left: calc(50% - 150px/2);
            z-index: 2;
            background: rgba(255, 255, 255, .3);
            border: 2px solid #cecece;
          }
          .imageCropped{
            position: relative;
            left: -2px;
            top: -2px;
          }
          .uploader{
            z-index: 1;
            position: relative;
            display:none;
          }
          .lb_uploader{
            z-index: 1;
            position: relative;
            cursor:pointer;
          }
          .crop, .reset, .save{
            display:none;
          }
          .btn{
            z-index:1;
            position: relative;
            font-size: .85rem;
            border: none;
            color: var(--palette-text-accent);
            background: var(--palette-primary-accent);
            max-height: 32px;
            border: none;
            z-index:1;
          }
        </style>
        <div>
          <label class='lb_uploader' for='uploader'>
            <slot name='select'>
               <paper-button class='btn' toggles raised ><slot name='selectText'>Select</slot></paper-button>
            </slot>
          </label>
          <label class='reset'>
            <slot name='reset'>
              <paper-button class='btn' toggles raised ><slot name='resetText'>Reset</slot></paper-button>
            </slot>
          </label>
          <label class='crop'>
            <slot name='crop'>
              <paper-button class='btn' toggles raised ><slot name='cropText'>Crop</slot></paper-button>
            </slot>
          </label>
          <label class='save'>
            <slot name='save'>
              <paper-button class='btn' toggles raised ><slot name='saveText'>Save</slot></paper-button>
            </slot>
          </label>
          <input type="file" class="uploader" id='uploader'/>
          <div class="slidecontainer">
            <paper-slider id="myRange" class="slider"> </paper-slider>
          </div>
          <div class='parent'>
            <div class="resize-container">
              <img class="resize-image" src="" style='width:100%'>
            </div>
            <div class='center'><img class="imageCropped"></div>
          </div>
        </div>
        `;
        shadowRoot.querySelector('.uploader').addEventListener('change', e => {
            this.loadPic(e);
        });
        shadowRoot.querySelector('#myRange').addEventListener('immediate-value-change', e => {
            this.slide(e.target.immediateValue);
        });
        shadowRoot.querySelector('.crop').addEventListener('click', e => {
            this.crop();
        });
        shadowRoot.querySelector('.reset').addEventListener('click', e => {
            this.reset();
        });
        if (this.width) {
            shadowRoot.querySelector('.center').style.width = this.getAttribute('width');
            shadowRoot.querySelector('.center').style.left = 'calc(50% - ' + this.getAttribute('width') + '/2)';
        }
        if (this.height) {
            shadowRoot.querySelector('.center').style.height = this.getAttribute('height');
            shadowRoot.querySelector('.center').style.top = 'calc(50% - ' + this.getAttribute('height') + '/2)';
        }
        if (this.rounded) {
            shadowRoot.querySelector('.center').style.borderRadius = '200px';
            shadowRoot.querySelector('.imageCropped').style.borderRadius = '200px';
        }
        this.dragElement(shadowRoot.querySelector(".resize-container"));
    }
}

window.customElements.define('globular-image-cropper', ImageCropper);