import * as THREE from "three";
export class Shader_3Class {
  constructor() {}

  static shader_3(scene, uniforms) {
    // Circle geometry
    const geometry = new THREE.CircleGeometry(1.5, 128);

    // Shader material
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: `
    uniform float u_time;
    uniform vec2 u_mouse;
    varying vec2 vUv;

    void main() {
      vUv = uv;

      vec3 pos = position;

      // Distance from mouse
      float dist = distance(uv, u_mouse);

      // Wave distortion
      float wave = sin(dist * 15.0 - u_time * 4.0) * 0.1;

      pos.z += wave;
      pos.x += (uv.x - u_mouse.x) * wave;
      pos.y += (uv.y - u_mouse.y) * wave;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
      fragmentShader: `
    uniform float u_time;
    uniform vec2 u_mouse;
    varying vec2 vUv;

    void main() {

      float dist = distance(vUv, u_mouse);

      // Gradient
      vec3 color1 = vec3(1.0, 0.2, 0.4);
      vec3 color2 = vec3(0.2, 0.5, 1.0);

      float gradient = smoothstep(0.0, 1.0, vUv.y + sin(dist * 10.0 - u_time * 3.0) * 0.1);

      vec3 color = mix(color1, color2, gradient);

      // Glow near mouse
      float glow = 0.05 / (dist * 10.0 + 0.2);
      color += glow;

      gl_FragColor = vec4(color, 1.0);
    }
  `,
    });

    const circle = new THREE.Mesh(geometry, material);
    scene.add(circle);
    return circle;
  }

  static pointShader(scene, uniforms) {
    /* =========================
   Circle Points Geometry
========================= */

    const count = 3500;
    const positions = new Float32Array(count * 3);
    const original = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 2.2;

      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      const z = 0;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      original[i * 3] = x;
      original[i * 3 + 1] = y;
      original[i * 3 + 2] = z;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aOriginal", new THREE.BufferAttribute(original, 3));

    /* =========================
   Shader Material
========================= */

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: `
    uniform float u_time;
    uniform vec2 u_mouse;

    attribute vec3 aOriginal;
    varying float vDist;

    void main(){

      vec3 pos = aOriginal;

      // Convert mouse UV to world approx
      vec2 m = (u_mouse - 0.5) * 4.0;

      float dist = distance(pos.xy, m);
      vDist = dist;

      float strength = 0.35;

      // smooth luxury falloff
      float influence = exp(-dist * 2.5);

      // subtle wave distortion
      float wave = sin(dist * 8.0 - u_time*2.0) * 0.05;

      pos.xy += normalize(pos.xy - m) * influence * strength;
      pos.z += wave * influence;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);

      gl_PointSize = 2.5 + influence * 4.0;
    }
  `,
      fragmentShader: `
    varying float vDist;

    void main(){
      float d = length(gl_PointCoord - vec2(0.5));
      float circle = smoothstep(0.5,0.2,d);

      // black & white glow luxury style
      float glow = 1.0 - smoothstep(0.0,2.0,vDist);

      vec3 color = vec3(circle * glow);

      gl_FragColor = vec4(color, circle);
    }
  `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);
  }

  static getGradiantLineMeshForRandomeLines(scene, uniforms) {
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
      fragmentShader: `
    uniform float u_time;
    varying vec2 vUv;

    // Rainbow gradient
    vec3 rainbow(float t) {
      return vec3(
        0.5 + 0.5*cos(6.28318*(t + 0.0)),
        0.5 + 0.5*cos(6.28318*(t + 0.33)),
        0.5 + 0.5*cos(6.28318*(t + 0.67))
      );
    }

    // ECG heartbeat
    float heartbeat(float x) {
      float beat = mod(x * 4.0, 1.0);
      float spike = 0.0;

      spike += exp(-200.0 * pow(beat - 0.45, 2.0)) * 1.2;
      spike -= exp(-200.0 * pow(beat - 0.5, 2.0)) * 0.6;

      return spike;
    }

    void main() {

      vec2 uv = vUv;

      // Dark cinematic background
      vec3 bg = mix(vec3(0.02,0.02,0.05), vec3(0.0), uv.y);

      float centerY = 0.6;

      // Original ECG line
      float lineY = centerY + heartbeat(uv.x) * 0.25;
      float thickness = 0.008;

      float line = smoothstep(thickness, 0.0, abs(uv.y - lineY));

      // Moving pulse
      float pulsePos = fract(u_time * 0.4);
      float pulse = smoothstep(0.08, 0.0, abs(uv.x - pulsePos));

      vec3 color = rainbow(uv.x);
      float intensity = line * (1.0 + pulse * 2.5);

      vec3 finalColor = bg + color * intensity * 2.0;

      // -----------------------
      // WATER REFLECTION AREA
      // -----------------------

      if (uv.y < centerY) {

        // Mirror vertically
        float reflectY = centerY + (centerY - uv.y);

        // Add animated ripple distortion
        float wave =
          sin(uv.x * 40.0 + u_time * 2.0) * 0.01 +
          sin(uv.x * 80.0 + u_time * 1.5) * 0.005;

        reflectY += wave;

        float reflectLine = smoothstep(
          thickness,
          0.0,
          abs(reflectY - lineY)
        );

        float fade = smoothstep(0.0, centerY, uv.y);

        finalColor += color * reflectLine * 1.5 * fade;
      }

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return mesh;
  }

  static gradinatLineHeartBeatShader(scene, uniforms) {
    const POINTS = 10000;
    const positions = new Float32Array(POINTS * 3);
    const progress = new Float32Array(POINTS);

    // ECG function
    function heartbeat(x) {
      let beat = (x * 4.0) % 1.0;
      let spike = 0;

      spike += Math.exp(-200 * Math.pow(beat - 0.45, 2)) * 1.2;
      spike -= Math.exp(-200 * Math.pow(beat - 0.5, 2)) * 0.6;

      return spike;
    }

    // Generate vertices
    for (let i = 0; i < POINTS; i++) {
      let t = i / (POINTS - 1);
      let x = -1 + t * 5;
      let y = heartbeat(t) * 0.9;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = 0;

      progress[i] = t; // store progress for shader
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aProgress", new THREE.BufferAttribute(progress, 1));

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexShader: `
    attribute float aProgress;
    varying float vProgress;

    void main() {
      vProgress = aProgress;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
      fragmentShader: `
    uniform float u_time;
    varying float vProgress;

    vec3 rainbow(float t) {
      return vec3(
        0.5 + 0.5*cos(6.28318*(t + 0.0)),
        0.5 + 0.5*cos(6.28318*(t + 0.33)),
        0.5 + 0.5*cos(6.28318*(t + 0.67))
      );
    }

    void main() {

      float pulsePos = fract(u_time * 0.4);
      float pulse = smoothstep(0.05, 0.0, abs(vProgress - pulsePos));

      vec3 color = rainbow(vProgress);

      float intensity = 0.6 + pulse * 2.5;

      gl_FragColor = vec4(color * intensity, 1.0);
    }
  `,
    });

    const line = new THREE.Line(geometry, material);
    scene.add(line);
    return line;
  }
}
