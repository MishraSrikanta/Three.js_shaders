import{C as N,S as p,M as O,B as z,a as w,A as Y,P as D,b as R,L as W,g as T,c as G,d as H,W as j,O as V,e as q,D as E,f as I,h as b,V as U,i as J}from"./vendor.344418bc.js";const K=function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))a(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const r of t.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function s(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerpolicy&&(t.referrerPolicy=e.referrerpolicy),e.crossorigin==="use-credentials"?t.credentials="include":e.crossorigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function a(e){if(e.ep)return;e.ep=!0;const t=s(e);fetch(e.href,t)}};K();class X{constructor(){}static shader_3(i,s){const a=new N(1.5,128),e=new p({uniforms:s,vertexShader:`
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
  `,fragmentShader:`
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
  `}),t=new O(a,e);return i.add(t),t}static pointShader(i,s){const e=new Float32Array(10500),t=new Float32Array(3500*3);for(let n=0;n<3500;n++){const o=Math.random()*Math.PI*2,c=Math.sqrt(Math.random())*2.2,f=Math.cos(o)*c,h=Math.sin(o)*c,A=0;e[n*3]=f,e[n*3+1]=h,e[n*3+2]=A,t[n*3]=f,t[n*3+1]=h,t[n*3+2]=A}const r=new z;r.setAttribute("position",new w(e,3)),r.setAttribute("aOriginal",new w(t,3));const l=new p({uniforms:s,vertexShader:`
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
  `,fragmentShader:`
    varying float vDist;

    void main(){
      float d = length(gl_PointCoord - vec2(0.5));
      float circle = smoothstep(0.5,0.2,d);

      // black & white glow luxury style
      float glow = 1.0 - smoothstep(0.0,2.0,vDist);

      vec3 color = vec3(circle * glow);

      gl_FragColor = vec4(color, circle);
    }
  `,transparent:!0,depthWrite:!1,blending:Y}),m=new D(r,l);i.add(m)}static getGradiantLineMeshForRandomeLines(i,s){const a=new p({uniforms:s,vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,fragmentShader:`
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
  `}),e=new R(2,2),t=new O(e,a);return i.add(t),t}static gradinatLineHeartBeatShader(i,s){const e=new Float32Array(3e4),t=new Float32Array(1e4);function r(o){let c=o*4%1,f=0;return f+=Math.exp(-200*Math.pow(c-.45,2))*1.2,f-=Math.exp(-200*Math.pow(c-.5,2))*.6,f}for(let o=0;o<1e4;o++){let c=o/9999,f=-1+c*5,h=r(c)*.9;e[o*3]=f,e[o*3+1]=h,e[o*3+2]=0,t[o]=c}const l=new z;l.setAttribute("position",new w(e,3)),l.setAttribute("aProgress",new w(t,1));const m=new p({uniforms:s,transparent:!0,blending:Y,vertexShader:`
    attribute float aProgress;
    varying float vProgress;

    void main() {
      vProgress = aProgress;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,fragmentShader:`
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
  `}),n=new W(l,m);return i.add(n),n}}class Z{constructor(){}static runLogInModal(){const i=document.getElementById("loginBtn"),s=document.getElementById("loginModal"),a=document.getElementById("registerModal"),e=document.getElementById("closeLogin"),t=document.getElementById("closeRegister"),r=document.getElementById("showRegister");i.addEventListener("click",()=>{s.classList.remove("hidden")}),e.addEventListener("click",()=>{s.classList.add("hidden")}),r.addEventListener("click",()=>{document.getElementById("regUserId").value="",document.getElementById("regName").value="",document.getElementById("regEmail").value="",document.getElementById("regPhone").value="",document.getElementById("regPassword").value="",s.classList.add("hidden"),a.classList.remove("hidden")}),t.addEventListener("click",()=>{a.classList.add("hidden")}),document.getElementById("submitLogin").addEventListener("click",async()=>{const l=document.getElementById("loginUserId").value.trim(),m=document.getElementById("loginPassword").value.trim(),o=await(await fetch("http://localhost:5000/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:l,password:m})})).json();if(console.log(o),o.token){localStorage.setItem("token",o.token);const c=document.getElementById("welcomeUser");c.innerText=`Welcome, ${o.user.name}`,c.classList.remove("hidden"),document.getElementById("loginBtn").style.display="none",s.classList.add("hidden")}else alert(o.message)}),document.getElementById("submitRegister").addEventListener("click",async()=>{const l={userId:document.getElementById("regUserId").value,name:document.getElementById("regName").value,email:document.getElementById("regEmail").value,phone:document.getElementById("regPhone").value,password:document.getElementById("regPassword").value},n=await(await fetch("http://localhost:5000/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(l)})).json();alert(n.message)})}}T.registerPlugin(ScrollTrigger);Z.runLogInModal();const $=document.querySelectorAll(".section"),L=document.querySelectorAll(".text");let P=null;const Q=[{x:2,y:0,z:0},{x:0,y:0,z:0},{x:-2,y:0,z:0},{x:0,y:0,z:0},{x:2,y:0,z:0},{x:0,y:0,z:0},{x:-2,y:0,z:0},{x:0,y:0,z:0}];window.addEventListener("scroll",()=>{const u=window.scrollY,s=window.innerHeight*6/8;let a=0;$.forEach((t,r)=>{const l=s*r,m=l+s;if(u>=l&&u<m){t.classList.add("visible"),L.forEach(o=>o.classList.remove("visible"));const n=r;L[n]&&(a=n,L[n].classList.add("visible"))}else t.classList.remove("visible")});const e=Q[a];T.to(P.position,{x:e.x,y:e.y,z:e.z,duration:1})});const d=new G,g=new H(50,window.innerWidth/window.innerHeight,.1,1e5);d.add(g);const ee=document.getElementById("bg"),v=new j({canvas:ee,alpha:!0});v.shadowMap.enabled=!0;v.setClearAlpha(0);v.setClearColor(0,0);v.setSize(window.innerWidth,window.innerHeight);d.castShadow=!0;g.position.z=5;const S=new V(g,v.domElement);S.enableDamping=!0;S.enableZoom=!1;const te=new q(16777215,1);d.add(te);const y=new E(16777215,.5);y.position.set(40,40,200);y.lookAt(0,0,0);y.castShadow=!0;d.add(y);const x=new E(16777215,.5);x.position.set(-40,40,200);x.lookAt(0,0,0);x.castShadow=!0;d.add(x);const M=new E(16777215,1);M.position.set(40,40,-200);M.lookAt(0,0,0);d.add(M);const B=new I(16777215,1);B.position.set(0,0,100);B.castShadow=!0;d.add(B);const k=new I(16777215,1);k.position.set(-100,50,50);k.castShadow=!0;d.add(k);const oe=new I(16777215,.01);g.add(oe);new b(16711680),new b(16711680),new b(16776960);const ne=new J,_=new U(0,0),C={u_time:{value:0},u_mouse:{value:new U(0,0)}};P=X.shader_3(d,C);P.position.x+=2;window.addEventListener("mousemove",u=>{_.x=u.clientX/window.innerWidth,_.y=1-u.clientY/window.innerHeight,C.u_mouse.value=_});function F(){requestAnimationFrame(F),v.render(d,g),S.update(),v.clearDepth(),ne.getElapsedTime(),C.u_time.value+=.02}F();
