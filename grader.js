#!/usr/bin/env node

/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development 
and basic DOM parsing.

References:

  + cheerio
    - https://github.com/MatthewMueller/cheerio
    - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
    - http://maxogden.com/scraping-with-node.html

  + commander.js
    - https://github.com/visionmedia/commander.js
    - http://tjholowaychuck.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

  + JSON
    - http://en.wikipedia.org/wiki/JSON
    - https://developer.mozilla.org/en-US/docs/JSON
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var sys = require('util');
var rest = require('restler');
var buffer = require('buffer');
var outfile = "urlfile.html";
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://agile-taiga-3330.herokuapp.com/";

var assertValidUrl = function(url) {
    rest.get(url).on('complete', function(result) {
	if(result instanceof Error) {
	    return("Error: " + result.message);
	} else {
	    var urlBuffer = new Buffer(result);
	    fs.writeFileSync('index.html',result);
	    //sys.puts(result);
	    //return(result);
	}
    });
}

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

/* TODO: Modify this function so it accepts either file or url to check*/
var checkHtmlSource = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    //Workaround for commander.js issue
    //http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
	.option('-c, --checks <check file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url>', 'URL to check')
	.parse(process.argv);

    process.argv.forEach(function(val, index, array) {
	console.log(index + ': ' + val);
    });

    sys.puts("First argument = " + program.file + "\n");
    sys.puts("Second argument = " + program.url + "\n");

    if(program.url) {
	sys.puts("URL level checks...\n");
	rest.get(program.url.toString()).on('complete', function(result) {
	    if(result instanceof Error) {
		sys.puts("An error occurred: " + result.message); 
	    } else {
		fs.writeFileSync(outfile, result);
		var checkJson = checkHtmlSource(outfile, program.checks);
		var outJson = JSON.stringify(checkJson, null, 4);
		console.log(outJson);
	    }
	});

    } else {
	sys.puts("File level checks...\n");
	var checkJson = checkHtmlSource(program.file, program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
    }
} else {
    exports.checkHtmlSource = checkHtmlSource;
}
