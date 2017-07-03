  attribute vec3 aVertexPosition;
  attribute vec3 aVertexNormal;

  uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;
  uniform mat4 uNMatrix;

  uniform float uShininess;
  uniform vec3 uLightDirection;

  uniform vec4 uLightAmbient;
  uniform vec4 uLightDiffuse;
  uniform vec4 uLightSpecular;

  uniform vec4 uMaterialAmbient;
  uniform vec4 uMaterialDiffuse;
  uniform vec4 uMaterialSpecular;

  varying vec4 vFinalColor;

  void main(void){
    vec4 vertex = uMVMatrix * vec4(aVertexPosition,1.0);
    vec3 N = vec3(uNMatrix * vec4(aVertexNormal,1.0));
    vec3 L = normalize(uLightDirection);

    float lamberTerm = dot(N,-L);
    vec4 Ia = uLightAmbient * uMaterialAmbient;
    vec4 Id = vec4(0.0,0.0,0.0,1.0);
    vec4 Is = vec4(0.0,0.0,0.0,1.0);
    if(lamberTerm > 0.0){
      Id = uLightDiffuse * uMaterialDiffuse * lamberTerm;

      vec3 eyeVec = -vec3(vertex.xyz);
      vec3 E = normalize(eyeVec);
      vec3 R = reflect(L, N);
      float specular = pow(max(dot(R,E), 0.0), uShininess);

      Is = uLightSpecular * uMaterialSpecular * specular;
    }

    vFinalColor = Ia + Id + Is;
    vFinalColor.a = 1.0;

    gl_Position = uPMatrix * vertex;
  }
