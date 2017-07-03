class Util {
  static calculateNormals(vs, ind) {
    const x = 0;
    const y = 1;
    const z = 2;

    const ns = [];

    // for each vertex, initialize normal x, normal y, normal z
    for (let i = 0; i < vs.length; i++) {
      ns[i] = 0.0;
    }
    // we work on triads of vertices to calculate normals so i = i+3 (i = indices index)
    for (let i = 0; i < ind.length; i += 3) {
      const v1 = [];
      const v2 = [];
      const normal = [];
      // p1 - p0
      v1[x] = vs[3 * ind[i + 1] + x] - vs[3 * ind[i] + x];
      v1[y] = vs[3 * ind[i + 1] + y] - vs[3 * ind[i] + y];
      v1[z] = vs[3 * ind[i + 1] + z] - vs[3 * ind[i] + z];
      // p0 - p1
      v2[x] = vs[3 * ind[i + 2] + x] - vs[3 * ind[i + 1] + x];
      v2[y] = vs[3 * ind[i + 2] + y] - vs[3 * ind[i + 1] + y];
      v2[z] = vs[3 * ind[i + 2] + z] - vs[3 * ind[i + 1] + z];
      // p2 - p1
      // v1[x] = vs[3*ind[i+2]+x] - vs[3*ind[i+1]+x];
      // v1[y] = vs[3*ind[i+2]+y] - vs[3*ind[i+1]+y];
      // v1[z] = vs[3*ind[i+2]+z] - vs[3*ind[i+1]+z];
      // p0 - p1
      // v2[x] = vs[3*ind[i]+x] - vs[3*ind[i+1]+x];
      // v2[y] = vs[3*ind[i]+y] - vs[3*ind[i+1]+y];
      // v2[z] = vs[3*ind[i]+z] - vs[3*ind[i+1]+z];
      // cross product by Sarrus Rule
      normal[x] = v1[y] * v2[z] - v1[z] * v2[y];
      normal[y] = v1[z] * v2[x] - v1[x] * v2[z];
      normal[z] = v1[x] * v2[y] - v1[y] * v2[x];

      // ns[3*ind[i]+x] += normal[x];
      // ns[3*ind[i]+y] += normal[y];
      // ns[3*ind[i]+z] += normal[z];
      // update the normals of that triangle: sum of vectors
      for (let j = 0; j < 3; j++) {
        ns[3 * ind[i + j] + x] = ns[3 * ind[i + j] + x] + normal[x];
        ns[3 * ind[i + j] + y] = ns[3 * ind[i + j] + y] + normal[y];
        ns[3 * ind[i + j] + z] = ns[3 * ind[i + j] + z] + normal[z];
      }
    }
    // normalize the result
    // the increment here is because each vertex occurs with an offset of 3 in the array (due to x, y, z contiguous values)
    for (let i = 0; i < vs.length; i += 3) {

      const nn = [];
      nn[x] = ns[i + x];
      nn[y] = ns[i + y];
      nn[z] = ns[i + z];

      let len = Math.sqrt((nn[x] * nn[x]) + (nn[y] * nn[y]) + (nn[z] * nn[z]));
      if (len === 0) len = 0.00001;

      nn[x] = nn[x] / len;
      nn[y] = nn[y] / len;
      nn[z] = nn[z] / len;

      ns[i + x] = nn[x];
      ns[i + y] = nn[y];
      ns[i + z] = nn[z];
    }

    return ns;
  }


  static displayMatrix(m, n) {
    const tableId = `tbl-matrix-${n||0}`;
    let table = document.getElementById(tableId);
    if (!table) {
      table = document.createElement('table');
      table.className = 'tbl-matrix';
      table.id = tableId;
      for (let i = 0; i < 4; i++) {
        const tr = document.createElement('tr');
        table.appendChild(tr);
        for (let j = 0; j < 4; j++) {
          const td = document.createElement('td');
          const id = i + j * 4;
          td.className = `tbl-matrix-m${id}`;
          td.id = `${tableId}-m${id}`;
          tr.appendChild(td);
        }
      }
      document.body.appendChild(table);
    }
    let selector = '';
    for (let i = 0; i < 16; i += 1) {
      selector = `#${tableId}-m${i}`;
      document.querySelector(selector).innerHTML = m[i].toFixed(1);
    }
  }

  static generatePosition() {
    let x = Math.floor(Math.random() * 50);
    const y = Math.floor(Math.random() * 30) + 50;
    let z = Math.floor(Math.random() * 50);

    const flagX = Math.floor(Math.random() * 10);
    const flagZ = Math.floor(Math.random() * 10);

    if (flagX >= 5) {
      x = -x;
    }
    if (flagZ >= 5) {
      z = -z;
    }
    return [x, y, z];
  }

  static close(c1, c0, r) {
    return (Math.sqrt((c1[0] - c0[0]) * (c1[0] - c0[0]) + (c1[1] - c0[1]) * (c1[1] - c0[1]) + (c1[2] - c0[2]) * (c1[2] - c0[2])) <= r);
  }

}

export default Util;
