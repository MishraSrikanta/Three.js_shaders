import * as THREE from "three";
export class Shader_2Class {
  constructor() {}
  static shader_2(scene) {
    const _VS = `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `;
    const _FS = `
    void main() {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
    `;

    const s1 = new THREE.Mesh(
      new THREE.SphereGeometry(1, 10, 10),
      new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: _VS,
        fragmentShader: _FS,
      }),
    );
    scene.add(s1);
  }
}
