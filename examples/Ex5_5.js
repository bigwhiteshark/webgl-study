import Util from './lib/Util';
import Scene from './lib/Scene';
import Camera from './lib/Camera';
import Program from './lib/Program';
import Floor from './lib/Floor';
import Axis from './lib/Axis';
import CameraInteractor from './lib/CameraInteractor';
import { mat4 } from './lib/gl-matrix';
import BouncingBall from './lib/BouncingBall';
import { GUI } from './lib/dat.gui';

import SceneTransforms from './lib/SceneTransforms';

let CONTROL_POINTS = [
  [-25, 0, 20],
  [-40, 0, -10],
  [0, 0, 10],
  [25, 0, -5],
  [40, 0, -20]
];

const ISTEPS = 1000;
const DIM_X = 80;
const DIM_Z = 80;

const I_LINEAR = 0;
const I_POLYNOMIAL = 1;
const I_BSPLINE = 2;

const INITIAL_POSITION = [-25, 0, 20];
const FINAL_POSITION = [40, 0, -20];

export default class Ex5_2 {
  constructor() {
    this.viewWidth = 1200;
    this.viewHeight = 400;

    this.CAMERA_ORBITING_TYPE = 1;
    this.CAMERA_TRACKING_TYPE = 2;
    this.INTERPOLATION_TYPE = I_LINEAR;
    this.ANIMATION_TIMER = -1;

    this.pos = {
      0: [
        [-25, 0, 20],
        [-40, 0, -10],
        [0, 0, 10],
        [25, 0, -5],
        [40, 0, -20]
      ],
      1: [
        [21, 0, 23],
        [-3, 0, -10],
        [-21, 0, -53],
        [50, 0, -31],
        [-24, 0, 2]
      ],
      2: [
        [-21, 0, 23],
        [32, 0, -10],
        [0, 0, -53],
        [-32, 0, -10],
        [21, 0, 23]
      ]
    };

    this.home = [0, 2, 80];
    this.balls = [];

    this.updateLightPosition = false;
    this.dx_sphere = 0.1;
    this.dx_cone = 0.15;
    this.pos_sphere = 0;
    this.pos_cone = 0;
    this.sceneTime = 0;
    this.frequency = 15;
    this.elapsedTime = 0;
    this.initialTime = 0;
    this.position = [];

    this.scene = new Scene(this.viewWidth, this.viewHeight);
    this.configure();
    this.load();
    this.draw();
    this.startAnimation();
    this.change();
  }

  doLinearnterpolate() {
    this.position = [];
    const start = CONTROL_POINTS[0];
    const end = CONTROL_POINTS[CONTROL_POINTS.length - 1];

    const X0 = start[0];
    const Y0 = start[1];
    const Z0 = start[2];

    const X1 = end[0];
    const Y1 = end[1];
    const Z1 = end[2];

    const dx = (X1 - X0) / ISTEPS;
    const dy = (Y1 - Y0) / ISTEPS;
    const dz = (Z1 - Z0) / ISTEPS;

    for (let i = 0; i < ISTEPS; i++) {
      this.position.push([X0 + (dx * i), Y0 + (dy * i), Z0 + (dz * i)]);
    }
  }

  doLagrangeInterpolation() {
    this.position = [];
    const N = CONTROL_POINTS.length;
    const dT = ISTEPS / (N - 1);
    const D = [];

    for (let i = 0; i < N; i++) {
      D[i] = 1;
      for (let j = 0; j < N; j++) {
        if (i === j) {
          continue;
        }
        D[i] *= dT * (i - j);
      }
    }

    const Lk = function (x, axis) {
      const R = [];
      let S = 0;
      for (let i = 0; i < N; i++) {
        R[i] = 1;
        for (let j = 0; j < N; j++) {
          if (i === j) {
            continue;
          }
          R[i] *= (x - j * dT);
        }
        R[i] /= D[i];
        S += (R[i] * CONTROL_POINTS[i][axis]);
      }
      return S;
    };

    for (let k = 0; k < ISTEPS; k++) {
      this.position.push([Lk(k, 0), Lk(k, 1), Lk(k, 2)]);
    }
  }

  doBSplineInterpolation() {
    this.position = [];
    const N = CONTROL_POINTS.length - 1;
    const P = 3; // degree
    const U = []; // Knot Vector
    const M = N + P + 1; // number of elements in the knot vector
    const deltaKnot = 1 / (M - (2 * P));

    // Creating the knot vector (clamped):
    // http://web.mit.edu/hyperbook/Patrikalakis-Maekawa-Cho/node17.html
    for (let i = 0; i <= P; i++) {
      U.push(0);
    }

    let v = deltaKnot;
    for (let i = P + 1; i < M - P + 1; i++) {
      U.push(v);
      v += deltaKnot;
    }
    for (let i = M - P + 1; i <= M; i++) {
      U.push(1);
    }

    function No(u, i) {
      if (U[i] <= u && u < U[i + 1]) {
        return 1;
      } else {
        return 0;
      }
    }

    // Bp function
    function Np(u, i, p) {
      let A = 0;
      let B = 0;
      if (p - 1 === 0) {
        A = No(u, i);
        B = No(u, i + 1);
      } else {
        A = Np(u, i, p - 1);
        B = Np(u, i + 1, p - 1);
      }

      let coeffA = 0;
      let coeffB = 0;
      if (U[i + p] - U[i] !== 0) {
        coeffA = (u - U[i]) / (U[i + p] - U[i]);
      }
      if (U[i + p + 1] - U[i + 1] !== 0) {
        coeffB = (U[i + p + 1] - u) / (U[i + p + 1] - U[i + 1]);
      }
      return coeffA * A + coeffB * B;
    }

    function C(t) {
      const result = [];
      for (let j = 0; j < 3; j++) { // iterate over axes
        let sum = 0;
        for (let i = 0; i <= N; i++) { // iterate over control points
          sum += CONTROL_POINTS[i][j] * Np(t, i, P);
        }
        result[j] = sum;
      }
      return result;
    }

    const dT = 1 / ISTEPS;
    let t = 0;
    do {
      this.position.push(C(t));
      t += dT;
    } while (t < 1.0);
    this.position.push(C(1.0));
  }

  interpolate() {
    if (this.INTERPOLATION_TYPE === I_LINEAR) {
      this.doLinearnterpolate();
    } else if (this.INTERPOLATION_TYPE === I_POLYNOMIAL) {
      this.doLagrangeInterpolation();
    } else if (this.INTERPOLATION_TYPE === I_BSPLINE) {
      this.doBSplineInterpolation();
    }
  }

  configure() {
    const gl = window.gl;
    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    this.camera = new Camera(this.CAMERA_ORBITING_TYPE);
    this.camera.goHome(this.home);
    this.camera.setElevation(-20);
    this.camera.hookRenderer = () => {
      this.draw();
    };

    const canvas = document.getElementById('canvas-element-id');
    this.interactor = new CameraInteractor(this.camera, canvas);

    this.transforms = new SceneTransforms(this.camera);

    const vsCode = require('./glsl/Ex5_5.vs');
    const fsCode = require('./glsl/Ex5_5.fs');
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
    floor.build(80, 2);
    scene.addObject(floor);

    const ball = require('./models/geometry/ball.json');
    ball.alias = 'ball';
    ball.diffuse = [0.5, 0.9, 0.3, 1.0];
    scene.addObject(ball);

    const flag = require('./models/geometry/flag.json');

    const flagInicio = { ...flag };
    flagInicio.alias = 'flagInicio';
    flagInicio.diffuse = [0.1, 0.3, 0.9, 1.0];

    const flagFin = { ...flag };
    flagFin.alias = 'flagFin';
    flagFin.diffuse = [0.9, 0.3, 0.1, 1.0];

    const flagControl1 = { ...flag };
    flagControl1.diffuse = [0.4, 0.4, 0.4, 1.0];
    flagControl1.alias = 'flagControl1';

    const flagControl2 = { ...flag };
    flagControl2.alias = 'flagControl2';
    flagControl2.diffuse = [0.4, 0.4, 0.4, 1.0];

    const flagControl3 = { ...flag };
    flagControl3.alias = 'flagControl3';
    flagControl3.diffuse = [0.4, 0.4, 0.4, 1.0];

    scene.addObject(flagInicio);
    scene.addObject(flagFin);
    scene.addObject(flagControl1);
    scene.addObject(flagControl2);
    scene.addObject(flagControl3);
    this.interpolate();
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

        if (object.alias === 'ball') {
          const ballTransform = transforms.mvMatrix;
          if (this.position[this.sceneTime] !== undefined) {
            mat4.translate(ballTransform, ballTransform, this.position[this.sceneTime]);
          }
        } else if (object.alias === 'flagInicio') {
          const flagInicioTransform = transforms.mvMatrix;
          mat4.translate(flagInicioTransform, flagInicioTransform, CONTROL_POINTS[0]);
        } else if (object.alias === 'flagFin') {
          const flagFinTransform = transforms.mvMatrix;
          mat4.translate(flagFinTransform, flagFinTransform, CONTROL_POINTS[4]);
        } else if (object.alias === 'flagControl1') {
          if (this.INTERPOLATION_TYPE !== I_LINEAR) {
            const flagTransform = transforms.mvMatrix;
            mat4.translate(flagTransform, flagTransform, CONTROL_POINTS[1]);
            if (Util.close(CONTROL_POINTS[1], this.position[this.sceneTime], 3)) {
              object.diffuse = [0.92, 0.92, 0.4, 1.0];
            } else {
              object.diffuse = [0.4, 0.4, 0.4, 1.0];
            }
          } else {
            transforms.pop();
            continue;
          }
        } else if (object.alias === 'flagControl2') {
          if (this.INTERPOLATION_TYPE !== I_LINEAR) {
            const flagTransform = transforms.mvMatrix;
            mat4.translate(flagTransform, flagTransform, CONTROL_POINTS[2]);
            if (Util.close(CONTROL_POINTS[2], this.position[this.sceneTime], 3)) {
              object.diffuse = [0.92, 0.92, 0.4, 1.0];
            } else {
              object.diffuse = [0.4, 0.4, 0.4, 1.0];
            }
          } else {
            transforms.pop();
            continue;
          }
        } else if (object.alias === 'flagControl3') {
          if (this.INTERPOLATION_TYPE !== I_LINEAR) {
            mat4.translate(transforms.mvMatrix, transforms.mvMatrix, CONTROL_POINTS[3]);
            if (Util.close(CONTROL_POINTS[3], this.position[this.sceneTime], 3)) {
              object.diffuse = [0.92, 0.92, 0.4, 1.0];
            } else {
              object.diffuse = [0.4, 0.4, 0.4, 1.0];
            }
          } else {
            transforms.pop();
            continue;
          }
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
      this.CameraType = 1;
      this.updateLightPosition = false;
      this.PerspectiveType = 1;
      this.Interpolation = 0;
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

    const interp = gui.add(controls, 'Interpolation', { linear: 0, Polymial: 1, BSpline: 2 });
    interp.onChange((value) => {
      const type = parseInt(value, 0);
      const position = { ...this.pos[type] };
      this.resetAnimation();
      CONTROL_POINTS = Object.values(position);

      // ISTEPS = steps;
      this.INTERPOLATION_TYPE = type;
      this.interpolate();
      this.draw();
    });
    gui.add(controls, 'updateLightPosition', false).listen().onChange((value) => {
      this.updateLightPosition = value;
      this.draw();
    });
  }

  animate() {
    this.sceneTime += 1;
    if (this.sceneTime === ISTEPS) {
      this.sceneTime = 0;
    }
    this.draw();
  }

  resetAnimation() {
    this.sceneTime = 0;
    this.position.length = 0;
  }

  startAnimation() {
    this.ANIMATION_TIMER = setInterval(this.animate.bind(this), 30 / 1000);
  }

  stopAnimation() {
    clearInterval(this.ANIMATION_TIMER);
  }
}
