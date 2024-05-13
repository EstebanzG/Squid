import {Bone, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer} from "three";
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {Object, Renderable} from "../main.ts";

export default class Squid implements Object {

    private tentacles: any[] = [];

    private eye: Mesh | null = null;

    constructor(scene: Scene, renderer: WebGLRenderer, camera: PerspectiveCamera, renderable: Renderable) {
        const loader = new GLTFLoader().setPath('models');
        loader.load('/squid/pieuvre.gltf', async (gltf: any) => {
            const model = gltf.scene;
            await renderer.compileAsync(model, camera, scene);

            for (let i = 1; i <= 8; i++) {
                this.tentacles[i - 1] = model.getObjectByName("Armature_" + i).getObjectByName("Tentacule_" + i).skeleton.bones;
            }

            this.tentacles.forEach(tentacle => {
                tentacle.forEach((bone: Bone, index: number) => {
                    if (index === 1) {
                        bone.rotation.x = -1;
                    }
                })
            })

            this.eye = model.getObjectByName("Sphère") as Mesh ?? null;

            scene.add(model);

            renderable.render();
        });
    }

    animate(_delta: number): void {
        if ((new Date()).getSeconds() % 10 === 0) {
            this.wink();
        }

        this.animateBones();
    }

    animateBones(): void {
        this.tentacles.forEach(function (tentacle, indexTentacle) {
            indexTentacle++;
            tentacle.forEach(function (bone: Bone, indexBone: number) {

                let initialRotation = 0;

                if (indexBone === 1) {
                    initialRotation = -1
                }

                bone.rotation.x = (initialRotation) + ((Math.cos(Date.now() * 0.001) / 40) * (indexTentacle + indexBone));
                bone.rotation.z = ((Math.cos(Date.now() * 0.001) / 40) * (indexTentacle + indexBone));
            })
        })
    }

    wink(): void {
        if (this.eye === null) return;
        this.eye.material = new MeshBasicMaterial({color: 0x000000});
        setTimeout(() => {
            if (this.eye === null) return;
            this.eye.material = new MeshBasicMaterial({color: 0xffffff});
        }, 100)
    }
}