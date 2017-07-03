import Scene from './lib/Scene';
import Camera from './lib/Camera';
import Program from './lib/Program';
import Floor from './lib/Floor';
import Axis from './lib/Axis';
import CameraInteractor from './lib/CameraInteractor';
import { mat4 } from './lib/gl-matrix';
// import Util from './lib/Util';
import { GUI } from './lib/dat.gui';

import SceneTransforms from './lib/SceneTransforms';

export default class Ex5_1 {
  constructor() {
    this.viewWidth = 1200;
    this.viewHeight = 400;

    this.CAMERA_ORBITING_TYPE = 1;
    this.CAMERA_TRACKING_TYPE = 2;

    this.home = [0, 2, 50];

    this.updateLightPosition = false;
    this.dx_sphere = 0.1;
    this.dx_cone = 0.15;
    this.pos_sphere = 0;
    this.pos_cone = 0;
    this.frequency = 5;
    this.elapsedTime = 0;
    this.initialTime = 0;

    this.scene = new Scene(this.viewWidth, this.viewHeight);
    this.configure();
    this.load();
    this.draw();
    this.startAnimation();
    this.change();
  }

  configure() {
    const gl = window.gl;
    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    this.camera = new Camera(this.CAMERA_TRACKING_TYPE);
    this.camera.goHome(this.home);
    this.camera.hookRenderer = () => {
      this.draw();
    };

    const canvas = document.getElementById('canvas-element-id');
    this.interactor = new CameraInteractor(this.camera, canvas);

    this.transforms = new SceneTransforms(this.camera);

    const vsCode = require('./glsl/Ex5_1.vs');
    const fsCode = require('./glsl/Ex5_1.fs');
    Program.load(vsCode, fsCode);

    const program = window.program;
    gl.uniform3fv(program.uLightPosition, [0, 120, 120]);
    gl.uniform4fv(program.uLightAmbient, [0.20, 0.20, 0.20, 1.0]);
    gl.uniform4fv(program.uLightDiffuse, [1.0, 1.0, 1.0, 1.0]);
    gl.uniform4fv(program.uLightSpecular, [1.0, 1.0, 1.0, 1.0]);
    gl.uniform1f(program.uShininess, 230.0);
  }

  load() {
    const scene = this.scene;
    const floor = new Floor();
    const axis = new Axis();
    floor.build(80, 2);
    axis.build(82);
    scene.addObject(floor);
    scene.addObject(axis);

    const sphere = require('./models/geometry/sphere.json');
    sphere.alias = 'sphere';
    scene.addObject(sphere);
    const cone = require('./models/geometry/cone.json');
    cone.alias = 'cone';
    scene.addObject(cone);
  }

  draw() {
    const gl = window.gl;
    const transforms = this.transforms;
    const program = window.program;
    const scene = this.scene;

    gl.viewport(0, 0, this.viewWidth, this.viewHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    transforms.updatePerspective(30, this.viewWidth, this.viewHeight);
    try {
      gl.uniform1i(program.uUpdateLight, this.updateLightPosition);
      for (let i = 0, l = scene.objects.length; i < l; i++) {
        const object = scene.objects[i];
        transforms.calculateModelView();
        transforms.push();
        if (object.alias === 'sphere') {
          const sphereTransform = transforms.mvMatrix;
          mat4.translate(sphereTransform, sphereTransform, [0, 0, this.pos_sphere]);
          //  Util.displayMatrix(sphereTransform, 1);
        } else if (object.alias === 'cone') {
          const coneTransform = transforms.mvMatrix;
          mat4.translate(coneTransform, coneTransform, [this.pos_cone, 0, 0]);
          //  Util.displayMatrix(coneTransform, 2);
        }

        transforms.setMatrixUniforms();
        transforms.pop();

        // Setting uniforms
        gl.uniform4fv(program.uMaterialDiffuse, object.diffuse);
        gl.uniform4fv(program.uMaterialSpecular, object.specular);
        gl.uniform4fv(program.uMaterialAmbient, object.ambient);

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
    } catch (ex) {
      console.log(ex);
    }
  }

  change() {
    const controls = new function () {
      this.CameraType = 2;
      this.updateLightPosition = false
      this.PerspectiveType = 1;
    };

    const gui = new GUI({ autoPlace: false });
    const customContainer = document.getElementById('my-gui-container');
    customContainer.appendChild(gui.domElement);
    const typeControl = gui.add(controls, 'CameraType', { orbiting: 1, tracking: 2 });
    typeControl.onChange((value) => {
      this.camera.goHome();
      if (parseInt(value, 0) === this.CAMERA_TRACKING_TYPE) {
        this.camera.setType(this.CAMERA_TRACKING_TYPE);
      } else {
        this.camera.setType(this.CAMERA_ORBIT_TYPE);
      }
      this.draw();
    });
    gui.add(controls, 'updateLightPosition', false).listen().onChange((value) => {
      this.updateLightPosition = value;
      this.draw();
    });
  }

  animate() {

    this.pos_sphere += this.dx_sphere;
    if (this.pos_sphere >= 30 || this.pos_sphere <= -30) {
      this.dx_sphere = -this.dx_sphere;
    }

    this.pos_cone += this.dx_cone;
    if (this.pos_cone >= 35 || this.pos_cone <= -35) {
      this.dx_cone = -this.dx_cone;
    }
    this.draw();
  }

  onFrame() {
    this.elapsedTime = (new Date).getTime() - this.initialTime;
    if (this.elapsedTime < this.frequency) return; // come back later!

    let steps = Math.floor(this.elapsedTime / this.frequency);
    while (steps > 0) {
      this.animate();
      steps -= 1;
    }
    this.initialTime = (new Date).getTime();
  }

  startAnimation() {
    this.initialTime = (new Date).getTime();
    setInterval(() => {
      this.onFrame();
    }, this.frequency / 1000);
  }
}
