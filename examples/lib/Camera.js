import { mat4, vec3, vec4 } from './gl-matrix';

const CAMERA_ORBIT_TYPE = 1;
const CAMERA_TRACKING_TYPE = 2;

export default class Camera {
  constructor(type) {
    this.type = type;
    this.matrix = mat4.create();
    this.up = vec3.create();
    this.right = vec3.create();
    this.normal = vec3.create();
    this.position = vec3.create();
    this.azimuth = 0;
    this.elevation = 0;

    this.home = vec3.create();
  }

  setType(type) {
    this.type = type;
  }

  goHome(home) {
    home && (this.home = home);
    this.setPosition(this.home);
    this.setAzimuth(0);
    this.setElevation(0);
    this.steps = 0;
  }

  setPosition(pos) {
    vec3.copy(this.position, pos);
    this.update();
  }
  setAzimuth(az) {
    this.changeAzimuth(az - this.azimuth);
  }
  changeAzimuth(az) {
    this.azimuth += az;
    if (this.azimuth > 360 || this.azimuth < -360) {
      this.azimuth = this.azimuth % 360;
    }
    this.update();
  }
  setElevation(el) {
    this.changeElevation(el - this.elevation);

  }
  changeElevation(el) {
    this.elevation += el;

    if (this.elevation > 360 || this.elevation < -360) {
      this.elevation = this.elevation % 360;
    }
    this.update();
  }

  dolly(s) {
    let p = vec3.create();
    const n = vec3.create();
    p = this.position;
    const step = s - this.steps;
    vec3.normalize(n, this.normal);
    const newPosition = vec3.create();
    if (this.type === CAMERA_TRACKING_TYPE) {
      newPosition[0] = p[0] - step * n[0];
      newPosition[1] = p[1] - step * n[1];
      newPosition[2] = p[2] - step * n[2];
    } else {
      newPosition[0] = p[0];
      newPosition[1] = p[1];
      newPosition[2] = p[2] - step;
    }
    this.setPosition(newPosition);
    this.steps = s;
  }

  update() {

    mat4.identity(this.matrix);
    vec4.transformMat4(this.right, [1, 0, 0, 0], this.matrix);
    vec4.transformMat4(this.up, [0, 1, 0, 0], this.matrix);
    vec4.transformMat4(this.normal, [0, 0, 1, 0], this.matrix);
    if (this.type === CAMERA_TRACKING_TYPE) {
      mat4.translate(this.matrix, this.matrix, this.position);
      mat4.rotateY(this.matrix, this.matrix, this.azimuth * (Math.PI / 180));
      mat4.rotateX(this.matrix, this.matrix, this.elevation * (Math.PI / 180));
    } else {
      mat4.rotateY(this.matrix, this.matrix, this.azimuth * (Math.PI / 180));
      mat4.rotateX(this.matrix, this.matrix, this.elevation * (Math.PI / 180));
      mat4.translate(this.matrix, this.matrix, this.position);
    }
    if (this.type === CAMERA_TRACKING_TYPE) {
      vec4.transformMat4(this.position, [0, 0, 0, 1], this.matrix);
    }

    if (this.hookRenderer) {
      this.hookRenderer();
    }
    if (this.hookGUIUpdate) {
      this.hookGUIUpdate();
    }
  }

  getViewTransform() {
    const m = mat4.create();
    mat4.invert(m, this.matrix);
    return m;
  }
}
