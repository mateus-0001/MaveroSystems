import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas=document.getElementById('hero-canvas');
const hero=document.querySelector('.hero');
const RM=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const BASEY=0.02;

let renderer,scene,camera,pivot,key,rim,glint;
let heroH=hero.offsetHeight,running=false,raf=0,heroVisible=true;
const P={x:0,y:0,tx:0,ty:0};
const S={intro:0,rot:-1.3};
const clock=new THREE.Clock();
const ready=()=>window.dispatchEvent(new Event('mavero:ready'));

function init(){
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.05;

  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(34,1,0.1,100);
  camera.position.set(0,0,5.6);

  const pm=new THREE.PMREMGenerator(renderer);
  scene.environment=pm.fromScene(new RoomEnvironment(),0.04).texture;
  pm.dispose();

  scene.add(new THREE.HemisphereLight(0x6fa8ff,0x05070d,0.9));
  key=new THREE.DirectionalLight(0xffffff,2.1);key.position.set(3.2,3.4,4.2);scene.add(key);
  rim=new THREE.DirectionalLight(0x3fd0e0,1.3);scene.add(rim);
  glint=new THREE.PointLight(0x7fe9ff,9,9);scene.add(glint);   // luz que percorre o objeto

  resize();
}

function material(){
  return new THREE.MeshPhysicalMaterial({color:0xffffff,vertexColors:true,metalness:0.12,roughness:0.18,clearcoat:1,clearcoatRoughness:0.05,envMapIntensity:1.15});
}

function paintGradient(geo){
  const p=geo.attributes.position,n=p.count,col=new Float32Array(n*3);
  let x0=1e9,x1=-1e9,u0=1e9,u1=-1e9;
  for(let i=0;i<n;i++){const x=p.getX(i),u=-p.getZ(i);if(x<x0)x0=x;if(x>x1)x1=x;if(u<u0)u0=u;if(u>u1)u1=u;}
  const a=new THREE.Color(0x0a3f94),b=new THREE.Color(0x22dde8),c=new THREE.Color();
  for(let i=0;i<n;i++){
    const t=((p.getX(i)-x0)/(x1-x0)+(-p.getZ(i)-u0)/(u1-u0))/2;
    c.lerpColors(a,b,t);col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;
  }
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));
}
function load(){
  const onGltf=(gltf)=>{
    const model=gltf.scene;
    model.traverse(o=>{if(o.isMesh){o.material=material();paintGradient(o.geometry);}});
    model.rotation.x=Math.PI/2;                           // o GLB vem deitado; levanta para encarar a câmera
    model.updateMatrixWorld(true);
    const box=new THREE.Box3().setFromObject(model);
    const size=new THREE.Vector3(),center=new THREE.Vector3();
    box.getSize(size);box.getCenter(center);
    const s=1.95/Math.max(size.x,size.y,size.z);
    model.scale.setScalar(s);
    model.position.copy(center).multiplyScalar(-s);      // centraliza já considerando a escala
    pivot=new THREE.Group();pivot.add(model);pivot.position.y=BASEY;pivot.scale.setScalar(0.55);
    scene.add(pivot);
    renderer.render(scene,camera);                        // compila shaders antes de revelar
    ready();
    modelReady=true;tryIntro();
  };
  const onErr=(e)=>{console.warn('Mavero: falha ao carregar o logo 3D',e);document.documentElement.classList.add('no3d');ready();};
  const loader=new GLTFLoader();
  if(window.MAVERO_GLB){
    const bin=atob(window.MAVERO_GLB),u8=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);
    loader.parse(u8.buffer,'',onGltf,onErr);
  }else loader.load('assets/logo.glb?v=1',onGltf,undefined,onErr);
}

function intro(){
  if(typeof gsap==='undefined'){S.intro=1;S.rot=0;return;}
  if(RM){S.intro=1;S.rot=0;return;}
  gsap.to(S,{intro:1,duration:1.9,ease:'expo.out'});
  gsap.to(S,{rot:0,duration:2.4,ease:'expo.out'});
}
let modelReady=false,introAllowed=!!window.__maveroIntro,introDone=false;
let swapPending=false;
function doSwap(){swapPending=false;S.intro=1;S.rot=0;document.documentElement.classList.remove('slow3d');}   // troca sem animação, fora da vista
function tryIntro(){
  if(introDone||!modelReady||!introAllowed)return;
  introDone=true;
  start();
  if(window.__maveroLate){
    // o 3D chegou depois de a página abrir com o logo normal: só troca quando o topo NÃO está visível
    if(!heroVisible||document.visibilityState==='hidden')doSwap();else swapPending=true;
  }else intro();
}
window.addEventListener('mavero:intro',()=>{introAllowed=true;tryIntro();});

function frame(){
  if(!running)return;
  raf=requestAnimationFrame(frame);
  const t=clock.getElapsedTime();
  P.x+=(P.tx-P.x)*0.06;P.y+=(P.ty-P.y)*0.06;
  const sp=Math.min(1,window.scrollY/heroH);
  const idle=RM?0:1;

  pivot.rotation.y=P.x*0.38+S.rot+sp*1.5+Math.sin(t*0.45)*0.2*idle;
  pivot.rotation.x=-P.y*0.2+0.06+Math.sin(t*0.6)*0.035*idle;
  pivot.position.y=BASEY+Math.sin(t*0.9)*0.05*idle-sp*0.8;
  pivot.scale.setScalar((0.55+0.45*S.intro)*(1-sp*0.3));

  rim.position.set(Math.cos(t*0.7)*5,Math.sin(t*0.5)*2.2,-2.5+Math.sin(t*0.7)*2.5);
  glint.position.set(Math.cos(t*0.9)*2.6,Math.sin(t*1.3)*1.4,2.2);
  key.intensity=2.1+Math.sin(t*1.3)*0.22*idle;

  canvas.style.opacity=(S.intro*(1-sp*0.9)).toFixed(3);
  renderer.render(scene,camera);
}
function start(){if(running||!pivot||!heroVisible||!introAllowed)return;running=true;clock.start();raf=requestAnimationFrame(frame);}
function stop(){running=false;cancelAnimationFrame(raf);}

function resize(){
  const w=canvas.clientWidth,h=canvas.clientHeight;
  if(!w||!h)return;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,w<700?1.5:1.75));
  renderer.setSize(w,h,false);
  camera.aspect=w/h;
  camera.zoom=Math.min(1,(w/h)*1.1);                      // mantém o logo inteiro em telas estreitas
  camera.updateProjectionMatrix();
  heroH=hero.offsetHeight;
}

try{
  init();load();
  window.addEventListener('resize',resize);
  if(window.ResizeObserver)new ResizeObserver(resize).observe(canvas);
  window.addEventListener('pointermove',e=>{P.tx=e.clientX/innerWidth*2-1;P.ty=e.clientY/innerHeight*2-1;},{passive:true});
  new IntersectionObserver(en=>{heroVisible=en[0].isIntersecting;if(!heroVisible&&swapPending)doSwap();heroVisible&&document.visibilityState==='visible'?start():stop();},{threshold:0.02}).observe(hero);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&swapPending)doSwap();document.visibilityState==='visible'&&heroVisible?start():stop();});
}catch(e){console.warn('Mavero 3D desativado:',e);document.documentElement.classList.add('no3d');ready();}
