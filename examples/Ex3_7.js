import Util from './lib/Util';
import { mat4 } from './lib/gl-matrix';
// import './lib/gl-matrix-min';

export default class Ex3_7 {
  constructor() {
    this.viewWidth = 1400;
    this.viewHeight = 400;
    this.angle = 0;
    this.objects = [];
    this.uniform = {};
    this.attribute = {};
    this.initWebGL();
    this.initProgram();
    this.initLights();
    this.initBuffers();
    this.render();
  }

  initWebGL() {
    const canvas = document.createElement('canvas');
    canvas.width = this.viewWidth;
    canvas.height = this.viewHeight;
    document.body.appendChild(canvas);
    this.gl = canvas.getContext('webgl');
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
    const vsShader = this.getShader('shader-vs', require('./glsl/Ex3_7.vs'));
    const fsShader = this.getShader('shader-fs', require('./glsl/Ex3_7.fs'));
    const program = gl.createProgram();

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

  initLights() {
    const gl = this.gl;
    const program = this.program;

    const uLightPosition = gl.getUniformLocation(program, 'uLightPosition');
    const uLightAmbient = gl.getUniformLocation(program, 'uLightAmbient');

    const uMaterialDiffuse = gl.getUniformLocation(program, 'uMaterialDiffuse');
    const uMaterialSpecular = gl.getUniformLocation(program, 'uMaterialSpecular');
    const uShininess = gl.getUniformLocation(program, 'uShininess');

    // Light uniforms
    gl.uniform3fv(uLightPosition, [31000, 14000, 24000]);
    gl.uniform3fv(uLightAmbient, [0.1, 0.1, 0.1]);

    gl.uniform3fv(uMaterialDiffuse, [1.0, 0.0, 0.0]);
    gl.uniform3fv(uMaterialSpecular, [0.5, 0.5, 0.5]);

    gl.uniform1f(uShininess, 24.0);

    this.uniform = {
      uLightPosition,
      uLightAmbient,
      uMaterialDiffuse,
      uMaterialSpecular,
      uShininess
    };

  }

  handleLoadedObject(object) {
    const obj = object;
    const gl = this.gl;
    const vertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertices), gl.STATIC_DRAW);

    const normals = Util.calculateNormals(obj.vertices, object.indices);
    const normalBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const indexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.indices), gl.STATIC_DRAW);

    obj.vbo = vertexBufferObject;
    obj.ibo = indexBufferObject;
    obj.nbo = normalBufferObject;

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    this.objects.push(obj);
  }

  initBuffers() {

    for (let i = 1; i < 179; i += 1) {
      const part = require(`./models/nissan_gts/pr${i}.json`);
      this.handleLoadedObject(part);
    }
  }

  drawScene() {
    const gl = this.gl;
    const program = this.program;
    gl.clearColor(0, 0, 0, 1.0);
    gl.clearDepth(100.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.viewport(0, 0, this.viewWidth, this.viewHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const pMatrix = mat4.create();
    const mvMatrix = mat4.create();
    let nMatrix = mat4.create();


    const uMVMatrix = gl.getUniformLocation(program, 'uMVMatrix');
    const uPMatrix = gl.getUniformLocation(program, 'uPMatrix');
    const uNMatrix = gl.getUniformLocation(program, 'uNMatrix');

    mat4.perspective(pMatrix, 45 * (Math.PI / 180), this.viewWidth / this.viewHeight, 100, 10000.0);

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, mvMatrix, [0.0, -200, -2000]);
    mat4.rotate(mvMatrix, mvMatrix, 17 * (Math.PI / 180), [1, 0, 0]);
    mat4.rotate(mvMatrix, mvMatrix, this.angle * (Math.PI / 180), [0, 1, 0]);

    gl.uniformMatrix4fv(uMVMatrix, false, mvMatrix);
    gl.uniformMatrix4fv(uPMatrix, false, pMatrix);

    nMatrix = mat4.clone(mvMatrix);
    mat4.invert(nMatrix, nMatrix);
    mat4.transpose(nMatrix, nMatrix);
    gl.uniformMatrix4fv(uNMatrix, false, nMatrix);

    const aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    const aVertexNormal = gl.getAttribLocation(program, 'aVertexNormal');
    try {
      for (let i = 0; i < this.objects.length; i += 1) {
        const object = this.objects[i];
        gl.bindBuffer(gl.ARRAY_BUFFER, object.vbo);
        gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aVertexPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, object.nbo);
        gl.vertexAttribPointer(aVertexNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aVertexNormal);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.ibo);
        gl.drawElements(gl.TRIANGLES, object.indices.length, gl.UNSIGNED_SHORT, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      }
    } catch (ex) {
      console.log(ex);
    }
  }

  render() {
    /*requestAnimationFrame(() => {
      this.render();
    });*/
    this.drawScene();
  }

}
