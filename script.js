// Load configuration
var config = getConfigFromURL();

// 如果配置要求全屏，自动进入全屏
if (config.fullscreen) {
    // 高亮全屏按钮并弹窗提示
    window.addEventListener('DOMContentLoaded', function() {
        var btn = document.getElementById('fullscreen-btn');
        if (btn) {
            btn.classList.add('selected');
            btn.focus();
        }
        setTimeout(function() {
            alert('请点击“全屏显示”按钮或画面以进入全屏（浏览器安全限制，需用户操作）');
        }, 350);
    });
}

// Load font
var vcr_font = new FontFace('VCR', 'url(vcr.ttf)');
document.fonts.add(vcr_font);
let canvas = document.querySelector('#testcard');
let ctx = canvas.getContext('2d');
ctx.font = "100px VCR";

// Load images
var images_names = ['bars75', 'bars100', 'black', 'checkerboard', 'circle', 'darkblue', 'gray50',
                    'lines', 'linesw', 'mauve', 'overscan', 'smpte', 'circlew','PM5544'];
var canvas_images = new Map();
for(let i=0 ; i < images_names.length ; i++) {
    let image_object = new Image();
    image_object.src = './imgs/' + images_names[i] + '.svg'; // 路径加./更稳妥
    canvas_images.set(images_names[i], image_object);
}

// Update test card
setInterval(function() {
    updateCanvasFromConfig();
}, 100);

function getConfigFromURL() {
    let config = { // Default config
        'pattern': 'bars75',
        'circle': false,
        'circlew': false,
        'overscan': false,
        'text': false,
        'time': false,
        'inverted': false,
        'boxed': true,
        'blink': false,
        'label': 'NO SIGNAL',
        'fullscreen': false
    };

    let url_config_str = document.location.hash.substring(1);
    if(url_config_str) {
        let url_config_list = url_config_str.split(';');
        url_config_list.forEach(function(value, i, array) {
            let key_for_index = Object.keys(config)[i];
            value = decodeURIComponent(value);
            if(value == '1') { value = true; }
            if(value == '0') { value = false; }
            config[key_for_index] = value;
        });
    }

    document.querySelector("#label-widget").innerHTML = config['label'];

    return config;
}

function setConfigToURL() {
    let config_array = Object.values(config);
    config_array.forEach(function(value, i) {
        if(value == true)  { config_array[i] = '1'; }
        if(value == false) { config_array[i] = '0'; }
    });
    let config_str = config_array.join(';');
    document.location.hash = config_str;
}

function updateCanvasFromConfig() {
    drawImage(config['pattern']);
    if(config['circle']) {
        drawImage('circle');
    }
    if(config['circlew']) {
        drawImage('circlew');
    }
    if(config['overscan']) {
        drawImage('overscan');
    }
    if(config['text']) {
        drawTextbox(
            config['label'],
            config['boxed'],
            config['inverted'],
            config['blink']
        );
    }
    if(config['time']) {
        let d = new Date();
        drawTextbox(
            padt(d.getHours()) + ':' + padt(d.getMinutes()) + ':' + padt(d.getSeconds()),
            config['boxed'],
            config['inverted'],
            config['blink'],
            true
        );
    }
}

function drawImage(filename) {
    let canvas = document.querySelector('#testcard');
    let ctx = canvas.getContext('2d');
    ctx.drawImage(canvas_images.get(filename), 0, 0, canvas.width, canvas.height);
}

function drawTextbox(text, boxed, inverted, blink, bottom) {
    let d = new Date();
    if(blink && d.getSeconds() % 2) {
        return false;
    }

    if(boxed) {
        ctx.fillStyle = inverted ? "white" : "black";
        let boxWidth = ctx.measureText(text).width + 60;
        let boxHeight = 110;
        let boxX = (canvas.width/2) - (boxWidth/2);
        let boxY = (canvas.height/2) - (boxHeight/2);
        if(bottom) {
            boxY += 300;
        } 
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = inverted ? "black" : "white";
    let textHeight = canvas.height/2-12;
    if(bottom) {
        textHeight += 300;
    } 
    ctx.fillText(text, canvas.width/2, textHeight);
}

function padt(hour_or_minute) {
    if(hour_or_minute < 10) {
        return '0' + hour_or_minute;
    }
    else {
        return hour_or_minute;
    }
}

// Buttons

function setPattern(filename) {
    config['pattern'] = filename;
    updateCanvasFromConfig();
    setConfigToURL();
}

function toggleOption(option) {
    config[option] = !config[option];
    updateCanvasFromConfig();
    setConfigToURL();
}

function setLabel(text) {
    config['label'] = text;
    updateCanvasFromConfig();
    setConfigToURL();
}

function setPreviewWide(yes) {
    if(yes) {
        document.querySelector("#testcard").classList.add('wide');
    }
    else {
        document.querySelector("#testcard").classList.remove('wide');
    }
}

function toggleFullscreen() {
    let canvas = document.querySelector("#testcard");
    let btn = document.getElementById('fullscreen-btn');
    if (!document.fullscreenElement) {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen();
        } else if (canvas.msRequestFullscreen) {
            canvas.msRequestFullscreen();
        }
        if (btn) btn.classList.remove('selected');
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

function copyFullscreenLink() {
    let fullscreenURL = window.location.href.split('#')[0] + '#1;0;0;0;1;0;0;1;0;NO SIGNAL;0';
    navigator.clipboard.writeText(fullscreenURL).then(function() {
        alert('全屏链接已复制到剪贴板！');
    }).catch(function(err) {
        console.error('无法复制链接: ', err);
    });
}