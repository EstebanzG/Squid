import {Bone, Box3, Mesh, MeshBasicMaterial, Object3D, PerspectiveCamera, Scene, WebGLRenderer} from "three";
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {Object, Renderable} from "../main.ts";

export default class Squid implements Object {

    private head: Object3D = new Object3D();

    private tentaclesSkeleton: any[] = [];

    private tentacles: any[] = [];

    private eye: Mesh | null = null;

    constructor(scene: Scene, renderer: WebGLRenderer, camera: PerspectiveCamera, renderable: Renderable) {
        const loader: GLTFLoader = new GLTFLoader().setPath('models');
        loader.load('/squid/pieuvre.gltf', async (object: any) => {
            const model = object.scene;
            await renderer.compileAsync(model, camera, scene);

            this.head = model.getObjectByName("Tête") as Mesh;

            for (let i = 1; i <= 8; i++) {
                this.tentaclesSkeleton[i - 1] = model.getObjectByName("Armature_" + i).getObjectByName("Tentacule_" + i).skeleton.bones;
                this.tentacles[i - 1] = model.getObjectByName("Armature_" + i).getObjectByName("Tentacule_" + i);
            }

            this.tentaclesSkeleton.forEach(tentacle => {
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

    isColliding(bullet: Mesh): boolean {
        const bulletBox = new Box3().setFromObject(bullet);

        let headbox = new Box3().setFromObject(this.head);
        if (bulletBox.intersectsBox(headbox)) return true;

        this.tentacles.forEach(function (tentacle) {
            let boneBox = new Box3().setFromObject(tentacle);
            if (boneBox.intersectsBox(bulletBox)) {
                return true;
            }

        })

        return false;
    }

    animate(): void {
        if ((new Date()).getSeconds() % 10 === 0) {
            this.wink();
        }

        this.animateBones();
    }

    animateBones(): void {
        this.tentaclesSkeleton.forEach(function (tentacle, indexTentacle) {
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