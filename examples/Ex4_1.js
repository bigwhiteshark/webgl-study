import { mat4, vec3 } from './lib/gl-matrix';
import Util from './lib/Util';
import Scene from './lib/Scene';
import Program from './lib/Program';
import Floor from './lib/Floor';
import Axis from './lib/Axis';
import { GUI } from './lib/dat.gui';

export default class Ex4_1 {
  constructor() {
    this.viewWidth = 1200;
    this.viewHeight = 400;
    this.scene = new Scene(this.viewWidth, this.viewHeight);

    this.mvMatrix = mat4.create();
    this.pMatrix = mat4.create();
    this.nMatrix = mat4.create();
    this.cMatrix = mat4.create();

    this.home = [0, -2, -50];
    this.position = [0, -2, -50];
    this.rotation = [0, 0, 0];

    this.COORDS_WORLD = 1;
    this.COORDS_CAMERA = 2;
    this.coords = 1;

    this.load();
    this.initTransforms();
    this.draw();
    this.change();
  }

  initTransforms() {
    const mvMatrix = this.mvMatrix;
    const pMatrix = this.pMatrix;
    let nMatrix = this.nMatrix;
    const cMatrix = this.cMatrix;

    mat4.perspective(pMatrix, 30 * (Math.PI / 180), this.viewWidth / this.viewHeight, 0.1, 10000);
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, mvMatrix, this.home);
    Util.displayMatrix(mvMatrix);

    mat4.identity(cMatrix);
    mat4.invert(cMatrix, mvMatrix);
    mat4.identity(nMatrix);
    nMatrix = mat4.clone(mvMatrix);
    mat4.invert(nMatrix, mvMatrix);
    mat4.transpose(nMatrix, nMatrix);

    this.coords = this.COORDS_WORLD;
  }

  updateTransforms() {
    const mvMatrix = this.mvMatrix;
    const cMatrix = this.cMatrix;
    if (this.coords === this.COORDS_WORLD) {
      mat4.identity(mvMatrix);
      mat4.translate(mvMatrix, mvMatrix, this.position);
    } else {
      mat4.identity(cMatrix);
      mat4.translate(cMatrix, cMatrix, this.position);
    }
  }

  setMatrixUniforms() {
    const program = window.program;
    const gl = window.gl;
    if (this.coords === this.COORDS_WORLD) {
      mat4.invert(this.cMatrix, this.mvMatrix);
      Util.displayMatrix(this.mvMatrix);
      gl.uniformMatrix4fv(program.uMVMatrix, false, this.mvMatrix);
    } else {
      mat4.invert(this.mvMatrix, this.cMatrix);
      Util.displayMatrix(this.cMatrix);
    }
    gl.uniformMatrix4fv(program.uPMatrix, false, this.pMatrix);
    gl.uniformMatrix4fv(program.uMVMatrix, false, this.mvMatrix);
    mat4.transpose(this.nMatrix, this.cMatrix);
    gl.uniformMatrix4fv(program.uNMatrix, false, this.nMatrix);
  }

  change() {
    const controls = new function () {
      this.x = 0;
      this.y = -2;
      this.z = -50;
      this.coordType = 1;
    };

    const gui = new GUI({ autoPlace: false });
    const customContainer = document.getElementById('my-gui-container');
    customContainer.appendChild(gui.domElement);
    const typeControl = gui.add(controls, 'coordType', { World: 1, Camera: 2 });
    gui.add(controls, 'x', -50, 50).listen().onChange((value) => {
      this.position[0] = parseFloat(value);
      this.draw();
    });
    gui.add(controls, 'y', -50, 50).listen().onChange((value) => {
      this.position[1] = parseFloat(value);
      this.draw();
    });
    gui.add(controls, 'z', -50, 50).listen().onChange((value) => {
      this.position[2] = parseFloat(value);
      this.draw();
    });

    typeControl.onChange((value) => {
      if (parseInt(value, 0) === this.COORDS_WORLD) {
        vec3.copy(this.position, this.home);
      } else {
        vec3.copy(this.position, this.home);
        vec3.negate(this.position, this.position);
      }
      controls.x = this.position[0];
      controls.y = this.position[1];
      controls.z = this.position[2];
      this.coords = parseInt(value, 0);
      this.draw();
    });


    this.controls = controls;
  }

  load() {
    const vsCode = require('./glsl/Ex4_1.vs');
    const fsCode = require('./glsl/Ex4_1.fs');
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
