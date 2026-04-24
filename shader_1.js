import * as THREE from "three";
export class Shader_1Class {
  constructor() {}

  static shader_1(scene, uniforms) {
    //#region Shaders
    const shader = `
varying vec2 v_uv;
varying vec3 v_position; //To positioning a model(or a particular vertex)

void main(){
  v_uv = uv;
  v_position = position;
  gl_Position = projectionMatrix * viewMatrix * vec4(position * 0.2, 1.0);
}
`;

    const frag = `
uniform vec2 u_mouse;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_color;
uniform vec3 u_color_a;
uniform vec3 u_color_b;
varying vec2 v_uv;
varying vec3 v_position;

float rect(vec2 pt, vec2 anchor, vec2 size, vec2 center){
  vec2 p = pt - center;
  vec2 halfSize = size * 0.5;

  // soultion - 1
  // float horz = (v_position.x > -halfSize.x && v_position.x < halfSize.x)? 1.0 : 0.0;
  
  // soluution-2
  float horz = step(-halfSize.x - anchor.x, p.x) - step(halfSize.x - anchor.x, p.x);
  float vert = step(-halfSize.y - anchor.y, p.y) - step(halfSize.y - anchor.y, p.y);
  return horz * vert;
}

float circle(vec2 pt,float radius, vec2 center, bool soften){
  vec2 p = pt - center;
  float len = length(p);
  float edge = (soften) ? radius * 0.2 :0.0;
  return 1.0 - smoothstep(radius- edge, radius + edge, len);
}

float outlineCir(vec2 pt,float radius, vec2 center, float percentage){
  vec2 p = pt - center;
  float len = length(p);
  float x =  1.0 - (radius, len);
  return 1.0 - step(len , radius - radius * percentage) - step(radius, len);
}

float line(float a, float b , float line_width , float edge_thickness){
  float half_line_width = line_width * 0.5;
  return smoothstep(a - half_line_width - edge_thickness, a- half_line_width, b) - 
  smoothstep(a + half_line_width, a+ half_line_width +  edge_thickness, b);
}

float sweep(vec2 pt, vec2 center, float radius, float line_width, float edge_thickness){
  vec2 d = pt - center;
  float theta = fract(u_time / 4.0) * 3.14 * 2.0;
  vec2 p = vec2(cos(theta), -sin(theta)) * radius;
  float h = clamp(dot(d, p)/ dot(p, p), 0.0, 1.0);
  float l = length(d - p*h);

  float gradient = 0.0;
  const float gradient_angle= 3.141;
  if(length(d)< radius){
    float angle = mod(theta + atan(d.y, d.x), (3.14) * 2.0);
    gradient = clamp(gradient_angle - angle, 0.0, gradient_angle)/gradient_angle * 0.5;
  }

  return  gradient + 1.0 - smoothstep(line_width, line_width + edge_thickness, l);
}

float random(vec2 st){
  const float a =12.9898;
  const float b =78.233;
  const float c =43758.543123;
  return fract(sin(dot(st, vec2(a,b)) + 0.1) * c);

}

float noise(vec2 st){
  vec2 i = floor(st);
  vec2 f = fract(st);

  // Four corners
  float a = random(i);
  float b = random(i + vec2(1.0,0.0));
  float c = random(i + vec2(0.0,1.0));
  float d = random(i + vec2(1.0,1.0));

  vec2 u = f* f* (3.0 - 2.0*f);
  return mix(a,b,u.x)+(c-a)* u.y * (1.0-u.x)+ (d-b) * u.x * u.y;
}

// Rotation of the rect from a single point
mat2 getRotationMatrix(float theta){
  float s = sin(theta);
  float c = cos(theta);
  return mat2(c, s ,-s, c);
}

//scaling
mat2 getScaleMartix(float scale){
  return mat2(scale, 0, 0, scale);
}

void main(){
  //vec2 v = u_mouse / u_resolution;
  // vec3 color = vec3(v.x,0.0, v.y );

  // Using Time for color change in a transition.
  // vec3 color = vec3((sin(u_time) + 1.0) / 2.0,0.0,(cos(u_time) + 1.0) / 2.0);
  
  // vec2 uv = gl_FragCoord.xy/u_resolution;
  // vec3 color = mix(vec3(1.0,0.0,0.0), vec3(0.0,0.0,1.0), uv.x);
  // vec3 color = vec3(v_uv.x, v_uv.y, 0.0); // using uv value from shader
  // vec3 color = vec3(v_position.x, v_position.y, 0.0);

  //clamp
  // vec3 color = vec3(0.0);
  // color.r = clamp(v_position.x, 0.0,1.0);
  // color.g = clamp(v_position.y, 0.0,1.0);

  //step
  // vec3 color = vec3(0.0);
  // color.r = step(-1.0,v_position.x);
  // color.g = step(-1.0,v_position.y);

  //smoothstep
  // vec3 color = vec3(0.0);
  // color.r = smoothstep(0.0,0.5,v_position.x);
  // color.g = smoothstep(0.0,0.6,v_position.y);

  //Draw circle
  // float inCircle = 1.0 - step(1.0, length(v_position.xy));
  // vec3 color = vec3(1.0, 1.0, 0.0) * inCircle;
  // color.g = 1.0;
  // color.r = inCircle< 1.0 ? 0.6 : 1.0;

  //Drawing a square or multiple square
  // float inRect = rect(v_position.xy, vec2(1.0), vec2(0.0, 0.0));
  // float inRect2 = rect(v_position.xy, vec2(0.9), vec2(1.0, 1.0));
  // vec3 color = vec3(1.0, 1.0, 0.0) * inRect + vec3(0.0, 1.0, 0.0) * inRect2;
  // color.r = 1.0;

  // Move the square in a circular path.
  // float radius = 2.0;
  // vec2 center = vec2(cos(u_time) * radius , sin(u_time) * radius);
  // float inRect = rect(v_position.xy, vec2(1.0), center);
  // vec3 color = vec3(1.0,1.0,0.0) * inRect;


  // Move the rect in its edge point and scale it.
  // float radius = 2.0;
  // vec2 center = vec2(0.5, 0.0);
  // mat2 mat = getRotationMatrix(u_time);
  // mat2 mats = getScaleMartix((sin(u_time) + 3.0 / 3.0 + 0.5));
  // vec2 pt = (mats * mat * (v_position.xy - center)) + center;
  // float inRect = rect(pt,vec2(0.5), vec2(1.0), center);
  // vec3 color = vec3(1.0,1.0,0.0) * inRect;

  // TileCount in rectangle: 
  // float tilecount = 6.0;
  // vec2 center = vec2(0.5, 0.5);
  // mat2 mat = getRotationMatrix(u_time);
  // vec2 p= fract(v_uv * tilecount);
  // vec2 pt = (mat * (p - center)) + center;
  // float inRect = rect(pt,vec2(0), vec2(0.5), center);
  // vec3 color = vec3(1.0,1.0,0.0) * inCircle;

  // Tile Count in circle:
  // float inCircle = circle(v_position.xy,0.5, vec2(-0.5), true);
  // float outLineCircle = outlineCir(v_position.xy,1.0, vec2(0.5), 0.05);
  // vec3 color = vec3(1.0,0.0,0.0) * outLineCircle;


  //vec3 color = vec3(1.0,1.0,1.0) * line(v_position.x, v_position.y, 0.02, 0.01);
  // vec3 color = vec3(1.0,1.0,1.0) * line(v_uv.x, v_uv.y, 0.02, 0.01);

  // Making a radar by multiple lines:
  // vec3 axis_color = vec3(0.8);
  // vec3 diaColor = vec3(1.0, 0.6, 0.9);
  // vec3 color = line(v_uv.y, 0.5, 0.002, 0.001) * axis_color;
  // color += line(v_uv.x, 0.5, 0.002, 0.001) * diaColor;
  // color += line(v_uv.x, v_uv.y, 0.002, 0.001) * axis_color;
  // color += outlineCir(v_uv,0.3, vec2(0.5), 0.015) * axis_color;
  // color += outlineCir(v_uv,0.2, vec2(0.5), 0.015) * axis_color;
  // color += outlineCir(v_uv,0.1, vec2(0.5), 0.015) * axis_color;
  // color += sweep(v_uv, vec2(0.5), 0.3, 0.003, 0.001) * vec3(0.1, 0.3, 1.0);

  //Creating Noise: (Old Tv Network loss noise)
  // vec3 color = random(v_uv, u_time) * vec3(1.0);

  vec2 st = v_uv;
  vec2 pos = vec2(st.x* 1.4+0.01, st.y-u_time*0.69);
  pos.y -= u_time * 2.0;
  float n = noise(pos * 12.0);
  pos = vec2(st.x*0.5-0.033, st.y*2.0-u_time*0.12);
  n+= noise(pos*0.8);
  pos = vec2(st.x*0.94-0.02, st.y*3.0-u_time*0.61);
  n+= noise(pos *4.0);
  n /= 3.0;
  vec3 color = mix(u_color_a, u_color_b, n);
  gl_FragColor = vec4(color, 1.0 ); 
}
`;

    const planePiece = new THREE.PlaneGeometry(5, 5, 5, 5);
    const planeMat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: shader,
      fragmentShader: frag,
    });

    const planeMatrial = new THREE.MeshStandardMaterial({
      color: 0x808080,
      clipShadows: true,
      // envMap: textureCube,
      roughness: 1,
      envMapIntensity: 0.2,
      side: THREE.DoubleSide,
    });

    planeMatrial.shadowSide = THREE.DoubleSide;
    const planeMesh = new THREE.Mesh(planePiece, planeMat);
    // planeMesh.rotateX(-Math.PI / 2);
    planeMesh.position.y -= 0.75;
    planeMesh.receiveShadow = true;
    planeMesh.updateMatrix();
    scene.add(planeMesh);

    function moveEvent(event) {
      uniforms.u_mouse.value.x = event.touches
        ? event.touches[0].clientX
        : event.clientX;
      uniforms.u_mouse.value.y = event.touches
        ? event.touches[0].clientY
        : event.clientY;
    }

    function onWindowResize(event) {
      const aspectRatio = window.innerWidth / window.innerHeight;
      let height, width;
      if (aspectRatio >= 1) {
        width = 1;
        height = (window.innerHeight / window.innerWidth) * width;
      } else {
        width = aspectRatio;
        height = 1;
      }
      camera.left = -width;
      camera.right = width;
      camera.top = height;
      camera.bottom = -height;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (uniforms.u_resolution !== undefined) {
        uniforms.u_resolution.value.x = window.innerWidth;
        uniforms.u_resolution.value.y = window.innerHeight;
      }
    }

    //#endregion
  }
}
