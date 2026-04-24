import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm//loaders/GLTFLoader";
import { Shader_1Class } from "./shader_1";
import { Shader_2Class } from "./shader_2";
import { Shader_3Class } from "./shader_3";
import { ExploringParticleShader } from "./exploringParticleShader";
import { LoginModalService } from "./login_modal";
import { gsap } from "gsap";

gsap.registerPlugin(ScrollTrigger);

//LoginModal
LoginModalService.runLogInModal();

const sections = document.querySelectorAll(".section");
const texts = document.querySelectorAll(".text");
let shader3Mesh = null;

// =========================
// SECTION POSITIONS
// =========================
const positions = [
  { x: 2, y: 0, z: 0 },
  { x: 0, y: 0, z: 0 },
  { x: -2, y: 0, z: 0 },
  { x: 0, y: 0, z: 0 },
  { x: 2, y: 0, z: 0 },
  { x: 0, y: 0, z: 0 },
  { x: -2, y: 0, z: 0 },
  { x: 0, y: 0, z: 0 },
];

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  const totalHeight = window.innerHeight * 6; // 6 sections
  const sectionHeight = totalHeight / 8;

  let curIndex = 0;
  sections.forEach((section, index) => {
    const start = sectionHeight * index;
    const end = start + sectionHeight;

    if (scrollY >= start && scrollY < end) {
      section.classList.add("visible");

      // Show 1–2 texts per section
      texts.forEach((text) => text.classList.remove("visible"));

      const textIndex1 = index;
      const textIndex2 = index + 1;

      if (texts[textIndex1]) {
        curIndex = textIndex1;
        texts[textIndex1].classList.add("visible");
      }
    } else {
      section.classList.remove("visible");
    }

    // Optional rotation animation
    // gsap.to(
    //   shader3Mesh.rotation,
    //   {
    //     y: Math.PI * 4,
    //     x: Math.PI * 2,
    //     duration: positions.length,
    //   },
    //   0,
    // );

    // gsap.to(shader3Mesh.position, {
    //   x: index % 2 === 0 ? -0.05 : 0.06,
    //   scrollTrigger: {
    //     trigger: section,
    //     start: "top center",
    //     end: "bottom center",
    //     scrub: true,
    //   },
    // });

    // gsap.to(shader3Mesh.scale, {
    //   x: 1 + index * 0.1,
    //   y: 1 + index * 0.1,
    //   z: 1 + index * 0.1,
    //   scrollTrigger: {
    //     trigger: section,
    //     start: "top center",
    //     end: "bottom center",
    //     scrub: true,
    //   },
    // });
  });
  const curposition = positions[curIndex];
  gsap.to(shader3Mesh.position, {
    x: curposition.x,
    y: curposition.y,
    z: curposition.z,
    duration: 1,
  });
});

// for (const section of sections) {
//   if (!shader3Mesh) continue;
//   gsap.to(shader3Mesh.rotation, {
//     x: index * 1.2,
//     y: index * 0.8,
//     scrollTrigger: {
//       trigger: section,
//       start: "top center",
//       end: "bottom center",
//       scrub: true,
//     },
//   });

//   gsap.to(shader3Mesh.position, {
//     x: index % 2 === 0 ? -1.5 : 1.5,
//     scrollTrigger: {
//       trigger: section,
//       start: "top center",
//       end: "bottom center",
//       scrub: true,
//     },
//   });

//   gsap.to(shader3Mesh.scale, {
//     x: 1 + index * 0.2,
//     y: 1 + index * 0.2,
//     z: 1 + index * 0.2,
//     scrollTrigger: {
//       trigger: section,
//       start: "top center",
//       end: "bottom center",
//       scrub: true,
//     },
//   });
// }

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100000,
);
scene.add(camera);
// scene.backgroundBlurriness = 0.5;
const canvas = document.getElementById("bg");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.shadowMap.enabled = true;
renderer.setClearAlpha(0);
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);

//#region Plane:

scene.castShadow = true;

camera.position.z = 5;
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false;
//#endregion
//#region Lights

const ambientlight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientlight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(40, 40, 200);
directionalLight.lookAt(0, 0, 0);
directionalLight.castShadow = true;
scene.add(directionalLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight1.position.set(-40, 40, 200);
directionalLight1.lookAt(0, 0, 0);
directionalLight1.castShadow = true;
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight2.position.set(40, 40, -200);
directionalLight2.lookAt(0, 0, 0);
// directionalLight2.castShadow = true;
scene.add(directionalLight2);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(0, 0, 100);
pointLight.castShadow = true;
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xffffff, 1);
pointLight2.position.set(-100, 50, 50);
pointLight2.castShadow = true;
scene.add(pointLight2);

const cameraPointLinght = new THREE.PointLight(0xffffff, 0.01);
camera.add(cameraPointLinght);
//#endregion
//#region [ Shader -  1 & 2]
const uniforms = {
  u_time: { value: 0.0 },
  u_mouse: { value: { x: 0.0, y: 0.0 } },
  u_resolution: { value: { x: 0.0, y: 0.0 } },
  u_color: { value: new THREE.Color(0xff0000) },
  u_color_a: { value: new THREE.Color(0xff0000) },
  u_color_b: { value: new THREE.Color(0xffff00) },
};
const clock = new THREE.Clock();
//#endregion

// #region [Mouse Exploring Particle Shader]
// // ==========================
// // MOUSE
// // ==========================
// const mouseExploringParticle = new THREE.Vector2(0.5, 0.5);

// // ==========================
// // SHADER UNIFORMS
// // ==========================
// const uniformsExploringParticle = {
//   u_time: { value: 0 },
//   u_mouse: { value: mouse }
// };

// const shaderExploringParticleMesh = ExploringParticleShader.exploringParticleShader(scene, uniformsExploringParticle);
// // ==========================
// // PARTICLES
// // ==========================
// const particleCount = 100;
// const positions = new Float32Array(particleCount * 3);
// const velocities = new Float32Array(particleCount * 3);

// for(let i=0; i<particleCount; i++){

//   const angle = Math.random() * Math.PI * 2;
//   const radius = Math.random() * 0.5;

//   const x = Math.cos(angle) * radius;
//   const y = Math.sin(angle) * radius;

//   positions[i*3] = x;
//   positions[i*3+1] = y;
//   positions[i*3+2] = 0;

//   velocities[i*3] = (Math.random()-0.5)*0.02;
//   velocities[i*3+1] = (Math.random()-0.5)*0.02;
//   velocities[i*3+2] = Math.random()*0.02;
// }

// const particleGeometry = new THREE.BufferGeometry();
// particleGeometry.setAttribute(
//   'position',
//   new THREE.BufferAttribute(positions,3)
// );

// const particleMaterial = new THREE.PointsMaterial({
//   size: 0.03
// });

// const particles = new THREE.Points(particleGeometry, particleMaterial);
// scene.add(particles);
// window.addEventListener("mousemove",(e)=>{
//   mouse.x = e.clientX / window.innerWidth;
//   mouse.y = 1.0 - (e.clientY / window.innerHeight);
// });
// #endregion

// Mouse
const mouse = new THREE.Vector2(0, 0);
// Uniforms
const uniformsForShader3 = {
  u_time: { value: 0 },
  u_mouse: { value: new THREE.Vector2(0, 0) },
};
shader3Mesh = Shader_3Class.shader_3(scene, uniformsForShader3);
// Shader_3Class.pointShader(scene, uniformsForShader3);
// const shader3Meshs = Shader_3Class.getGradiantLineMeshForRandomeLines(
//   scene,
//   uniformsForShader3,
// );
// const shader3Meshs = Shader_3Class.gradinatLineHeartBeatShader(scene, uniformsForShader3);
shader3Mesh.position.x += 2;
// Mouse movement
window.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX / window.innerWidth;
  mouse.y = 1.0 - event.clientY / window.innerHeight;
  uniformsForShader3.u_mouse.value = mouse;
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
  renderer.clearDepth();
  uniforms.u_time.value = clock.getElapsedTime();
  uniformsForShader3.u_time.value += 0.02;
}

animate();
