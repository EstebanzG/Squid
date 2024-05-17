import {
    Bone,
    Box3,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    PerspectiveCamera,
    Quaternion,
    Scene, Vector3,
    WebGLRenderer
} from "three";
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {Object, Renderable} from "../main.ts";

export default class Squid implements Object {

    private head: Object3D = new Object3D();

    private tentaclesSkeleton: any[] = [];

    private tentacles: Object3D[] = [];

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

    animate(delta: number): void {
        if ((new Date()).getSeconds() % 10 === 0) {
            this.wink();
        }

        delta = delta / 10;
        if (delta < 0.11) delta = 0;

        this.applyQuaternion(delta);

        this.animateBones(delta);
    }

    animateBones(delta: number): void {
        this.tentaclesSkeleton.forEach((tentacle, indexTentacle) => {
            indexTentacle++;
            tentacle.forEach((bone: Bone, indexBone: number) => {
                let initialRotation = 0;

                if (delta != 0 && indexTentacle === 3) {
                    bone.rotation.x = (delta * indexBone);
                    return
                }

                if (indexBone === 1) {
                    initialRotation = -1;
                }

                bone.rotation.x = (initialRotation) + ((Math.cos(Date.now() * 0.001) / 100) * (indexTentacle + indexBone));
                bone.rotation.z = ((Math.cos(Date.now() * 0.001) / 100) * (indexTentacle + indexBone));
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

    applyQuaternion(delta: number): void {
        const quaternion = new Quaternion();
        quaternion.setFromAxisAngle(new Vector3(0,delta * 5, 0), Math.PI / 2);
        this.head.quaternion.copy(quaternion);
    }
}