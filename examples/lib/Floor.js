export default class Floor {
  constructor() {
    this.alias = 'floor';
    this.wireframe = true;
    this.dim = 50;
    this.lines = 50;
    this.verticesertices = [];
    this.indices = [];
    this.diffuse = [0.7, 0.7, 0.7, 1.0];
  }

  build(d, e) {
    if (d) {
      this.dim = d;
    }
    if (e) {
      this.lines = 2 * this.dim / e;
    }

    const inc = 2 * this.dim / this.lines;

    const vertices = [];
    const indices = [];

    for (let l = 0; l <= this.lines; l++) {
      vertices[6 * l] = -this.dim;
      vertices[6 * l + 1] = 0;
      vertices[6 * l + 2] = -this.dim + (l * inc);

      vertices[6 * l + 3] = this.dim;
      vertices[6 * l + 4] = 0;
      vertices[6 * l + 5] = -this.dim + (l * inc);

      vertices[6 * (this.lines + 1) + 6 * l] = -this.dim + (l * inc);
      vertices[6 * (this.lines + 1) + 6 * l + 1] = 0;
      vertices[6 * (this.lines + 1) + 6 * l + 2] = -this.dim;

      vertices[6 * (this.lines + 1) + 6 * l + 3] = -this.dim + (l * inc);
      vertices[6 * (this.lines + 1) + 6 * l + 4] = 0;
      vertices[6 * (this.lines + 1) + 6 * l + 5] = this.dim;

      indices[2 * l] = 2 * l;
      indices[2 * l + 1] = 2 * l + 1;
      indices[2 * (this.lines + 1) + 2 * l] = 2 * (this.lines + 1) + 2 * l;
      indices[2 * (this.lines + 1) + 2 * l + 1] = 2 * (this.lines + 1) + 2 * l + 1;
    }

    this.vertices = vertices;
    this.indices = indices;
  }
}
