import Util from './lib/Util';
import {mat4} from './lib/gl-matrix';

export default class Ex3_2 {
  constructor() {
    this.viewWidth = 480;
    this.viewHeight = 400;
    this.angle = 0;
    this.gl = this.getWebGLContext();
    this.initProgram();
    this.initBuffers();
    this.initLights();
    this.render();
  }

  getWebGLContext() {
    const canvas = document.createElement('canvas');
    canvas.width = this.viewWidth;
    canvas.height = this.viewHeight;
    document.body.appendChild(canvas);
    let gl = canvas.getContext('webgl');
    return gl;
  }

  getShader(type, str) {
    let gl = this.gl;
    let shader;
    if (type == 'shader-vs') {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else if (type == 'shader-fs') {
      shader = gl.createShader(gl.FRAGMENT_SHADER)
    }
    gl.shaderSource(shader, str);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log(gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  initProgram() {
    let gl = this.gl;
    let program = gl.createProgram();
    let vsShader = this.getShader('shader-vs', require('./glsl/Ex3_2.vs'));
    let fsShader = this.getShader('shader-fs', require('./glsl/Ex3_2.fs'));

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
    this.normals = normals;
    this.indices = indices;
  }

  initLights() {
    let gl = this.gl;
    let program = this.program;
    let uLightDirection = gl.getUniformLocation(program, 'uLightDirection');
    let uLightAmbient = gl.getUniformLocation(program, 'uLightAmbient');
    let uLightDiffuse = gl.getUniformLocation(program, 'uLightDiffuse');
    let uMaterialDiffuse = gl.getUniformLocation(program, 'uMaterialDiffuse');

    gl.uniform3f(uLightDirection, 0.0, -1.0, -1.0);
    gl.uniform4f(uLightAmbient, 0.2, 0.2, 0.2, 1.0);
    gl.uniform4f(uLightDiffuse, 0.5, 0.5, 0.5, 1.0);
    gl.uniform4f(uMaterialDiffuse, 0.5, 0.8, 0.1, 1.0);
  }

  drawScene() {
    let gl = this.gl;
    let program = this.program;

    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.clearDepth(100.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.viewport(0, 0, this.viewWidth, this.viewHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let pMatrix = mat4.create();
    let mvMatrix = mat4.create();
    let nMatrix = mat4.create();

    let uMVMatrix = gl.getUniformLocation(program, 'uMVMatrix');
    let uPMatrix = gl.getUniformLocation(program, 'uPMatrix');
    let uNMatrix = gl.getUniformLocation(program, 'uNMatrix');

    mat4.perspective(pMatrix, 45, this.viewWidth / this.viewHeight, 0.1, 10000.0);

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, mvMatrix, [0.0, 0.0, -1.5]);
    mat4.rotate(mvMatrix, mvMatrix, this.angle * Math.PI / 180, [1, 0, 0]);

    gl.uniformMatrix4fv(uPMatrix, false, pMatrix);
    gl.uniformMatrix4fv(uMVMatrix, false, mvMatrix);

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

  animate() {
    let timeNow = +new Date();
    if (this.lastTime) {
      let elapsed = timeNow - this.lastTime;
      this.angle += (90 * elapsed) / 1000.0;
    }
    this.lastTime = timeNow;
  }

  render() {
    requestAnimationFrame(() => {
      this.render();
    });
    this.drawScene();
    this.animate();
  }

}
