

import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/image-icons';
import '@polymer/paper-input/paper-input.js';
import { theme } from "./Theme";
export class Camera extends HTMLElement {

    constructor() {
        super()
        this._device = null;
        this._camera = null;
        this._video = null;
        this._canvas = null;
        this._photo = null;
        this._openbutton = null;
        this._startbutton = null;
        this._closebutton = null;
        this._width_inupt = null;
        this._savebutton = null;
        this._deletebutton = null;
        this._camera_options = null;

        // That event will be call when a picture is taken.
        // It will return the image.
        this.onpicture = null;

        // Called When the camera is open
        this.onopen = null;

        // Called when the camera is close.
        this.onclose = null;
        

        // Set default attribute values.
        this._width = 640;
        if(this.hasAttribute("width")){
            this._width = parseInt(this.getAttribute("width"));
        }
        this.streaming = false;
        this._stream = null;

        // save callback.
        this.onsave = null;
        this.onsaved = null;

        // Set the shadow dom.
        this.attachShadow({ mode: 'open' });
    }

    get width() {
        return this._width;
    }

    set width(w) {
        this._width = w
        this._height = this._video.videoHeight / (this._video.videoWidth / this._width);

        /**
         * After calling HTMLMediaElement.play() on the <video>, there's a (hopefully brief) 
         * period of time that elapses before the stream of video begins to flow. To avoid 
         * blocking until that happens, we add an event listener to video for the canplay event, 
         * which is delivered when the video playback actually begins. At that point, all the 
         * properties in the video object have been configured based on the stream's format.
         */
        this._video.setAttribute('width', this._width);
        this._video.setAttribute('height', this._height);
        this._canvas.setAttribute('width', this._width);
        this._canvas.setAttribute('height', this._height);

        this._width_inupt.value = this._width;
    }

    get height() {
        return this._height;
    }

    // The connection callback.
    connectedCallback() {

        // Innitialisation of the layout.
        this.shadowRoot.innerHTML = `
            <style>
                ${theme}

                .camera {
                    position: relative;
                }

                .camera .card-actions{
                    display: flex;
                }

                .camera .card-content{
                    padding-top: 24px;
                }

                .output{
                    display: flex;
                    flex-direction: column; 
                    justify-items: center;
                    align-items: center;
                }

                #camera_options{
                    position: absolute;
                    z-index: 1;
                    top: 4px;
                    left: 16px;
                    border: none;
                    outline: none;
                    scroll-behavior: smooth;
                }

            </style>

            <paper-icon-button id="openbutton" icon="image:camera-alt"></paper-icon-button>

            <paper-card id="camera" class="camera" style="display: none;">
                <select  id="camera_options"></select >
                <div class="card-content">
                    <video id="video"></video>
                    <img id="photo" style="display: none;">
                </div>
                <div class="card-actions">
                    <paper-icon-button id="close_btn" icon="close"></paper-icon-button>
                    <span style="flex-grow: 1;"></span>
                    <div style="display: flex;">
                        <paper-icon-button id="startbutton" icon="image:add-a-photo"></paper-icon-button>
                        <paper-input label="width" type="number" no-label-float  id="width-input" style="padding-left: 10px; width: 5em; text-align: right; vertical-align: baseline;">
                            <div slot="suffix">px</div>
                        </paper-input>
                    </div>
                    <div style="display: none;">
                        <paper-icon-button id="savebutton" icon="save" ></paper-icon-button>
                        <paper-icon-button id="deletebutton" icon="delete"></paper-icon-button>
                    </div>
                </div>
            </paper-card>

            <canvas id="canvas" style="display: none;"></canvas>
        `

        this._width_inupt = this.shadowRoot.getElementById('width-input');
        this._video = this.shadowRoot.getElementById('video');
        this._canvas = this.shadowRoot.getElementById('canvas');
        this._photo = this.shadowRoot.getElementById('photo');
        this._startbutton = this.shadowRoot.getElementById('startbutton');
        this._openbutton = this.shadowRoot.getElementById('openbutton');
        this._closebutton = this.shadowRoot.getElementById('close_btn')
        this._camera = this.shadowRoot.getElementById('camera');
        this._savebutton = this.shadowRoot.getElementById('savebutton');
        this._deletebutton = this.shadowRoot.getElementById('deletebutton');
        this._camera_options = this.shadowRoot.getElementById('camera_options');

        // get the list of available cameras.
        const getCameraSelection = async () => {
            await navigator.mediaDevices.getUserMedia({audio: true, video: true});   
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            const options = videoDevices.map(videoDevice => {
                if (this._device == null) {
                    this._device = videoDevice.deviceId;
                }
                return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
            });
            this._camera_options.innerHTML = options.join('');
        };

        // Set the list of camera.
        getCameraSelection()

        this._savebutton.onclick = ()=>{
            // create event that save the image.
            if(this.onsave != undefined){
                this.onsave({image:this._photo})
            }
            // delete the picture.
            this._deletebutton.click()
        }

        this._camera_options.onchange = () => {
            this._device = this._camera_options.value
            // stop actual camera
            // close existing stream
            if (this._stream != undefined) {
                this._stream.getTracks().forEach(track => {
                    track.stop();
                });
            }

            navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: this._device } }, audio: false })
                .then((stream) => {
                    this._stream = stream;
                    this._video.srcObject = stream;
                    this._video.play()
                })
                .catch(function (err) {
                    console.log("An error occurred: " + err);
                });

        };

        let play = (ev) => {
            if (!this._streaming) {
                this._streaming = true;
            }
        }

        /**
         * Display the camera.
         */
        this._openbutton.onclick = () => {

            this._openbutton.style.display = "none"
            this._video.addEventListener('canplay', play, false);

            /**
             * This function's job is to request access to the user's webcam, initialize the 
             * output <img> to a default state, and to establish the event listeners needed to 
             * receive each frame of video from the camera and react when the button is clicked 
             * to capture an image.
             */
            navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: this._device } }, audio: false })
                .then((stream) => {
                    this._stream = stream;
                    this._video.srcObject = stream;
                    this.width = this._width;
                    this._video.play();
                    this._camera.style.display = ""

                    this._startbutton.addEventListener('click', (ev) => {
                        this.width = this._width_inupt.value
                        this.takepicture();
                        ev.preventDefault();
                    }, false);

                    if(this.onopen != undefined){
                        this.onopen();
                    }
                })
                .catch(function (err) {
                    console.log("An error occurred: " + err);
                });

        }

        this._closebutton.onclick = () => {
            this._camera.style.display = "none"
            this._openbutton.style.display = ""
            this._video.pause();
            this._stream.getTracks()[0].stop();
            this._video.currentTime = 0;
            this._video.removeEventListener('canplay', play);
            this.clearphoto()
            if(this.onclose != null){
                this.onclose();
            }
        }

        this._deletebutton.onclick = () => {
            this.clearphoto()
        }

        /** 
         * Rezise the camera input.
         */
        this._width_inupt.onchange = () => {
            this.width = this._width_inupt.value;
        }
    }

    close(){
        this._closebutton.click(); // close the camera.
    }

    takepicture() {
        if (this._width && this._height) {
            var context = this._canvas.getContext('2d');
            this._canvas.width = this._width;
            this._canvas.height = this._height;

            context.drawImage(this._video, 0, 0, this._width, this._height);
            var data = this._canvas.toDataURL('image/png');
            this._photo.setAttribute('src', data);

            // Here I will hide the video
            this._video.style.display = "none"
            this._photo.style.display = "block"

            // display the save picture button.
            this._savebutton.parentNode.style.display = "flex"
            this._startbutton.parentNode.style.display = "none"

            // Call on picture with the data from the image as blob.
            if(this.onpicture != undefined){
                this._canvas.toBlob(this.onpicture)
            }

        }
    }

    /**
     * Clear the canvas.
     */
    clearphoto() {
        var context = this._canvas.getContext('2d');
        context.fillStyle = "#AAA";
        context.fillRect(0, 0, this._canvas.width, this._canvas.height);

        var data = this._canvas.toDataURL('image/png');
        this._photo.setAttribute('src', data);
        // Here I will hide the video
        this._video.style.display = "block"
        this._photo.style.display = "none"

        // display the save picture button.
        this._savebutton.parentNode.style.display = "none"
        this._startbutton.parentNode.style.display = "flex"
    }

    /**
     * When the web component is disconnect.
     */
    disconnectedCallback() {

    }
}

customElements.define('globular-camera', Camera)