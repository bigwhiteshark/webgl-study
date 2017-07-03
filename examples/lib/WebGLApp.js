export default class WebGLApp {
  constructor(width, height) {
    this.viewWidth = width;
    this.viewHeight = height;
    this.initWebGL();
  }

  initWebGL() {
    let canvas = document.getElementById('canvas-element-id');
    if (!canvas) {
      canvas = document.createElement('canvas');
      document.body.appendChild(canvas);
    }
    canvas.width = this.viewWidth;
    canvas.height = this.viewHeight;
    window.gl = canvas.getContext('webgl');
  }
}
