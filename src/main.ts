import {
    ACESFilmicToneMapping,
    EquirectangularReflectionMapping,
    PerspectiveCamera,
    Scene,
    Texture,
    WebGLRenderer
} from 'three';

import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import CustomShape from "./objects/custom.ts";
import Head from "./objects/head.ts";

export interface Renderable {
    render: () => void;
}

export interface Object {
    animate: () => void;
}

export class Main implements Renderable {
    private readonly camera: PerspectiveCamera;
    private readonly scene: Scene;
    private readonly renderer: WebGLRenderer;

    private readonly custom: CustomShape;

    constructor() {
        const container = document.querySelector('.container');

        const aspectRatio = window.innerWidth / window.innerHeight;

        this.camera = new PerspectiveCamera(75, aspectRatio, 0.25, 2000);
        this.camera.position.set(30, 10, -30);

        this.scene = new Scene();

        this.renderer = new WebGLRenderer({antialias: true});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;

        container?.appendChild(this.renderer.domElement);

        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.addEventListener('change', () => this.render());
        controls.minDistance = 1;
        controls.maxDistance = 1000;
        controls.target.set(0, 0, 0);
        controls.update();

        // Background
        new RGBELoader()
            .setPath('textures/robot/')
            .load('royal_esplanade_1k.hdr', (texture: Texture) => {
                texture.mapping = EquirectangularReflectionMapping;

                this.scene.background = texture;
                this.scene.environment = texture;

                this.render();
            });

        // Objects initializations
        new Head(this.scene, this.renderer, this.camera, this);
        this.custom = new CustomShape(this.scene, this.renderer, this.camera, this);

        window.addEventListener('resize', () => this.onWindowResize());

        this.animate();
    }

    animate(): void {
        requestAnimationFrame(() => this.animate());

        this.custom.animate();

        this.render();
    }

    onWindowResize(): void {
        if (this.camera) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(window.innerWidth, window.innerHeight);

            this.render();
        }
    }

    render(): void {
        if (this.renderer) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

new Main();