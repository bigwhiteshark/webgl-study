import Util from '../lib/Util';
import WebGLApp from './WebGLApp';

export default class scene extends WebGLApp {
  constructor(width, height) {
    super(width, height);
    this.objects = [];
  }

  getObject(alias) {
    for (let i = 0; i < this.objects.length; i += 1) {
      const object = this.objects[i];
      if (alias === object.alias) {
        return object;
      }
    }
    return null;
  }

  addObject(object, attributes) {
    const obj = object;
    const gl = window.gl;
    obj.perVertexColor = !!obj.perVertexColor;
    obj.wireframe = !!obj.wireframe;
    !obj.diffuse && (obj.diffuse = [1.0, 1.0, 1.0, 1.0]);
    !obj.ambient && (obj.ambient = [0.1, 0.1, 0.1, 1.0]);
    !obj.specular && (obj.specular = [1.0, 1.0, 1.0, 1.0]);

    for (const k in attributes) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        obj[k] = attributes[k];
      }
    }

    const vertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertices), gl.STATIC_DRAW);

    const normalBufferObject = gl.createBuffer();
    const normals = Util.calculateNormals(obj.vertices, obj.indices);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const indexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(obj.indices), gl.STATIC_DRAW);

    if (obj.perVertexColor) {
      const colorBufferObject = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferObject);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.colors), gl.STATIC_DRAW);
      obj.cbo = colorBufferObject;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    obj.vbo = vertexBufferObject;
    obj.nbo = normalBufferObject;
    obj.ibo = indexBufferObject;

    this.objects.push(obj);
  }
}
