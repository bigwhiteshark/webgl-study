export default class Ex2_1 {
    constructor() {
        this.c_width = 800;
        this.c_height = 600;
        this.canvas = this.createCanvas(document.body);
        this.gl = this.getGLContext('webgl');
        this.initProgram();
        this.initBuffers();
        this.render();
    }

    createCanvas(container) {
        let canvas = document.createElement('canvas');
        canvas.width = this.c_width;
        canvas.height = this.c_heigh;
        container.appendChild(canvas);
        return canvas;
    }
    c

    getShader(type, str) {
        let gl = this.gl;
        let shader;
        if (type == 'shader-fs') {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (type == 'shader-vs') {
            shader = gl.createShader(gl.VERTEX_SHADER);
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(shader))
        }

        return shader;
    }

    initProgram() {
        let gl = this.gl;
        let vsShader = this.getShader('shader-vs', require('./glsl/Ex2_1.vs'));
        let fsShader = this.getShader('shader-fs', require('./glsl/Ex2_1.fs'));

        let prg = gl.createProgram();
        gl.attachShader(prg, vsShader);
        gl.attachShader(prg, fsShader);
        gl.linkProgram(prg);

        if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
            console.log('Could')
        }
        gl.useProgram(prg);
        this.prg = prg;
    }

    initBuffers() {
        let gl = this.gl;
        let vertices = [

            -0.5, 0.5, 0.0, //vertex 0
            -0.5, -0.5, 0.0, //vertex 1
            0.5, -0.5, 0.0, //vertex 2
            0.5, 0.5, 0.0 //vertex 3

        ];

        let indices = [0, 1, 3, 3, 1, 2];
        this.squareVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.squareIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.squareIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        this.vertices = vertices;
        this.indices = indices;
    }

    drawScene() {
        let gl = this.gl;
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, this.c_width, this.c_height);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVertexBuffer);
        let aVertexPosition = gl.getAttribLocation(this.prg, 'aVertexPosition')
        gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aVertexPosition);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.squareIndexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }

    render() {
        this.drawScene();
    }
}
