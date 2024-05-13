import {Scene} from "three";
import {Object} from "../main.ts";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

export default class Shrimp implements Object {
    constructor(scene: Scene) {
        const loader: OBJLoader  = new OBJLoader().setPath('models');
        loader.load('/shrimp/shrimp.gltf', async (object: any) => {
            scene.add(object);
        },);
    }

    animate(_delta: number): void {
        console.log("animate prawn")
    }
}