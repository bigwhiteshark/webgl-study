import Util from './lib/Util';
import { mat4 } from './lib/gl-matrix';

export default class Ex3_5 {
  constructor() {
    this.viewWidth = 480;
    this.viewHeight = 400;
    this.initWebGLContext();
    this.initProgram();
    this.initLights();
    this.initBuffers();
    this.initEvents();
    this.render();
  }

  initWebGLContext() {
    const canvas = document.createElement('canvas');
    canvas.width = this.viewWidth;
    canvas.height = this.viewHeight;
    document.body.appendChild(canvas);
    const gl = canvas.getContext('webgl');
    this.gl = gl;
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
    const vsShader = this.getShader('shader-vs', require('./glsl/Ex3_5.vs'));
    const fsShader = this.getShader('shader-fs', require('./glsl/Ex3_5.fs'));
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
    const uLightDirection = gl.getUniformLocation(program, 'uLightDirection');
    const uLightAmbient = gl.getUniformLocation(program, 'uLightAmbient');
    const uLightDiffuse = gl.getUniformLocation(program, 'uLightDiffuse');
    const uMaterialDiffuse = gl.getUniformLocation(program, 'uMaterialDiffuse');

    gl.uniform3fv(uLightDirection, [0.0, 0.0, -1.0]);
    gl.uniform4fv(uLightAmbient, [0.1, 0.1, 0.1, 1.0]);
    gl.uniform4fv(uLightDiffuse, [0.6, 0.6, 0.6, 1.0]);
    gl.uniform4fv(uMaterialDiffuse, [0.6, 0.15, 0.15, 1.0]);

    this.uLightDirection = uLightDirection;
    this.uLightAmbient = uLightAmbient;
    this.uLightDiffuse = uLightDiffuse;
    this.uMaterialDiffuse = uMaterialDiffuse;
  }

  initBuffers() {
    const gl = this.gl;
    const vertices = [-20.0, -7.0, 20.0, // 0
      -10.0, -7.0, 0.0, // 1
      10.0, -7.0, 0.0, // 2
      20.0, -7.0, 20.0, // 3

      -20.0, 7.0, 20.0, // 4
      -10.0, 7.0, 0.0, // 5
      10.0, 7.0, 0.0, // 6
      20.0, 7.0, 20.0 // 7
    ];
    const indices = [
      0, 5, 4,
      1, 5, 0,
      1, 6, 5,
      2, 6, 1,
      2, 7, 6,
      3, 7, 2
    ];
    const normals = Util.calculateNormals(vertices, indices);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const indicesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    this.vertexBuffer = vertexBuffer;
    this.normalsBuffer = normalsBuffer;
    this.indicesBuffer = indicesBuffer;
    this.vertices = vertices;
    this.indices = indices;
  }

  drawScene() {
    const gl = this.gl;
    const program = this.program;

    gl.clearColor(0.12, 0.12, 0.12, 1.0);
    gl.clearDepth(100.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.viewport(0, 0, this.viewWidth, this.viewHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const pMatrix = mat4.create();
    const mvMatrix = mat4.create();
    let nMatrix = mat4.create();

    mat4.perspective(pMatrix, 45 * (Math.PI / 180), this.viewWidth / this.viewHeight, 0.1, 10000.0);
    mat4.translate(mvMatrix, mvMatrix, [0.0, 0.0, -40]);

    const uPMatrix = gl.getUniformLocation(program, 'uPMatrix');
    const uMVMatrix = gl.getUniformLocation(program, 'uMVMatrix');
    const uNMatrix = gl.getUniformLocation(program, 'uNMatrix');

    gl.uniformMatrix4fv(uPMatrix, false, pMatrix);
    gl.uniformMatrix4fv(uMVMatrix, false, mvMatrix);

    nMatrix = mat4.clone(mvMatrix);
    mat4.invert(nMatrix, nMatrix);
    mat4.transpose(nMatrix, nMatrix);
    gl.uniformMatrix4fv(uNMatrix, false, nMatrix);

    const aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    const aVertexNormal = gl.getAttribLocation(program, 'aVertexNormal');

    try {
      gl.enableVertexAttribArray(aVertexPosition);
      gl.enableVertexAttribArray(aVertexNormal);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
      gl.vertexAttribPointer(aVertexNormal, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
      gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    } catch (ex) {
      console.log(ex);
    }
  }

  initEvents() {
    const gl = this.gl;
    const program = this.program;
    let azimuth = 0;
    let elevation = 0;
    document.onkeydown = (ev) => {
      const incrAzimuth = 10;
      const incrElevation = 10;
      console.log(ev.keyCode);
      switch (ev.keyCode) {
        case 37:
          azimuth -= incrAzimuth;
          break;
        case 38:
          elevation += incrElevation;
          break;
        case 39:
          azimuth += incrAzimuth;
          break;
        case 40:
          elevation -= incrElevation;
          break;
        default:
      }
      azimuth %= 360;
      elevation %= 360;
      const theta = elevation * (Math.PI / 180);
      const phi = azimuth * (Math.PI / 180);
      const lightDirection = gl.getUniform(program, this.uLightDirection);
      lightDirection[0] = Math.cos(theta) * Math.sin(phi);
      lightDirection[1] = Math.sin(theta);
      lightDirection[2] = Math.cos(theta) * -Math.cos(phi);
      gl.uniform3fv(this.uLightDirection, lightDirection);
    };
  }

  render() {
    requestAnimationFrame(() => {
      this.render();
    });
    this.drawScene();
  }

}
