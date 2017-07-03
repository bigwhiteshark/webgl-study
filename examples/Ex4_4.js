import { mat4 } from './lib/gl-matrix';
import Util from './lib/Util';
import Scene from './lib/Scene';
import Program from './lib/Program';
import Camera from './lib/Camera';
import CameraInteractor from './lib/CameraInteractor';
import Floor from './lib/Floor';
import Axis from './lib/Axis';
import { GUI } from './lib/dat.gui';

export default class Ex4_4 {
  constructor() {
    this.viewWidth = 1200;
    this.viewHeight = 400;
    this.scene = new Scene(this.viewWidth, this.viewHeight);

    this.mvMatrix = mat4.create();
    this.pMatrix = mat4.create();
    this.nMatrix = mat4.create();
    this.cMatrix = mat4.create();

    this.home = [0, 2, 50];
    this.position = [0, -2, -50];
    this.rotation = [0, 0, 0];
    this.updateLightPosition = false;

    this.COORDS_WORLD = 1;
    this.COORDS_CAMERA = 2;
    this.CAMERA_ORBIT_TYPE = 1;
    this.CAMERA_TRACKING_TYPE = 2;
    this.coords = 1;

    this.load();
    this.initTransforms();
    this.draw();
    this.change();
  }

  initTransforms() {
    let mvMatrix = this.mvMatrix;
    const pMatrix = this.pMatrix;
    let nMatrix = this.nMatrix;

    // Initialize Model-View matrix
    mvMatrix = this.camera.getViewTransform();
    mat4.identity(pMatrix);
    mat4.perspective(pMatrix, 30 * (Math.PI / 180), this.viewWidth / this.viewHeight, 0.1, 10000);

    mat4.identity(nMatrix);
    nMatrix = mat4.clone(mvMatrix);
    mat4.invert(nMatrix, mvMatrix);
    mat4.transpose(nMatrix, nMatrix);

    this.coords = this.COORDS_WORLD;
  }

  updateTransforms() {
    const pMatrix = this.pMatrix;
    mat4.perspective(pMatrix, 30 * (Math.PI / 180), this.viewWidth / this.viewHeight, 0.1, 10000);
  }

  setMatrixUniforms() {
    const program = window.program;
    const gl = window.gl;
    gl.uniformMatrix4fv(program.uMVMatrix, false, this.camera.getViewTransform());
    gl.uniformMatrix4fv(program.uPMatrix, false, this.pMatrix);
    mat4.transpose(this.nMatrix, this.camera.matrix);
    gl.uniformMatrix4fv(program.uNMatrix, false, this.nMatrix);
    Util.displayMatrix(this.camera.matrix);
  }

  change() {
    const controls = new function () {
      this.positionX = 0;
      this.positionY = 2;
      this.positionZ = 50;
      this.elevation = 0;
      this.azimuth = 0;
      this.dolly = 0;
      this.CameraType = 2;
    };

    const gui = new GUI({ autoPlace: false });
    const customContainer = document.getElementById('my-gui-container');
    customContainer.appendChild(gui.domElement);
    const typeControl = gui.add(controls, 'CameraType', { orbiting: 1, tracking: 2 });
    const f1 = gui.addFolder('Postion');
    f1.add(controls, 'positionX', -50, 50).listen().onChange((value) => {
      const p = this.camera.position;
      p[0] = parseFloat(value);
      this.camera.setPosition(p);
      this.draw();
    });
    f1.add(controls, 'positionY', -50, 50).listen().onChange((value) => {
      const p = this.camera.position;
      p[1] = parseFloat(value);
      this.camera.setPosition(p);
      this.draw();
    });
    f1.add(controls, 'positionZ', -50, 50).listen().onChange((value) => {
      const p = this.camera.position;
      p[2] = parseFloat(value);
      this.camera.setPosition(p);
      this.Dolly = this.camera.steps;
      this.draw();
    });

    gui.add(controls, 'elevation', -50, 50).listen().onChange((value) => {
      const elevation = +parseFloat(value);
      this.camera.setElevation(elevation);
      // controls.positionX = this.camera.position[0];
      // controls.positionY = this.camera.position[1];
      // controls.positionZ = this.camera.position[2];
      // controls.elevation = this.camera.elevation;
      // controls.azimuth = this.camera.azimuth;
      this.draw();
    });
    gui.add(controls, 'azimuth', -50, 50).listen().onChange((value) => {
      const azimuth = +parseFloat(value);
      this.camera.setAzimuth(azimuth);
    });
    gui.add(controls, 'dolly', -50, 50).listen().onChange((value) => {
      const dolly = parseFloat(value);
      this.Dolly = dolly;
      this.camera.dolly(dolly);

      controls.positionX = this.camera.position[0];
      controls.positionY = this.camera.position[1];
      controls.positionZ = this.camera.position[2];
      controls.elevation = this.camera.elevation;
      controls.azimuth = this.camera.azimuth;
    });

    typeControl.onChange((value) => {
      this.camera.goHome();
      if (parseInt(value, 0) === this.CAMERA_TRACKING_TYPE) {
        this.camera.setType(this.CAMERA_TRACKING_TYPE);
      } else {
        this.camera.setType(this.CAMERA_ORBIT_TYPE);
      }
      controls.positionX = this.camera.position[0];
      controls.positionY = this.camera.position[1];
      controls.positionZ = this.camera.position[2];
      controls.elevation = this.camera.elevation;
      controls.azimuth = this.camera.azimuth;
      this.draw();
    });


    this.controls = controls;
  }

  load() {
    const vsCode = require('./glsl/Ex4_4.vs');
    const fsCode = require('./glsl/Ex4_4.fs');
    Program.load(vsCode, fsCode);

    const scene = this.scene;
    const floor = new Floor();
    floor.build(60, 2);
    scene.addObject(floor);

    const axis = new Axis();
    axis.build(60);
    scene.addObject(axis);

    const cone = require('./models/geometry/cone.json');
    cone.alias = 'cone';
    scene.addObject(cone);

    this.camera = new Camera(this.CAMERA_TRACKING_TYPE);
    this.camera.goHome(this.home);
    this.camera.hookRenderer = () => {
      this.draw();
    };

    const canvas = document.getElementById('canvas-element-id');
    this.interactor = new CameraInteractor(this.camera, canvas);
  }

  draw() {
    const gl = window.gl;
    const program = window.program;
    const scene = this.scene;

    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.clearDepth(100.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.viewport(0, 0, this.viewWidth, this.viewHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.updateTransforms();
    this.setMatrixUniforms();

    // console.log(this.pMatrix.toString());
    // console.log(this.mvMatrix.toString());
    // console.log(this.cMatrix.toString());

    /* let pMatrix = mat4.create();
    let mvMatrix = mat4.create();
    let nMatrix = mat4.create();

    let uPMatrix = gl.getUniformLocation(program, 'uPMatrix');
    let uMVMatrix = gl.getUniformLocation(program, 'uMVMatrix');
    let uNMatrix = gl.getUniformLocation(program, 'uNMatrix');

    mat4.perspective(pMatrix, 30 * (Math.PI / 180), this.viewWidth / this.viewHeight, 0.1, 10000.0);
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, mvMatrix, this.home);

    gl.uniformMatrix4fv(uPMatrix, false, pMatrix);
    gl.uniformMatrix4fv(uMVMatrix, false, mvMatrix);

    console.log(pMatrix.toString())
    console.log(mvMatrix.toString())

    nMatrix = mat4.clone(mvMatrix);
    mat4.invert(nMatrix, mvMatrix);
    mat4.transpose(nMatrix, nMatrix);

    gl.uniformMatrix4fv(uNMatrix, false, nMatrix);*/

    for (let i = 0, l = scene.objects.length; i < l; i++) {
      const object = scene.objects[i];
      gl.uniform4fv(program.uMaterialDiffuse, object.diffuse);
      gl.uniform1i(program.uWireframe, object.wireframe);
      gl.uniform1i(program.uPerVertexColor, object.perVertexColor);

      gl.enableVertexAttribArray(program.aVertexPosition);
      gl.disableVertexAttribArray(program.aVertexNormal);
      gl.disableVertexAttribArray(program.aVertexColor);

      gl.bindBuffer(gl.ARRAY_BUFFER, object.vbo);
      gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.aVertexPosition);

      if (!object.wireframe) {
        gl.bindBuffer(gl.ARRAY_BUFFER, object.nbo);
        gl.vertexAttribPointer(gl.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(program.aVertexNormal);
      }
      if (object.perVertexColor) {
        gl.bindBuffer(gl.ARRAY_BUFFER, object.cbo);
        gl.vertexAttribPointer(program.aVertexColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(program.aVertexColor);
      }
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.ibo);
      if (object.wireframe) {
        gl.drawElements(gl.LINES, object.indices.length, gl.UNSIGNED_SHORT, 0);
      } else {
        gl.drawElements(gl.TRIANGLES, object.indices.length, gl.UNSIGNED_SHORT, 0);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
  }
}
