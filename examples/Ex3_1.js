import Util from './lib/Util.js';
import {mat4} from './lib/gl-matrix';
import {GUI} from './lib/dat.gui';

export default class Ex3_1 {
  constructor() {
    this.c_width = 480;
    this.c_height = 400;
    const canvas = this.createCanvas(document.body);
    this.gl = canvas.getContext('webgl');
    this.initProgram();
    this.initBuffers();
    this.changeAttri();
    this.initLights();
    this.render();
  }

  createCanvas(container) {
    const canvas = document.createElement('canvas');
    canvas.width = this.c_width;
    canvas.height = this.c_height;
    container.appendChild(canvas);
    return canvas;
  }

  getShader(type, str) {
    let gl = this.gl;
    let shader;
    if (type == 'shader-vs') {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else if (type == 'shader-fs') {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    gl.shaderSource(shader, str);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log(gl.getShaderInfoLog(shader))
    }

    return shader;
  }

  initProgram() {
    let gl = this.gl;
    let program = gl.createProgram();
    let vsShader = this.getShader('shader-vs', require('./glsl/Ex3_1.vs'));
    let fsShader = this.getShader('shader-fs', require('./glsl/Ex3_1.fs'));

    gl.attachShader(program, vsShader);
    gl.attachShader(program, fsShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      let error = gl.getProgramInfoLog(program);
      console.log("Error in program linking:" + error);
      gl.deleteProgram(program);
    }

    gl.useProgram(program);
    this.program = program;
  }

  initBuffers() {
    let sphere = require('./data/sphere.json');
    let vertices = sphere.vertices;
    let indices = sphere.indices;
    let normals = Util.calculateNormals(vertices, indices);

    let gl = this.gl;
    let sphereVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    let sphereNormalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    let sphereIndicesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    this.sphereVertexBuffer = sphereVertexBuffer;
    this.sphereNormalsBuffer = sphereNormalsBuffer;
    this.sphereIndicesBuffer = sphereIndicesBuffer;

    this.vertices = vertices;
    this.indices = indices;
    this.normals = normals;
  }

  initLights() {
    let gl = this.gl;
    let program = this.program;

    let uLightDirection = gl.getUniformLocation(program, 'uLightDirection');
    let uLightDiffuse = gl.getUniformLocation(program, 'uLightDiffuse');
    let uMaterialDiffuse = gl.getUniformLocation(program, 'uMaterialDiffuse');

    gl.uniform3fv(uLightDirection, [0.0, -1.0, -1.0]);
    gl.uniform4fv(uLightDiffuse, [1.0, 1.0, 1.0, 1.0]);
    gl.uniform4fv(uMaterialDiffuse, [0.5, 0.8, 0.1, 1.0]);

    this.uLightDirection = uLightDirection;
    this.uLightDiffuse = uLightDiffuse;
  }

  drawScene() {
    let gl = this.gl;
    let c_width = this.c_width;
    let c_height = this.c_height;

    let mvMatrix = mat4.create();
    let pMatrix = mat4.create();
    let nMatrix = mat4.create();

    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, c_width, c_height);

    mat4.perspective(pMatrix, 45, c_width / c_height, 0.1, 10000.0);

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, mvMatrix, [0.0, 0.0, -1.5]);

    let program = this.program;
    let uMVMatrix = gl.getUniformLocation(program, 'uMVMatrix');
    let uPMatrix = gl.getUniformLocation(program, 'uPMatrix');
    let uNMatrix = gl.getUniformLocation(program, 'uNMatrix');

    gl.uniformMatrix4fv(uMVMatrix, false, mvMatrix);
    gl.uniformMatrix4fv(uPMatrix, false, pMatrix);

    nMatrix = mat4.clone(mvMatrix);
    mat4.invert(nMatrix, mvMatrix);
    mat4.transpose(nMatrix, nMatrix);

    gl.uniformMatrix4fv(uNMatrix, false, nMatrix);

    let aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    let aVertexNormal = gl.getAttribLocation(program, 'aVertexNormal');
    try {
      gl.enableVertexAttribArray(aVertexPosition);
      gl.enableVertexAttribArray(aVertexNormal);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.sphereVertexBuffer);
      gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.sphereNormalsBuffer);
      gl.vertexAttribPointer(aVertexNormal, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.sphereIndicesBuffer);
      gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    } catch (ex) {
      console.log(ex)
    }
  }

  changeAttri() {
    let controls = new function () {
      this.lightX = 0.0;
      this.lightY = -1.0;
      this.lightZ = -1.0;
      this.lightDiffuse = 1.0;
    }
    var gui = new GUI();
    gui.add(controls, 'lightX', -1.0, 1.0);
    gui.add(controls, 'lightY', -1.0, 1.0);
    gui.add(controls, 'lightZ', -1.0, 1.0);
    gui.add(controls, 'lightDiffuse', -1.0, 1.0);

    this.controls = controls;
  }

  updateLight() {
    let gl = this.gl;
    let controls = this.controls;
    gl.uniform3fv(this.uLightDirection, [controls.lightX, controls.lightY, controls.lightZ]);
    gl.uniform4fv(this.uLightDiffuse, [controls.lightDiffuse, controls.lightDiffuse, controls.lightDiffuse, 1.0])
  }

  render() {
    requestAnimationFrame(() => {
      this.render()
    });
    this.updateLight();
    this.drawScene();
  }
}
