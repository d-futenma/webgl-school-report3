import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import gsap from 'gsap/dist/gsap.min'

window.gsap = gsap

window.addEventListener('DOMContentLoaded', () => {
  const app = new App3();
  app.load()
  .then(() => {
    app.init();
    app.render();
  });
}, false);

class App3 {
  static get CLASSES() {
    return {
      isLoaded: 'is-loaded',
    };
  }

  static get COLOR_PARAM() {
    return {
      white: 0xffffff,
      black: 0x212121,
    };
  }

  static get CAMERA_PARAM() {
    return {
      fovy: 60,
      aspect: window.innerWidth / window.innerHeight,
      near: 0.1,
      far: 2000,
      x: 1.5,
      y: 1.0,
      z: -0.75,
      lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    };
  }

  static get RENDERER_PARAM() {
    return {
      clearColor: App3.COLOR_PARAM.black,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  static get DIRECTIONAL_LIGHT_PARAM() {
    return {
      color: 0xffffff,
      intensity: 1.0,
      x: 1.0,
      y: 1.0,
      z: 1.0
    };
  }

  static get AMBIENT_LIGHT_PARAM() {
    return {
      color: 0xffffff,
      intensity: 1.0,
    };
  }

  static get MATERIAL_PARAM() {
    return {
      color: 0xffffff,
      transparent: true,
    };
  }

  static get FOG_PARAM() {
    return {
      fogColor: 0xffffff,
      fogNear: 10.0,
      fogFar: 20.0
    };
  }
  
  /**
   * 宇宙船と惑星の間の距離
   */
  static get PLANET_DISTANCE() {return 1.5;}
  
  /**
   * 宇宙船の移動速度
   */
  static get SPACESHIP_SPEED() {return 0.05;}
  
  /**
   * 宇宙船の曲がる力
   */
  static get SPACESHIP_TURN_SCALE() {return 0.1;}

  constructor() {
    this.renderer;
    this.scene;
    this.camera;
    this.directionalLight;
    this.ambientLight;
    this.controls;
    this.planet;            // 惑星
    this.spaceship;         // 宇宙船
    this.spaceshipDirection // 宇宙船の進行方向

    this.$webgl = document.querySelector('[data-webgl]');
    this.$loader = document.querySelector('[data-loader]');
    
    this.clock = new THREE.Clock();
    this.render = this.render.bind(this);
  }

  load() {
    return new Promise((resolve) => {
      const gltfLoader = new GLTFLoader();
      const gltfPlanetPath = './gltf/planet/scene.gltf';
      const gltfSpaceshipPath = './gltf/spaceship/scene.gltf';

      gltfLoader.load(gltfPlanetPath, (gltfPlanet) => {
        // gltfPlanet.scene.traverse((data) => {
        //   data.castShadow = true;
        //   data.receiveShadow = true;
        // });
        this.planet = gltfPlanet.scene;

        gltfLoader.load(gltfSpaceshipPath, (gltfSpaceship) => {
          this.spaceship = gltfSpaceship.scene;
          resolve();
        });
      });

    });
  }

  init() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setClearColor(new THREE.Color(App3.RENDERER_PARAM.clearColor));
    this.renderer.setSize(App3.RENDERER_PARAM.width, App3.RENDERER_PARAM.height);
    // this.renderer.physicallyCorrectLights = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.outputEncoding = THREE.GammaEncoding;

    this.$webgl.appendChild(this.renderer.domElement);

    // 宇宙船の進行方向の初期値を +Y 方向に
    this.spaceshipDirection = new THREE.Vector3(0.0, 1.0, 0.0).normalize();

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(
      App3.FOG_PARAM.fogColor,
      App3.FOG_PARAM.fogNear,
      App3.FOG_PARAM.fogFar
    );

    this.camera = new THREE.PerspectiveCamera(
      App3.CAMERA_PARAM.fovy,
      App3.CAMERA_PARAM.aspect,
      App3.CAMERA_PARAM.near,
      App3.CAMERA_PARAM.far,
    );
    this.camera.position.set(
      App3.CAMERA_PARAM.x,
      App3.CAMERA_PARAM.y,
      App3.CAMERA_PARAM.z,
    );
    this.camera.lookAt(App3.CAMERA_PARAM.lookAt);

    this.directionalLight = new THREE.DirectionalLight(
      App3.DIRECTIONAL_LIGHT_PARAM.color,
      App3.DIRECTIONAL_LIGHT_PARAM.intensity
    );
    this.directionalLight.position.set(
      App3.DIRECTIONAL_LIGHT_PARAM.x,
      App3.DIRECTIONAL_LIGHT_PARAM.y,
      App3.DIRECTIONAL_LIGHT_PARAM.z,
    );

    // this.directionalLight.castShadow = true;
    // this.directionalLight.shadow.mapSize.set(4096, 4096);

    this.scene.add(this.directionalLight);

    this.ambientLight = new THREE.AmbientLight(
      App3.AMBIENT_LIGHT_PARAM.color,
      App3.AMBIENT_LIGHT_PARAM.intensity,
    );
    this.scene.add(this.ambientLight);

    this.planet.scale.set(0.05, 0.05, 0.05);
    this.planet.position.set(0.0, 0.25, 0.0);
    this.scene.add(this.planet);

    this.spaceship.scale.set(0.04, 0.04, 0.04);
    this.spaceship.position.set(0.0, App3.PLANET_DISTANCE, 0.0);
    this.scene.add(this.spaceship);
    this.spaceshipDirection = new THREE.Vector3(0.0, 1.0, 0.0)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    document.documentElement.classList.add(App3.CLASSES.isLoaded);

    gsap.to(this.camera.position, {
      x: 0.5,
      y: 1,
      z: 1,
      duration: 3,
      ease: 'expo.inOut',
    });
    
    this.onResize();
  }

  render() {
    requestAnimationFrame(this.render);

    this.controls.update();

    this.planet.rotation.y += 0.002;

    // 経過時間の取得
    const time = this.clock.getElapsedTime();
    
    // 時間に基づいたサインとコサインの値を取得する
    const sin = Math.sin(time * 0.2);
    const cos = Math.cos(time * 0.2);

    this.spaceship.position.set(
      0.0,
      cos * App3.PLANET_DISTANCE * 0.55,
      sin * App3.PLANET_DISTANCE * 0.55,
    );

    // 現在（前のフレームまで）の進行方向を変数に保持しておく
    const previousDirection = this.spaceshipDirection.clone();

    // なぜか逆向きになる...3Dモデル側の問題？🤔
    // const subVector = new THREE.Vector3().subVectors(previousDirection, this.spaceship.position);
    const subVector = new THREE.Vector3().subVectors(this.spaceship.position, previousDirection);

    // 長さに依存せず、向きだけを考えたい場合はベクトルを単位化する
    subVector.normalize();

    // 人工衛星の進行方向ベクトルに、向きベクトルを小さくスケールして加算する
    this.spaceshipDirection.add(subVector.multiplyScalar(App3.SPACESHIP_TURN_SCALE));

    // 加算したことでベクトルの長さが変化するので、単位化してから人工衛星の座標に加算する
    this.spaceshipDirection.normalize();
    const direction = this.spaceshipDirection.clone();
    this.spaceship.position.add(direction.multiplyScalar(App3.SPACESHIP_SPEED));

    // 変換前と変換後の２つのベクトルから外積で法線ベクトルを求める
    const normalAxis = new THREE.Vector3().crossVectors(previousDirection, this.spaceshipDirection);
    normalAxis.normalize();

    // 変換前と変換後のふたつのベクトルから内積でコサインを取り出す
    const dotProduct = previousDirection.dot(this.spaceshipDirection);

    // コサインをラジアンに戻す
    const radians = Math.acos(dotProduct);

    // 求めた法線ベクトルとラジアンからクォータニオンを定義
    const qtn = new THREE.Quaternion().setFromAxisAngle(normalAxis, radians);

    // 宇宙船の現在のクォータニオンに乗算する
    this.spaceship.quaternion.premultiply(qtn);

    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }, false);
  }
}
