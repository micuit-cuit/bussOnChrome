var Module = {
    postRun: [
        text_changed
    ],
    print: (function() {
        return function(text) {
            if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
            console.log(text);

        };
        })(),
    printErr: function(text) {
        if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
            if (0) { // XXX disabled for safety typeof dump == 'function') {
                dump(text + '\n'); // fast, straight to the real console
            } else {
                console.error(text);
            }
        },
    // get: function(id) {
    //     let element = document.querySelector("."+id);
    //     return {
    //         set_content: function(content) {
    //             element.innerHTML = content;
    //         },
    //         get_content: function() {
    //             return element.innerHTML;
    //         }

    //     }
    // }
    };

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'luaBinary.wasm', true);
    xhr.responseType = 'arraybuffer';
    xhr.overrideMimeType("application/javascript");
    xhr.onload = function() {
        Module.wasmBinary = xhr.response;

        var script = document.createElement('script');
        script.src = "luaBinary.js";
        document.body.appendChild(script);
    };
    xhr.send(null);

    function text_changed(input) {
        if (!input) return;
        console.log(Module.ccall, 1)
        Module.ccall("run_lua", 'number', ['string'], [input]);

    }
    buss.lua = text_changed