import {
    ACESFilmicToneMapping,
    EquirectangularReflectionMapping, Mesh, Object3D,
    PerspectiveCamera, Raycaster,
    Scene, SphereGeometry,
    Texture, Vector2, Vector3,
    WebGLRenderer
} from 'three';

import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import Squid from "./objects/squid.ts";
import {AudioPlayer} from "./music.ts";

export interface Renderable {
    render: () => void;
}

export interface Object {
    animate: (delta: number, time: number) => void;
}

interface VelocityMesh extends Mesh {
    velocity: Vector3;
    relationVelocity: Vector3;
}

export class Main implements Renderable {
    private readonly camera: PerspectiveCamera;
    private readonly scene: Scene;
    private readonly renderer: WebGLRenderer;
    private readonly raycaster: Raycaster;

    private readonly musicPlayer: AudioPlayer = new AudioPlayer();
    private isPlaying: Boolean = false;

    private readonly squid: Squid;

    private bullets: VelocityMesh[] = [];

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

        this.raycaster = new Raycaster();

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
        this.squid = new Squid(this.scene, this.renderer, this.camera, this);
        //this.shrimp = new Shrimp(this.scene);

        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('click', (event) => {
            if (!this.isPlaying) {
                this.musicPlayer.loadAudio('/public/music/kalash.mp3').then(_ => this.musicPlayer.play());
                this.isPlaying = true;
            }
            this.shootNewBullet(event)
        });
        window.addEventListener('keypress', (event) => {
            if (event.key === "c") {
                this.squid.wink();
            }
        });

        this.animate();
    }

    animate(): void {
        requestAnimationFrame(() => this.animate());


        if (this.isPlaying) {
            this.squid.animate(this.musicPlayer.getMaxFreq()[1]);
        }

        this.bullets = this.bullets.filter((bullet) => {
            bullet.position.add(bullet.velocity.clone());

            if (this.squid.isColliding(bullet)) {
                this.scene.remove(bullet);
                return false;
            }
            return true;
        });

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

    shootNewBullet(event: MouseEvent ): void {
        const bullet = new Object3D();
        bullet.add(new Mesh(new SphereGeometry))

        bullet.position.copy(this.camera.position);
        this.scene.add(bullet);

        const velocityBullet = bullet as unknown as VelocityMesh;

        const mouse : Vector2 = new Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );

        this.raycaster.setFromCamera(mouse, this.camera);

        velocityBullet.velocity = this.raycaster.ray.direction.clone()

        this.bullets.push(velocityBullet)
    }
}

new Main();