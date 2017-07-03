import Util from './lib/Util';
import { mat4 } from './lib/gl-matrix';
import { GUI } from './lib/dat.gui';

export default class Ex3_4 {
  constructor() {
    this.viewWidth = 480;
    this.viewHeight = 400;
    this.angle = 0;
    this.gl = this.getWebGLContext();
    this.initProgram();
    this.initBuffers();
    this.initLights();
    this.change();
    this.render();

  }

  getWebGLContext() {
    const canvas = document.createElement('canvas');
    canvas.width = this.viewWidth;
    canvas.height = this.viewHeight;
    document.body.appendChild(canvas);
    const gl = canvas.getContext('webgl');
    return gl;
  }

  getShader(type, str) {
    const gl = this.gl;
    let shader;
    if (type === 'shader-vs') {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else if (type === 'shader-fs') {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    gl.shaderSource(shader, str);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log(gl.getShaderInfoLog(shader));
    }

    return shader;
  }

  initProgram() {
    const gl = this.gl;
    const program = gl.createProgram();
    const vsShader = this.getShader('shader-vs', require('./glsl/Ex3_3.vs'));
    const fsShader = this.getShader('shader-fs', require('./glsl/Ex3_3.fs'));

    gl.attachShader(program, vsShader);
    gl.attachShader(program, fsShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.log(gl.getProgramInfoLog(program));
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

    let sphereIndicesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    let sphereNormalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    this.vertices = vertices;
    this.normals = normals;
    this.indices = indices;

    this.sphereVertexBuffer = sphereVertexBuffer;
    this.sphereIndicesBuffer = sphereIndicesBuffer;
    this.sphereNormalsBuffer = sphereNormalsBuffer;
  }

  initLights() {
    const gl = this.gl;
    const program = this.program;

    const uLightDirection = gl.getUniformLocation(program, 'uLightDirection');
    const uLightAmbient = gl.getUniformLocation(program, 'uLightAmbient');
    const uLightDiffuse = gl.getUniformLocation(program, 'uLightDiffuse');
    const uLightSpecular = gl.getUniformLocation(program, 'uLightSpecular');

    const uMaterialAmbient = gl.getUniformLocation(program, 'uMaterialAmbient');
    const uMaterialDiffuse = gl.getUniformLocation(program, "uMaterialDiffuse");
    const uMaterialSpecular = gl.getUniformLocation(program, "uMaterialSpecular");

    const uShininess = gl.getUniformLocation(program, 'uShininess');

    gl.uniform3fv(uLightDirection, [0.0, -1.0, -1.0]);
    gl.uniform4fv(uLightAmbient, [0.03, 0.03, 0.03, 1.0]);
    gl.uniform4fv(uLightDiffuse, [1.0, 1.0, 1.0, 1.0]);
    gl.uniform4fv(uLightSpecular, [1.0, 1.0, 1.0, 1.0]);

    gl.uniform4fv(uMaterialAmbient, [1.0, 1.0, 1.0, 1.0]);
    gl.uniform4fv(uMaterialDiffuse, [0.5, 0.8, 0.1, 1.0]);
    gl.uniform4fv(uMaterialSpecular, [1.0, 1.0, 1.0, 1.0]);
    gl.uniform1f(uShininess, 230.0);

    this.uLightDirection = uLightDirection;
    this.uLightAmbient = uLightAmbient;
    this.uLightDiffuse = uLightDiffuse;
    this.uLightSpecular = uLightSpecular;
    this.uMaterialAmbient = uMaterialAmbient;
    this.uMaterialDiffuse = uMaterialDiffuse;
    this.uMaterialSpecular = uMaterialSpecular;
    this.uShininess = uShininess;
  }

  drawScene() {
    const gl = this.gl;
    const program = this.program;

    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clearDepth(100);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0.0, 0.0, this.viewWidth, this.viewHeight);

    let pMatrix = mat4.create();
    let mvMatrix = mat4.create();
    let nMatrix = mat4.create();

    let uPMatrix = gl.getUniformLocation(program, 'uPMatrix');
    let uMVMatrix = gl.getUniformLocation(program, 'uMVMatrix');
    let uNMatrix = gl.getUniformLocation(program, 'uNMatrix');

    mat4.perspective(pMatrix, 45 * (Math.PI / 180), this.viewWidth / this.viewHeight, 0.1, 10000.0);
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, mvMatrix, [0.0, 0.0, -2.0]);
    mat4.rotate(mvMatrix, mvMatrix, (this.angle * Math.PI) / 180, [0, 1, 0]);

    gl.uniformMatrix4fv(uMVMatrix, false, mvMatrix);
    gl.uniformMatrix4fv(uPMatrix, false, pMatrix);

    nMatrix = mat4.clone(mvMatrix);
    mat4.invert(nMatrix, mvMatrix);
    mat4.transpose(nMatrix, nMatrix);

    gl.uniformMatrix4fv(uNMatrix, false, nMatrix);

    const aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    const aVertexNormal = gl.getAttribLocation(program, 'aVertexNormal');

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

    } catch (e) {
      console.log(e);
    } finally {}
  }

  change() {
    let controls = new function () {
      this.lightX = 0.0;
      this.lightY = -1.0;
      this.lightZ = -1.0;
      this.lightAmbient = 0.03;
      this.lightSpecular = 1.0;
      this.materialAmbient = 1.0;
      this.materialSpecular = 1.0;
      this.shininess = 230;
    };
    let gui = new GUI();
    gui.add(controls, 'lightX', -1.0, 1.0);
    gui.add(controls, 'lightY', -1.0, 1.0);
    gui.add(controls, 'lightZ', -1.0, 1.0);
    gui.add(controls, 'lightAmbient', -1.0, 1.0);
    gui.add(controls, 'lightSpecular', -1.0, 1.0);
    gui.add(controls, 'materialAmbient', -1.0, 1.0);
    gui.add(controls, 'materialSpecular', -1.0, 1.0);
    gui.add(controls, 'shininess', 0.0, 230.0);
    this.controls = controls;
  }

  update() {
    let gl = this.gl;
    gl.uniform3fv(this.uLightDirection, [this.controls.lightX, this.controls.lightY, this.controls.lightZ]);
    let lightAmbient = this.controls.lightAmbient;
    gl.uniform4fv(this.uLightAmbient, [lightAmbient, lightAmbient, lightAmbient, 1.0]);
    let lightSpecular = this.controls.lightSpecular;
    gl.uniform4fv(this.uLightSpecular, [lightSpecular, lightSpecular, lightSpecular, 1.0]);
    let materialAmbient = this.controls.materialAmbient;
    gl.uniform4fv(this.uMaterialAmbient, [materialAmbient, materialAmbient, materialAmbient, 1.0]);
    let materialSpecular = this.controls.materialSpecular;
    gl.uniform4fv(this.uMaterialSpecular, [materialSpecular, materialSpecular, materialSpecular, 1.0]);
    gl.uniform1f(this.uShininess, this.controls.shininess);
  }

  animate() {
    const timeNow = +new Date();
    if (this.lastTime) {
      const elapsed = timeNow - this.lastTime;
      this.angle += (90 * elapsed) / 10000.0;
    }
    this.lastTime = timeNow;
  }

  render() {
    requestAnimationFrame(() => {
      this.update();
      this.render();
    });
    this.drawScene();
    this.animate();
  }

}
