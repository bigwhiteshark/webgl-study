export default class Program {
  static getShader(type, str) {
    const gl = window.gl;
    let shader;
    if (type === 'shader-vs') {
      shader = gl.createShader(gl.VERTEX_SHADER);
    }
    if (type === 'shader-fs') {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    gl.shaderSource(shader, str);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log(gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  static load(vsCode, fsCode) {
    const gl = window.gl;
    const vsShader = Program.getShader('shader-vs', vsCode);
    const fsShader = Program.getShader('shader-fs', fsCode);
    const program = gl.createProgram();
    gl.attachShader(program, vsShader);
    gl.attachShader(program, fsShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.log(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);
    program.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    program.aVertexNormal = gl.getAttribLocation(program, 'aVertexNormal');
    program.aVertexColor = gl.getAttribLocation(program, 'aVertexColor');

    program.uMVMatrix = gl.getUniformLocation(program, 'uMVMatrix');
    program.uPMatrix = gl.getUniformLocation(program, 'uPMatrix');
    program.uNMatrix = gl.getUniformLocation(program, 'uNMatrix');

    program.uMaterialDiffuse = gl.getUniformLocation(program, "uMaterialDiffuse");
    program.uMaterialAmbient = gl.getUniformLocation(program, "uMaterialAmbient");
    program.uMaterialSpecular = gl.getUniformLocation(program, "uMaterialSpecular");
    program.uLightAmbient = gl.getUniformLocation(program, "uLightAmbient");
    program.uLightDiffuse = gl.getUniformLocation(program, "uLightDiffuse");
    program.uLightSpecular = gl.getUniformLocation(program, "uLightSpecular");
    program.uLightPosition = gl.getUniformLocation(program, "uLightPosition");
    program.uShininess = gl.getUniformLocation(program, "uShininess");
    program.uUpdateLight = gl.getUniformLocation(program, "uUpdateLight");
    program.uWireframe = gl.getUniformLocation(program, "uWireframe");
    program.uPerVertexColor = gl.getUniformLocation(program, "uPerVertexColor");


    /*  gl.uniform4fv(program.uLightAmbient, [0.1, 0.1, 0.1, 1.0]);
      gl.uniform4fv(program.uLightDiffuse, [0.7, 0.7, 0.7, 1.0]);
      gl.uniform3fv(program.uLightPosition, [0, 0, 100]);*/
    /*    gl.uniform3fv(program.uLightPosition, [0, 120, 120]);
        gl.uniform4fv(program.uLightAmbient, [0.20, 0.20, 0.20, 1.0]);
        gl.uniform4fv(program.uLightDiffuse, [1.0, 1.0, 1.0, 1.0]);*/

    window.program = program;
  }

}
