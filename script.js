function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}

function bw(hex) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ?
        '#000000' :
        '#FFFFFF';
}

function contrast(color1) {
    function hexToRgb(hex) {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function luminance(r, g, b) {
        var a = [r, g, b].map(function(v) {
            v /= 255;
            return v <= 0.03928 ?
                v / 12.92 :
                Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }
    const color2 = inverthex(color1);
    const color1rgb = hexToRgb(color1);
    const color2rgb = hexToRgb(color2);
    const color1luminance = luminance(color1rgb.r, color1rgb.g, color1rgb.b);
    const color2luminance = luminance(color2rgb.r, color2rgb.g, color2rgb.b);
    const ratio = color1luminance > color2luminance ?
        ((color2luminance + 0.05) / (color1luminance + 0.05)) :
        ((color1luminance + 0.05) / (color2luminance + 0.05));
    return ratio < 1 / 3;
}

function inverthex(hex) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    return '#' + padZero(r) + padZero(g) + padZero(b);
}

String.prototype.cap = function() {
    return this.charAt(0).toLocaleUpperCase(navigator.locale) + this.slice(1);
};

function clean(s){
    const re=/^FOGRA([0-9]{1,2}) ?/;
    if (re.test(s)){
        var num=s.match(re)[1];
        s=s.replace(re,"")+` ${num}`;
    }
    var l=[];
    s.split(" ").forEach(function(i){
        l.push(i.cap());
    });
    s=l.join(" ");
    return s;
}

function proc(x) {
    if (contrast(x)) {
        return inverthex(x);
    } else {
        return bw(x);
    }
}

function width() {
    const w = $(document).width();
    const x=150;
    var n = `${w/((w-(w%x))/x)}px`;
    $("div.box").width(n);
}

function init() {
    console.log("Page Loaded!!!");
    const url="https://raw.githubusercontent.com/jonathantneal/color-names/master/color-names.json";
    $.getJSON(url, function(d) {
        for (var [c,v] of Object.entries(d)) {
            if (!c.startsWith("#")){
                c=`#${c}`;
            }
            $("body").append(`<div class="box" style="background-color:${c};color:${proc(c)};"><a href="https://www.colorhexa.com/${c.slice(1)}" target="_blank"><name>${clean(v)}</name><br />${c}</a></div>`);
        }
        width();
    });
}

$(document).ready(init());