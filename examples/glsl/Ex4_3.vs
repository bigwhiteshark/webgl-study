attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec4 aVertexColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform bool uUpdateLight;
uniform vec3 uLightPosition;
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;
uniform vec4 uMaterialDiffuse;
uniform bool uWireframe;
uniform bool uPerVertexColor;

varying vec4 vFinalColor;

void main(void) {
  if (uWireframe) {
    if (uPerVertexColor) {
      vFinalColor = aVertexColor;
    } else {
      vFinalColor = uMaterialDiffuse;
    }
  } else {
    vec3 N = vec3(uNMatrix * vec4(aVertexNormal, 1.0));
    vec3 L = normalize(-uLightPosition);
    if (uUpdateLight) {
      L = vec3(uNMatrix * vec4(L, 0.0));
    }

    float lambertTerm = dot(N, -L);
    if (lambertTerm < 0.0) {
      lambertTerm = 0.01;
    }
    vec4 Ia = uLightAmbient;
    vec4 Id = uMaterialDiffuse * uLightDiffuse * lambertTerm;
    vFinalColor = Ia + Id;
    vFinalColor.a = 1.0;
  }
  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
