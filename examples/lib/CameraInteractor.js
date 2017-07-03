export default class CameraInteractor {
  constructor(camera, canvas) {
    this.camera = camera;
    this.canvas = canvas;
    this.dragging = false;
    this.x = 0;
    this.y = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.button = 0;
    this.ctrl = false;
    this.key = 0;
    this.MOTION_FACTOR = 10.0;
    this.dloc = 0;
    this.dstep = 0;
    this.update();
  }

  onMouseUp() {
    this.dragging = false;
  }

  onMouseDown(evt) {
    this.dragging = true;
    this.x = evt.clientX;
    this.y = evt.clientY;
    this.button = evt.button;
    this.dstep = Math.max(this.camera.position[0], this.camera.position[1], this.camera.position[2]) / 100;
  }

  onMouseMove(evt) {
    this.lastX = this.x;
    this.lastY = this.y;
    this.x = evt.clientX;
    this.y = evt.clientY;
    if (!this.dragging) {
      return;
    }
    this.ctrl = evt.ctrlKey;
    this.alt = evt.altKey;
    const dx = this.x - this.lastX;
    const dy = this.y - this.lastY;
    if (this.button === 0) {
      if (this.alt) {
        this.translate(dy);
      } else {
        this.rotate(dx, dy);
      }
    }
  }

  translate(value) {
    if (value > 0) {
      this.dloc += this.dstep;
    } else {
      this.dloc -= this.dstep;
    }
    this.camera.dolly(this.dloc);
  }

  rotate(dx, dy) {
    const camera = this.camera;
    const canvas = this.canvas;

    const delta_elevation = -20.0 / canvas.height;
    const delta_azimuth = -20.0 / canvas.width;

    const nAzimuth = dx * delta_azimuth * this.MOTION_FACTOR;
    const nElevation = dy * delta_elevation * this.MOTION_FACTOR;
    camera.changeAzimuth(nAzimuth);
    camera.changeElevation(nElevation);
  }

  update() {
    const canvas = this.canvas;
    canvas.onmousedown = (evt) => {
      this.onMouseDown(evt);
    };
    canvas.onmousemove = (evt) => {
      this.onMouseMove(evt);
    };
    canvas.onmouseup = (evt) => {
      this.onMouseUp(evt);
    };
  }
}
