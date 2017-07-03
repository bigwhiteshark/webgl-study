import Util from './lib/Util';
import { mat4 } from './lib/gl-matrix';
//import './lib/gl-matrix-min';

export default class Ex3_6 {
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
    const vsShader = this.getShader('shader-vs', require('./glsl/Ex3_6.vs'));
    const fsShader = this.getShader('shader-fs', require('./glsl/Ex3_6.fs'));
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
    const uLightDiffuse = gl.getUniformLocation(program, 'uLightDiffuse');
    const uLightSpecular = gl.getUniformLocation(program, 'uLightSpecular');

    const uMaterialAmbient = gl.getUniformLocation(program, 'uMaterialAmbient');
    const uMaterialDiffuse = gl.getUniformLocation(program, 'uMaterialDiffuse');
    const uMaterialSpecular = gl.getUniformLocation(program, 'uMaterialSpecular');
    const uShininess = gl.getUniformLocation(program, 'uShininess');

    // Light uniforms
    gl.uniform3fv(uLightPosition, [4.5, 3.0, 15.0]);
    gl.uniform4fv(uLightAmbient, [1.0, 1.0, 1.0, 1.0]);
    gl.uniform4fv(uLightDiffuse, [1.0, 1.0, 1.0, 1.0]);
    gl.uniform4fv(uLightSpecular, [1.0, 1.0, 1.0, 1.0]);

    // Object Uniforms
    gl.uniform4fv(uMaterialAmbient, [0.1, 0.1, 0.1, 1.0]);
    gl.uniform4fv(uMaterialDiffuse, [0.5, 0.8, 0.1, 1.0]);
    gl.uniform4fv(uMaterialSpecular, [0.6, 0.6, 0.6, 1.0]);
    gl.uniform1f(uShininess, 200.0);

    this.uniform = {
      uLightPosition,
      uLightAmbient,
      uLightDiffuse,
      uLightSpecular,
      uMaterialAmbient,
      uMaterialDiffuse,
      uMaterialSpecular,
      uShininess
    };

  }

  handleLoadedObject(filename, object) {
    console.info(`${filename} has been retrieved from the server`);
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
    const plane = require('./models/geometry/plane.json');
    const cone = require('./models/geometry/cone.json');
    const sphere = require('./models/geometry/sphere.json');
    const smallsph = require('./models/geometry/smallsph.json');

    this.handleLoadedObject('plane', plane);
    this.handleLoadedObject('cone', cone);
    this.handleLoadedObject('sphere', sphere);

    smallsph.alias = 'lightsource';
    this.handleLoadedObject('smallsph', smallsph);

    this.plane = plane;
    this.cone = cone;
    this.sphere = sphere;
    this.smallsph = smallsph;
  }

  drawScene() {
    const gl = this.gl;
    const program = this.program;
    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.clearDepth(100.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.viewport(0, 0, this.viewWidth, this.viewHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const pMatrix = mat4.create();
    const mvMatrix = mat4.create();
    let nMatrix = mat4.create();

    mat4.perspective(pMatrix, 30 * (Math.PI / 180), this.viewWidth / this.viewHeight, 0.1, 1000.0);
    //mat4.perspective(30, this.viewWidth / this.viewHeight, 0.1, 1000.0, pMatrix);

    const aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    const aVertexNormal = gl.getAttribLocation(program, 'aVertexNormal');


    const uMVMatrix = gl.getUniformLocation(program, 'uMVMatrix');
    const uPMatrix = gl.getUniformLocation(program, 'uPMatrix');
    const uNMatrix = gl.getUniformLocation(program, 'uNMatrix');

    try {
      gl.enableVertexAttribArray(aVertexPosition);
      gl.enableVertexAttribArray(aVertexNormal);
      for (let i = 0; i < this.objects.length; i += 1) {
        const object = this.objects[i];
        mat4.identity(mvMatrix);
        mat4.translate(mvMatrix, mvMatrix, [0.0, 0.0, -40.0]);
        mat4.rotate(mvMatrix, mvMatrix, 30 * (Math.PI / 180), [1, 0, 0]);
        mat4.rotate(mvMatrix, mvMatrix, this.angle * (Math.PI / 180), [0, 1, 0]);
        if (object.alias === 'lightsource') {
          const lightPos = gl.getUniform(program, this.uniform.uLightPosition);
          mat4.translate(mvMatrix, mvMatrix, lightPos);
        }

        console.log(pMatrix);

        gl.uniformMatrix4fv(uMVMatrix, false, mvMatrix);
        gl.uniformMatrix4fv(uPMatrix, false, pMatrix);
        nMatrix = mat4.clone(mvMatrix);
        mat4.invert(nMatrix, nMatrix);
        mat4.transpose(nMatrix, nMatrix);

        /*  mat4.identity(mvMatrix);
          mat4.translate(mvMatrix, [0.0, 0.0, -40]); //Sets the camera to a reasonable distance to view the part
          mat4.rotate(mvMatrix, 30 * Math.PI / 180, [1, 0, 0]);
          mat4.rotate(mvMatrix, this.angle * Math.PI / 180, [0, 1, 0]);
          if (object.alias == 'lightsource') {
            const lightPos = gl.getUniform(program, this.uniform.uLightPosition);
            mat4.translate(mvMatrix, lightPos);
          }

          console.log(pMatrix)
          gl.uniformMatrix4fv(uMVMatrix, false, mvMatrix);
          gl.uniformMatrix4fv(uPMatrix, false, pMatrix);
          mat4.set(mvMatrix, nMatrix);
          mat4.inverse(nMatrix);
          mat4.transpose(nMatrix);*/

        gl.uniformMatrix4fv(uNMatrix, false, nMatrix);
        gl.uniform4fv(this.uniform.uMaterialAmbient, object.ambient);
        gl.uniform4fv(this.uniform.uMaterialDiffuse, object.diffuse);
        gl.uniform4fv(this.uniform.uMaterialSpecular, object.specular);

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
