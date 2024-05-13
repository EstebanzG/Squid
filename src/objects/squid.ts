import {PerspectiveCamera, Scene, WebGLRenderer} from "three";
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {Object, Renderable} from "../main.ts";

export default class Squid implements Object {

    private bones: any[] = [];

    constructor(scene: Scene, renderer: WebGLRenderer, camera: PerspectiveCamera, renderable: Renderable) {
        const loader = new GLTFLoader().setPath('models');
        loader.load('/squid/squid.gltf', async (gltf: any) => {
            const model = gltf.scene;
            await renderer.compileAsync(model, camera, scene);

            this.bones = model.getObjectByName("Cube").skeleton.bones;

            scene.add(model);

            renderable.render();
        });
    }

    animate(_delta: number, time: number): void {
        if (this.bones.length >= 10) {
            // bottom left
            this.bones[11].rotation.z = Math.sin(time / 120) / 2 - 0.2;
            this.bones[12].rotation.z = Math.sin(time / 120) + 0.1;

            // top left
            this.bones[8].rotation.z = Math.cos(time / 120) / 2 + 0.2;
            this.bones[9].rotation.z = Math.cos(time / 120) + 0.1;

            // top right
            this.bones[5].rotation.y = Math.PI / 4;
            this.bones[5].rotation.z = Math.sin(time / 120) / 2 - 0.2;
            this.bones[6].rotation.z = Math.sin(time / 120) + 0.1;

            // bottom right
            this.bones[2].rotation.y = -Math.PI / 4;
            this.bones[2].rotation.z = Math.cos(time / 120) / 2 - 0.2;
            this.bones[3].rotation.z = Math.cos(time / 120) + 0.1;
        }
    }

}