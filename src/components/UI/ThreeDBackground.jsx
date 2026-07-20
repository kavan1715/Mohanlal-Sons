import React, { useEffect, useRef } from "react";
import * as THREE from "three";

// Ian McEwan, Ashima Arts Simplex Noise 3D GLSL Code
const simplexNoiseGLSL = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - D.yyy;

  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 1.0/7.0;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}
`;

const ThreeDBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup (Specular Reflections for Glass Look)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const light1 = new THREE.PointLight(0xffffff, 8, 20);
    light1.position.set(3, 4, 5);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x999999, 4, 15);
    light2.position.set(-4, -2, 3);
    scene.add(light2);

    const light3 = new THREE.PointLight(0xffffff, 5, 10);
    light3.position.set(0, -4, -2);
    scene.add(light3);

    // 3. Geometry & Custom Morphing Glass Material
    // Optimized polygon count to prevent vertex calculation bottleneck
    const geometry = new THREE.SphereGeometry(1.6, 40, 40);
    
    // Optimized physical material (uses standard blending instead of heavy refraction passes)
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xf3f4f6,     // Sleek platinum silver
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      transparent: true,
      opacity: 0.2,       // Highly translucent glass effect
    });

    // Custom uniforms injected for morphing speed and wave noise
    const customUniforms = {
      uTime: { value: 0 },
      uDistortion: { value: 0.24 },
      uSpeed: { value: 0.35 },
    };

    // Inject Perlin noise morphing directly into Three.js vertex shader
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = customUniforms.uTime;
      shader.uniforms.uDistortion = customUniforms.uDistortion;
      shader.uniforms.uSpeed = customUniforms.uSpeed;

      shader.vertexShader = `
        uniform float uTime;
        uniform float uDistortion;
        uniform float uSpeed;
        
        ${simplexNoiseGLSL}
        
        ${shader.vertexShader}
      `;

      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
          #include <begin_vertex>
          float time = uTime * uSpeed;
          // Calculate 3D noise based on vertex coordinates
          float noise = snoise(position * 1.4 + vec3(0.0, 0.0, time));
          // Push vertices along their normals based on noise
          transformed += normal * noise * uDistortion;
        `
      );
    };

    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // 4. Interactive State Management
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let scrollY = 0;
    let targetScrollY = 0;
    let scrollVelocity = 0;

    const handleMouseMove = (event) => {
      // Coordinates normalized between -1.5 and 1.5
      targetX = ((event.clientX - window.innerWidth / 2) / window.innerWidth) * 2.5;
      targetY = -((event.clientY - window.innerHeight / 2) / window.innerHeight) * 1.8;
    };

    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Window Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // 5. Render Loop Clock
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      
      // Update time uniform for morphing frequency
      customUniforms.uTime.value = elapsed;

      // Smooth mouse interpolation (inertia)
      mouseX += (targetX - mouseX) * 0.06;
      mouseY += (targetY - mouseY) * 0.06;

      // Update sphere position based on mouse parallax coordinates
      sphere.position.x = mouseX;
      sphere.position.y = mouseY;

      // Smooth scroll interpolation (inertia)
      const prevScrollY = scrollY;
      scrollY += (targetScrollY - scrollY) * 0.08;
      scrollVelocity = scrollY - prevScrollY;

      // Gently rotate the sphere continuously
      sphere.rotation.y = elapsed * 0.06 + scrollY * 0.0015;
      sphere.rotation.x = elapsed * 0.04;

      // Dynamically orbit lights based on scroll position for shifting reflections
      const lightAngle = scrollY * 0.0012;
      light1.position.x = Math.sin(lightAngle) * 5 + 3;
      light1.position.z = Math.cos(lightAngle) * 5 + 5;
      
      light2.position.y = Math.cos(lightAngle) * 4 - 2;

      // Increase morphing distortion slightly based on scrolling velocity
      const targetDistortion = 0.22 + Math.min(Math.abs(scrollVelocity) * 0.008, 0.25);
      customUniforms.uDistortion.value += (targetDistortion - customUniforms.uDistortion.value) * 0.1;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // 6. Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 w-full h-full pointer-events-none block overflow-hidden"
      style={{ mixBlendMode: "normal" }}
    />
  );
};

export default ThreeDBackground;
