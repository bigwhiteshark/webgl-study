export default class Axis {
  constructor() {
    this.alias = 'axis';
    this.dim = 10;
    this.vertices = [

      -10, 0.0, 0.0,
      10, 0.0, 0.0,
      0.0, -10 / 2, 0.0,
      0.0, 10 / 2, 0.0,
      0.0, 0.0, -10,
      0.0, 0.0, 10

    ];
    this.indices = [0, 1, 2, 3, 4, 5];
    this.colors = [

      1, 1, 0,
      1, 1, 1,
      0, 1, 0,
      1, 0, 1,
      0, 1, 0,
      1, 0, 0,
      1, 1, 0,
      0, 1, 1

    ];
    this.wireframe = true;
    this.perVertexColor = true;
  }

  build(d) {
    if (d) {
      this.dim = d;
    }
    this.vertices = [

      -d, 0.0, 0.0,
      d, 0.0, 0.0,
      0.0, -d / 2, 0.0,
      0.0, d / 2, 0.0,
      0.0, 0.0, -d,
      0.0, 0.0, d

    ];
  }
}
