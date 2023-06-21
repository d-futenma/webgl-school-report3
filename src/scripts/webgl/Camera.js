export class Camera {
  get CAMERA_PARAM() {
    return {
      fovy: 60,
      aspect: window.innerWidth / window.innerHeight,
      near: 0.1,
      far: 2000,
      x: 1.5,
      y: 1.0,
      z: -1.5,
      lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    };
  }

  constructor() {
    this.camera;
    this.init();
  }

  init() {
    this.camera = new THREE.PerspectiveCamera(
      this.CAMERA_PARAM.fovy,
      this.CAMERA_PARAM.aspect,
      this.CAMERA_PARAM.near,
      this.CAMERA_PARAM.far,
    );

    this.camera.position.set(
      this.CAMERA_PARAM.x,
      this.CAMERA_PARAM.y,
      this.CAMERA_PARAM.z,
    );

    this.camera.lookAt(this.CAMERA_PARAM.lookAt);
  }
}