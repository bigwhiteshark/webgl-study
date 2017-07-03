attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform vec3 uLightDirection;
uniform vec4 uLightDiffuse;
uniform vec4 uMaterialDiffuse;

varying vec4 vFinalColor;

void main(void){
    vec3 N = normalize(vec3(uNMatrix * vec4(aVertexNormal,1.0)));
    vec3 L = normalize(uLightDirection);

    float lambertTrem = dot(N, -L);

    vec4 Id = uMaterialDiffuse * uLightDiffuse * lambertTrem;
    vFinalColor = Id;
    vFinalColor.a = 1.0;

    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition,1.0);
}
