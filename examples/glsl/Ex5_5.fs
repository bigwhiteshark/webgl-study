#ifdef GL_ES
precision highp float;
#endif
uniform bool uWireframe;
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;
uniform vec4 uLightSpecular;
uniform vec4 uMaterialAmbient;
uniform vec4 uMaterialDiffuse;
uniform vec4 uMaterialSpecular;
uniform float uShininess;

varying vec3 vNormal;
varying vec3 vLightRay;
varying vec3 vEyeVec;
varying vec4 vFinalColor;

void main(void) {
  if (uWireframe) {
    gl_FragColor = vFinalColor;
  } else {
    vec3 L = normalize(vLightRay);
    vec3 N = normalize(vNormal);

    float lambertTerm = dot(N, -L);

    vec4 Ia = uLightAmbient * uMaterialAmbient;

    vec4 Id = vec4(0.0, 0.0, 0.0, 1.0);

    vec4 Is = vec4(0.0, 0.0, 0.0, 1.0);

    if (lambertTerm > 0.0) {
      Id = uLightDiffuse * uMaterialDiffuse * lambertTerm;
      vec3 E = normalize(vEyeVec);
      vec3 R = reflect(L, N);
      float specular = pow(max(dot(R, E), 0.0), uShininess);
      Is = uLightSpecular * uMaterialSpecular * specular;
    }

    vec4 finalColor = Ia + Id + Is;
    finalColor.a = 1.0;
    gl_FragColor = finalColor;
  }
}
