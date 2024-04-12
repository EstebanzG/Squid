import {PerspectiveCamera, Scene, WebGLRenderer} from "three";
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {Object, Renderable} from "../main.ts";

export default class Head implements Object {

    constructor(scene: Scene, renderer: WebGLRenderer, camera: PerspectiveCamera, renderable: Renderable) {
        const loader = new GLTFLoader().setPath('models/');
        loader.load('head.gltf', async (gltf: any) => {
            const model = gltf.scene;
            await renderer.compileAsync(model, camera, scene);

            scene.add(model);

            renderable.render();
        });
    }

    animate(): void {}

}