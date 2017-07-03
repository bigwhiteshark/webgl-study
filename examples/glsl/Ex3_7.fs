#ifdef GL_ES
precision highp float;
#endif

uniform vec3 uLightAmbient;

uniform vec3 uMaterialDiffuse;
uniform vec3 uMaterialSpecular;
uniform float uShininess;

varying vec3 vNormal;
varying vec3 vLightRay;
varying vec3 vEyeVec;

void main(void) {
  vec3 L = normalize(vLightRay);
  vec3 N = normalize(vNormal);

  float lambertItem = dot(N, -L);

  vec3 finalColor = uLightAmbient;

  if (lambertItem > 0.0) {
    finalColor += uMaterialDiffuse * lambertItem;

    vec3 E = normalize(vEyeVec);
    vec3 R = reflect(L, N);

    float specular = pow(max(dot(R, E), 0.0), uShininess);
    finalColor = uMaterialSpecular * specular;
  }

  gl_FragColor = vec4(finalColor, 1.0);
}
