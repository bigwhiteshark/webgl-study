export default class Ex2_2{
    constructor(){
        this.c_width = 800;
        this.c_height = 600;
        this.renderingMode = 'TRIANGLES';
        let canvas = this.createCanvas(document.body);
        let gl = canvas.getContext('webgl');
        this.gl = gl;
        this.initProgram();
        this.initBuffers();
        this.render();
        this.createSelect(document.body);
    }

    createCanvas(container){
        let canvas = document.createElement('canvas');
        canvas.width = this.c_width;
        canvas.height = this.c_height;
        container.appendChild(canvas);
        return canvas;
    }

    getShader(type,str){
        let gl = this.gl;
        let shader;
        if(type == 'shader-vs'){
            shader = gl.createShader(gl.VERTEX_SHADER);
        }else if(type == 'shader-fs'){
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        }
        gl.shaderSource(shader, str);
        gl.compileShader(shader);
        if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            console.log(gl.getShaderInfoLog(shader))
        }

        return shader;
    }

    initProgram(){
        let gl = this.gl;
        let prg = gl.createProgram();
        let vsShader = this.getShader('shader-vs',require('./glsl/Ex2_2.vs'));
        let fsShader = this.getShader('shader-fs',require('./glsl/Ex2_2.fs'));

        gl.attachShader(prg, vsShader);
        gl.attachShader(prg, fsShader);

        gl.linkProgram(prg);

        if(!gl.getProgramParameter(prg,gl.LINK_STATUS)){
            console.log('Cound not link success!');
        }

        gl.useProgram(prg);

        this.prg = prg;
    }

    initBuffers(){
        let gl = this.gl;
        let vertices = [
            -0.5,-0.5,0.0, //vertex 0
            -0.25,0.5,0.0, //vertex 1
            0.0,-0.5,0.0,  //vertex 2
            0.25,0.5,0.0,  //vertex 3
            0.5,-0.5,0.0   //vertex 4
        ];

        let indices = [0, 1, 2, 0, 2, 3, 2, 3, 4];
        let trapezoidVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, trapezoidVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        this.trapezoidVertexBuffer = trapezoidVertexBuffer;

        let trapezoidIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, trapezoidIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices),gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        this.trapezoidIndexBuffer = trapezoidIndexBuffer;

        this.vertices = vertices;
        this.indices = indices;
    }

    drawScene(){
        let gl = this.gl;
        gl.clearColor(0.0,0.0,0.0,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.viewport(0, 0, this.c_width, this.c_height);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.trapezoidVertexBuffer);
        let aVertexPosition = gl.getAttribLocation(this.prg, 'aVertexPosition');
        gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aVertexPosition);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.trapezoidIndexBuffer);

        console.log(this.renderingMode);
        let indices = this.indices;
        switch(this.renderingMode){
            case 'POINTS':
                indices = [0,1,2,3,4];
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
                gl.drawElements(gl.POINTS, indices.length, gl.UNSIGNED_SHORT, 0);
            break;
            case 'LINES':
                indices = [0,1,1,3,3,4,4,2,2,0];
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices),gl.STATIC_DRAW);
                gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_SHORT, 0);
            break;
            case 'LINE_LOOP':
                indices =  [3,2,4,1,0];
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
                gl.drawElements(gl.LINE_LOOP, indices.length, gl.UNSIGNED_SHORT,0);
                break;
            case 'LINE_STRIP':
                indices = [3,2,4,1,0];
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
                gl.drawElements(gl.LINE_STRIP, indices.length, gl.UNSIGNED_SHORT, 0);
                break;
            case 'TRIANGLES':
                indices = [0,2,1,2,4,3];
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
                gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
            break;
            case 'TRIANGLE_STRIP':
                indices = [0, 1, 2, 3, 4];
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
                gl.drawElements(gl.TRIANGLE_STRIP, indices.length, gl.UNSIGNED_SHORT, 0);
                break
            case 'TRIANGLE_FAN':
                indices = [2, 0, 1, 3, 4];
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
                gl.drawElements(gl.TRIANGLE_FAN, indices.length, gl.UNSIGNED_SHORT, 0);
                break;
        }
    }

    render(){
        /*window.requestAnimationFrame(()=>{
            this.render();
        });*/
        this.drawScene();
    }

    createSelect(container){
        let div = document.createElement('div')
        container.appendChild(div)
        let select = document.createElement('select');
        div.appendChild(select);
        let renderingMode = ['POINTS','LINES','LINE_LOOP','LINE_STRIP','TRIANGLES','TRIANGLE_STRIP','TRIANGLE_FAN']
        for(let v of renderingMode){
            let option = document.createElement('option');
            option.value = v;
            option.text = v;
            select.appendChild(option);
        }
        select.addEventListener('change',(evt)=>{
            let target = evt.target;
            var option = target.options[target.selectedIndex];
            this.renderingMode = option.value;
            this.render()
        })
    }

}
