var express = require('express');
var fs = require('fs');
var path = require('path');

var app = express();

const DB_PATH = "./db/db.json";

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    console.log("get");
    const filePath = "./public/index.html";
    processStaticFileRequest(filePath, req, res);
});


app.get('/notes', (req, res) => {
    const filePath = "./public/notes.html";
    processStaticFileRequest(filePath, req, res);
});

function processStaticFileRequest(filePath, req, res) {
    var extname = String(path.extname(filePath)).toLowerCase();
    var mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };

    var contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, function (error, content) {
        if (error) {
            if (error.code == 'ENOENT') {
                fs.readFile('./404.html', function (error, content) {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            }
            else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            }
        }
        else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

app.get('/api/notes', (req, res) => {
    console.log("api/notes");

    const content = fs.readFileSync(DB_PATH);
    const data = JSON.parse(content);
    const data_id = data.map((item, index) => {
        item.id = index + 1;
        return item;
    });
    res.json(data_id);
});

app.post('/api/notes', (req, res) => {
    const content = fs.readFileSync(DB_PATH);
    const data = JSON.parse(content);
    data.push(req.body);

    fs.writeFileSync(DB_PATH, JSON.stringify(data));

    res.json(req.body);
});

app.delete('/api/notes/:id', (req, res) => {
    const content = fs.readFileSync(DB_PATH);
    const data = JSON.parse(content);

    const index = req.params.id - 1;
    data.splice(index, 1);

    fs.writeFileSync(DB_PATH, JSON.stringify(data));

    res.json(data);
});

const port = process.env.PORT || 3000
app.listen(port);