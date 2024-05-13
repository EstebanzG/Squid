import {
    BufferAttribute,
    BufferGeometry,
    Color,
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    Scene,
    Vector3,
    WebGLRenderer
} from "three";
import {Object, Renderable} from "../main.ts";

export default class CustomShape implements Object {

    private cubes: Mesh[] = [];
    private cubeVelocity: number[] = [];

    constructor(scene: Scene, renderer: WebGLRenderer, camera: PerspectiveCamera, renderable: Renderable) {
        const size = 30;

        for (let z = -size/2; z < size/2; z++) {
            for (let x = -size/2; x < size/2; x++) {
                const color = new Color((x + size / 2) / size, 0.4, (z + size / 2) / size);

                const cube = this.createCube(
                    new Vector3(x, Math.cos((x+z)/4)*2, z),
                    new Vector3(.2, .2, .2),
                    color,
                );

                this.cubes.push(cube);
                this.cubeVelocity[cube.id] = -1;
                scene.add(cube);
            }
        }
    }

    private createCube(
        position: Vector3,
        size: Vector3,
        color: Color
    ): Mesh {
        let vertices = [
            -size.x, -size.y, size.z,
            size.x, -size.y, size.z,
            size.x, size.y, size.z,
            -size.x, size.y, size.z,

            -size.x, -size.y, -size.z,
            size.x, -size.y, -size.z,
            size.x, size.y, -size.z,
            -size.x, size.y, -size.z,
        ];

        let indices = [
            0, 1, 2, 0, 2, 3,  // front
            4, 5, 6, 4, 6, 7,  // back
            4, 5, 1, 4, 1, 0,  // left
            7, 6, 2, 7, 2, 3,  // right
            4, 0, 3, 4, 3, 7,  // top
            1, 5, 6, 1, 6, 2,  // bottom
        ];

        const geometry = new BufferGeometry();
       // geometry.setAttribute('normal', new BufferAttribute(new Float32Array(indices), 3));
        geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
        geometry.setIndex(indices);

        const material = new MeshBasicMaterial({color, side: DoubleSide});
        const mesh = new Mesh(geometry, material);

        mesh.position.x = position.x;
        mesh.position.y = position.y;
        mesh.position.z = position.z;

        return mesh;
    }

    animate(delta: number): void {
        for (const cube of this.cubes) {
            const acceleration = 0.002;
            const maxSpeed = 0.2;
            const minY = -7;
            const maxY = 7;

            let speed = this.cubeVelocity[cube.id];

            if (cube.position.y < 0) {
                speed += acceleration;
            } else if (cube.position.y >= 0) {
                speed -= acceleration;
            }

            if (speed > maxSpeed) {
                speed = maxSpeed;
            } else if (speed < -maxSpeed) {
                speed = -maxSpeed;
            }

            this.cubeVelocity[cube.id] = speed;
            cube.position.y += speed;

            if (cube.position.y <= minY) {
                this.cubeVelocity[cube.id] = acceleration;
                cube.position.y = minY;
            } else if (cube.position.y >= maxY) {
                this.cubeVelocity[cube.id] = -acceleration;
                cube.position.y = maxY;
            }
        }
    }

}