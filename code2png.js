
const USAGE = "code2img <file_with_code> [--output=<output_file_name>] [--lang=<language_name>] [--colorscheme=<colorscheme_name>] --size=<font_size_in_pt>";

const DEFAULT_COLORSCHEME = "tomorrow-night";
const DEFAULT_FONT_SIZE = "14pt";

const electron = require("electron").remote;
const parseArgv = require("minimist");
const hl = require("highlight.js");
const fs = require("fs")

const puts = (s) => { electron.process.stdout.write(s+"\n") }
const invalidUse = (err) => { puts(err+"\n"+"Usage: "+USAGE); electron.process.exit(1) }
const fatal = (err) => { puts(err); electron.process.exit(1) }

let argv = parseArgv(electron.process.argv);
if (argv._.length == 1) {
    invalidUse("Pease provide path to file with source code")
}
let fileName = argv._[argv._.length-1]
fs.readFile(fileName, "utf-8", (err, data) =>{
    if (err) {
        fatal("Failed to read "+fileName+", "+err)
    }
    if (argv.lang) {
        if (hl.listLanguages().indexOf(argv.lang) == -1) {
            fatal("Unsupported language "+argv.lang+". Supported are: " + hl.listLanguages().join(", "));
        }
        var code = hl.highlight(argv.lang, data);
    } else {
        var code = hl.highlightAuto(data);
        if (code.language === undefined) {
            fatal("Failed to automatically determine language, please use --lang flag")
        }
    }
    let colorscheme = DEFAULT_COLORSCHEME;
    if (argv.colorscheme) {
        colorscheme = argv.colorscheme;
    }
    let fontSize = DEFAULT_FONT_SIZE;
    if (argv.size) {
      if (isNaN(parseInt(argv.size))) {
        fatal("Invalid 'size' parameter. Valid value is integer.")
      }
      fontSize = argv.size + "pt";
    }
    document.write("<div class='hljs' style='height: 100%'>")
    document.write('<link rel="stylesheet" href="node_modules/highlight.js/styles/'+colorscheme+'.css" />');
    document.write("<div id='code' style='position: absolute'><pre><code style='font-size: "+fontSize+"'>"+code.value+"</code></pre><div>");
    document.write("</div>")
    let output = "output.png";
    if (argv.output) {
        output = argv.output;
    }
    let el = document.getElementById('code');
    let brect = el.getBoundingClientRect();
    let scrRect = {
        x: Math.floor(brect.left),
        y: Math.floor(brect.top),
        width: Math.floor(brect.width)+15,
        height: Math.floor(brect.height)+10
    };
    setTimeout(function () {
      electron.getCurrentWindow().capturePage(scrRect, function handleCapture (img) {
        fs.writeFile(output, img.toPng(), ()=>{
          electron.process.exit(0)
        })
      })
    }, 100)
})
