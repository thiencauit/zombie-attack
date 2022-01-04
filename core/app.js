import * as THREE from "three";
import EventListener from "./design-pattern/observer/event-listener";
import CoreEvent from "./evens/core-event";
import SceneManager from "./scene/scene-manager";
import Array from "./utils/array";
import ExtendObject3D from "./utils/extend-object-3d";
import ExtendScene from "./utils/extend-scene";
import TextureAtlas from "../core/assets/texture-atlas";
import { ObjectLoader } from "./utils/extend-object-loader";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

global.DEBUG = true;
class App extends EventListener {
    constructor(width, height) {
        super();
        var self = this;
        self.frameCount = 0;
        self.then = performance.now();
        self.elapsed = 0;
        self.fps = 60;
        self.fpsInterval = 1000 / self.fps;
        self.startTime = self.then;
        self.scene = null;
        self.canvas = document.querySelector("canvas.webgl");
        self.canvas.width = width;
        self.canvas.height = height;
        self.renderer = new THREE.WebGLRenderer({ canvas: self.canvas, alpha: false });
        self.renderer.outputEncoding = THREE.sRGBEncoding;
        self.renderer.setSize(width, height);
        document.body.appendChild(self.renderer.domElement);
        self.forceHideCursor = false;

        self.sceneManager = new SceneManager();
        self.register(CoreEvent.CreateScene);
        self.register(CoreEvent.GameOver);
        self.register(CoreEvent.GameStart);
        self.register(CoreEvent.LoadScene);
        self.addScenes();
        self.addKeyEvent();
    }

    addKeyEvent() {
        var self = this;
        if (global.DEBUG) {
            global.addEventListener("keydown", (e) => {
                if (e.key == "Control") {
                    self.controls.enabled = true;
                    self.transformControls.enabled = false;
                }
            });
            global.addEventListener("keyup", (e) => {
                if (e.key == "Control") {
                    self.controls.enabled = false;
                    self.transformControls.enabled = true;
                }
            });

        }
    }

    addHelper() {
        var self = this;
        if (global.DEBUG) {
            self.controls = new OrbitControls(self.scene.camera, self.renderer.domElement);
            self.transformControls = new TransformControls(self.scene.camera, self.renderer.domElement);
            self.controls.enabled = false;
            self.scene.add(self.transformControls);
            self.transformControls.attach(self.scene.enemySpawner.test);
            self.scene.add(new THREE.AxesHelper(500));

        }
    }

    onCreateScene(data) {
        var self = this;
        self.scene = data.scene;
        self.pause = false;

        self.addHelper();
    }

    onGameOver() {
        var self = this;
        document.body.style.cursor = "auto";
        self.pause = true;
        self.forceHideCursor = false;
    }

    onGameStart() {
        var self = this;
        self.pause = false;
        document.body.style.cursor = "none";
        self.forceHideCursor = true;
    }

    onLoadScene(sceneName) {
        var self = this;
        self.sceneManager.LoadScene(sceneName);
    }

    addScenes() {
        var self = this;

    }

    resetTime() {
        var self = this;
        self.startTime = performance.now();
        self.then = performance.now();
        self.frameCount = 0;
        self.isLostFocus = false;
        self.forceHideCursor && (document.body.style.cursor = "none");
    }

    onLostFocus() {
        var self = this;
        self.isLostFocus = true;
        self.forceHideCursor &&  (document.body.style.cursor = "auto");
    }

    StartAnimating() {
        var self = this;
        global.addEventListener("focus", self.resetTime.bind(self));
        global.addEventListener("blur", self.onLostFocus.bind(self));

        self.resetTime();
        self.update();
    }

    update() {
        var self = this;
        requestAnimationFrame(self.update.bind(self));
        if (self.isLostFocus || self.pause) return;
        var now = performance.now();
        self.elapsed = now - self.then;
        var sinceStart = now - self.startTime;
        var deltaTime = Math.round(sinceStart / ++self.frameCount) / 1000;
        self.controls && self.controls.update();
        if (self.scene) {
            self.scene.Update(deltaTime);
            self.scene.UpdateChildren(deltaTime);
        }
        if (self.elapsed > self.fpsInterval) {
            self.then = now - (self.elapsed % self.fpsInterval);
            if (self.scene) {
                self.renderer.render(self.scene, self.scene.camera);
            }
        }

    }


}
export default App;