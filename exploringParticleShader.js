import * as THREE from "three";
export class ExploringParticleShader {
  constructor() {}

  static exploringParticleShader(scene, uniforms) {
    // ==========================
    // DISTORTED CIRCLE
    // ==========================
    const geometry = new THREE.CircleGeometry(1.5, 256);

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      wireframe: false,
      vertexShader: `
    uniform float u_time;
    uniform vec2 u_mouse;
    varying vec2 vUv;

    void main(){
      vUv = uv;

      vec3 pos = position;

      float dist = distance(uv, u_mouse);

      float ripple = sin(dist * 20.0 - u_time * 5.0) * 0.12;
      ripple *= smoothstep(0.5, 0.0, dist);

      pos.z += ripple;
      pos.xy += normalize(pos.xy) * ripple * 0.3;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
    }
  `,
      fragmentShader: `
    uniform float u_time;
    uniform vec2 u_mouse;
    varying vec2 vUv;

    void main(){

      float dist = distance(vUv, u_mouse);

      vec3 colorA = vec3(1.0,0.2,0.5);
      vec3 colorB = vec3(0.2,0.6,1.0);

      float gradient = vUv.y + sin(dist * 15.0 - u_time * 3.0) * 0.15;

      vec3 color = mix(colorA, colorB, gradient);

      float glow = 0.25 / (dist * 8.0 + 0.2);
      color += glow;

      gl_FragColor = vec4(color,1.0);
    }
  `,
    });

    const circle = new THREE.Mesh(geometry, material);
    scene.add(circle);
  }
}
