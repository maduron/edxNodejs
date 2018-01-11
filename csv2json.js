if (process.argv.length !== 4) {
    console.log('------------------------------------------------------------------');
    console.log('Generates a json file from a comma-separated values file (csv).');
    console.log('------------------------------------------------------------------');
    console.log('The first line should contain member "names" for all json objects.');
    console.log('Subsequent lines should have member "values" for each json object.');
    console.log('Usage:');
    console.log('       node csv2json.js <input-csv-file> <output-json-file>');
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
out.write('[\n');

let nl = 0;
let names;
let vals;
let len = 0;

reader.on('line', (line) => {
    ++nl;
    if (nl === 1) { // get the names from the first line...
        names = line.split(',');
        len = names.length;
    } else {        // for every line subsequent line, get its values...
        vals = line.split(',');
        if (vals.length === len) {
            let obj = {};  // object to be stringified...
            for (let i = 0; i < len; ++i) {
                obj[names[i]] = vals[i];
            }
            out.write(JSON.stringify(obj) + "\n");
        } else {
            console.log(`Line ${nl} with ${vals.length} values; ${len} are required. Skipping...`);
        }
    }
});

reader.on('close', () => {
    out.write(']\n');
    out.close();
    console.log(`Number of lines processed = ${nl}.`);
});
