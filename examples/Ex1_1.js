var canvas;
var gl;
var c_width = 800;
var c_height = 600;


function createCanvas(){
    var container = document.createElement("div");
    document.body.appendChild(container);

    const c_width = 800;
    const c_height = 600;
    canvas = document.createElement('canvas');
    canvas.id = "canvas-element-id";
    canvas.width = c_width;
    canvas.height = c_height;
    container.appendChild(canvas);
}

function getGLContext() {
    if (canvas) {
        let gl;
        let names = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl'];
        for(var i=0;i<names.length;i++){
            try{
                gl  = canvas.getContext(names[i]);
            }catch(ex){
                console.log(ex)
            }
            if(gl) return gl;
        }
    }
}

function clear(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, c_width, c_height)
}

function initWebGL(){

    gl = getGLContext();
}

function checkKey(e){

    console.log(e.keyCode);
    switch (e.keyCode) {
        case 49:
            gl.clearColor(0.3,0.7, 0.2,1.0);
            clear();
            break;
        case 50:
            gl.clearColor(0.3, 0.2, 0.7, 1.0);
            clear();
            break;
        case 51:
            let color = gl.getParameter(gl.COLOR_CLEAR_VALUE);
            console.log('clearColor = '+ color[0].toFixed(1)+','+color[1].toFixed(1)+','+color[2].toFixed(1));
            window.focus();
            break;
        default:

    }
}

createCanvas();
initWebGL();
window.addEventListener('keyup',checkKey);
