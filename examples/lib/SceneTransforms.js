import { mat4 } from './gl-matrix';


export default class SceneTransforms {
  constructor(camera) {
    this.stack = [];
    this.camera = camera;
    this.mvMatrix = mat4.create();
    this.pMatrix = mat4.create();
    this.nMatrix = mat4.create();
    this.cMatrix = mat4.create();
    this.init();
  }

  calculateModelView() {
    this.mvMatrix = this.camera.getViewTransform();
  }

  calculateNormal() {
    mat4.identity(this.nMatrix);
    mat4.copy(this.nMatrix, this.mvMatrix);
    mat4.invert(this.nMatrix, this.nMatrix);
    mat4.transpose(this.nMatrix, this.nMatrix);
  }

  calculatePerspective(angle, width, height) {
    mat4.identity(this.pMatrix);
    mat4.perspective(this.pMatrix, angle * (Math.PI / 180), width / height, 0.1, 1000.0);
  }

  init() {
    this.calculateModelView();
    this.calculatePerspective();
    this.calculateNormal();
  }

  updatePerspective(angle, width, height) {
    mat4.perspective(this.pMatrix, angle * (Math.PI / 180), width / height, 0.1, 1000.0);
  }

  setMatrixUniforms() {
    const gl = window.gl;
    const program = window.program;
    this.calculateNormal();
    gl.uniformMatrix4fv(program.uMVMatrix, false, this.mvMatrix);
    gl.uniformMatrix4fv(program.uPMatrix, false, this.pMatrix);
    gl.uniformMatrix4fv(program.uNMatrix, false, this.nMatrix);
  }

  push() {
    const memento = mat4.create();
    mat4.copy(memento, this.mvMatrix);
    this.stack.push(memento);
  }

  pop() {
    if (this.stack.length) {
      this.mvMatrix = this.stack.pop();
    }
  }
}
