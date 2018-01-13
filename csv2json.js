if (process.argv.length !== 4) {
    console.log('------------------------------------------------------------------');
    console.log('Generates a json file from a comma-separated values file (csv).');
    console.log('------------------------------------------------------------------');
    console.log('The first line should contain member "names" for all json objects.');
    console.log('Subsequent lines should have member "values" for each json object.');
    console.log('Usage:');
    console.log('       node csv2json.js input-csv-file output-json-file');
    console.log('------------------------------------------------------------------');
    process.exit(-1);
}

if (process.argv[2] === process.argv[3]) {
    console.log('Input and output files must have different names.');
    process.exit(-1);
}

const inFile = process.argv[2];
const outFile = process.argv[3];

const readline = require('readline');
const fs = require('fs');

const reader = readline.createInterface({
    input: fs.createReadStream(inFile),
    crlfDelay: Infinity
});

const out = fs.createWriteStream(outFile);

out.write('[\r\n');  // every '\r\n' sequence is to match provided output (in windows style)

let lc = 0;          // Line count
let keys;            // Keys (or names) of the object's members
let vals;            // Values corresponding to the object's members
let nKeys = 0;       // Number of key:value pairs that each object should have

reader.on('line', (line) => {
    ++lc;
    if (lc === 1) { // get the keys from the first line...
        keys = line.split(',');
        nKeys = keys.length;
    } else {        // for every subsequent line, get its values...
        vals = line.split(',');
        if (vals.length === nKeys) {
            writeLineAsJSON();
        } else {
            console.log(`Line ${lc} with ${vals.length} values; ${nKeys} are required. Skipping...`);
        }
    }
});

function writeLineAsJSON() {
    let obj = {};  // object to be stringified...
    for (let i = 0; i < nKeys; ++i) {
        obj[keys[i]] = vals[i];
    }
    let objStr = JSON.stringify(obj);
    const s1 = objStr.replace('{"', '  {\r\n    "');  // to match provided output
    const s2 = s1.replace(/":"/g, '": "');            // to match provided output
    const s3 = s2.replace(/","/g, '",\r\n    "');     // to match provided output
    objStr = s3.replace('"}', '"\r\n  }');            // to match provided output
    if (lc > 2) {
        out.write(',\r\n') // separate from previous object...
    }
    out.write(objStr);
}

reader.on('close', () => {
    if (lc > 2) {
        out.write('\r\n');   // if at least one "values" line, separate last one without a comma...
    }
    out.write(']');
    out.close();
    console.log(`Number of processed lines = ${lc}.`);
});
