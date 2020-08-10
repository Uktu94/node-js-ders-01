const fs = require('fs'); // we will get access to fn for reading data and writing data right to the file system
const http = require('http');
const url = require('url');
const slugify = require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');

/////// FILES //////////

// *
/*Blocking code execution => SYNC WAY**
/*
const textIn = fs.readFileSync('./txt/input.txt', 'utf-8'); // 2 args, path that we're reading and char encoding. 'utf-8' tanımlamazsak buffer alırız...
//console.log(textIn); // Dosya okuma .readFileSync()

const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}`;
fs.writeFileSync('./txt/output.txt', textOut); // Dosya yazma
//console.log('File written!');
*/
// Node js is single threaded.

// **SYNC BEHAVIOR**
// Sync code also Blocking code
// SYNC => all users have to wait for that execution to finish. Entire execution will be blocked until loading will done.

// **ASYNC BEHAVIOR**
// ASYNC is NON-BLOCKING CODE
// ASYNC will be executed on background and all users can be able to single thread.

// Other programming language is (PHP, etc...) ...=>
// it works very diffrently 'cause we're getting one new thred for each new user

// Callback doesn't automatically make it asynchronous...
// It only work this way for some fn in the Node API, such as .readFile() fn
// AVOID CALLBACK HELL :D
// WE AVOID CALLBACK HELL AS USING PROMISES or ASYNC/AWAIT (Sıkı öğren!)



// **NON-BLOCKING, ASYNC WAY**
/*
fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {

    if (err) {
        return console.log('ERROR! KABOOM!');
    }

    fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
        console.log(data2);
        fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
            console.log(data3);

            fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
                console.log('Your file has been written! :D');
            });
        }); 
    }); 
}); 

//  Many times in a callback's first params will be the error. Very common, Second one will be data.

// As soon as this .readFile() fn here is run 
// and it will start reading this file in the backgorund without
// blocking the rest of the code execution...

console.log('Will read file');
// Node js will start reading file in background here, and will not block the code
// And then immediately move on to the next line of code. => console.log('Will read file!');

// Only then when a file is completely read and 
// Callback fn will run.

// We called this Callback Hell :D 30=>41 linelar...

// Old way fn doesnt get it's own this keyword but arrow fns can get this keyword has our own
// Parent fn dan this keyword alınır arrow fndan (Lexical this keyword);
*/


///////////////////////////
// SERVER

// The code that is outside cb fns, called top level code is only ever executed
// once we started the program
// Eğer execution ı blocklarsa önemli değil. Çünkü sadece bir defalığına çalışıyor

const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const slugs = dataObj.map(el => slugify(el.productName, { lower: true }));
console.log(slugs);

// .createServer() accept a cb fn which will be fired off each time a new req hits our server.  
// executed each time that there is a new request
const server = http.createServer((req, res) => {

    const { query, pathname } = url.parse(req.url, true);
    // Overview Page
    if (pathname === '/' || pathname === '/overview') {
        res.writeHead(200, { 'Content-type': 'text/html' });

        const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('');
        const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
        // replaceTemplate fn plugged in in here
        // then will replace an array with he five fina HTML's

        res.end(output);
        // Production Page
    } else if (pathname === '/product') {
        res.writeHead(200, { 'Content-type': 'text/html' });
        const product = dataObj[query.id];
        const output = replaceTemplate(tempProduct, product);

        res.end(output);

        // API
    } else if (pathname === '/api') {
        fs.readFile(`${__dirname}/dev-data/data.json`, 'utf-8', (err, data) => {
            res.writeHead(200, { 'Content-type': 'application/json' });
            res.end(data);
            // /api diye route ekledik ardıdan file'ı sync olarak okuttuk (84. line)
            // obj içine koyduk ve response olarak ardından geri yolladık (data)
            // öncesinde application/json olarak gönderiyoruz
        });
        // exception to this rule which is require fn

        // NOT FOUND
    } else {
        res.writeHead(404, {
            'Content-type': 'text/html',
            'my-own-header': 'hello-world'
        });
        // Header: an HTTP header is basically a piece of information
        // about the res that we are sending back
        res.end('<h1>Page not found!</h1>');
    }
});

// Cb fn executed each time that a new req hits the server and then =>

server.listen(3000, '127.0.0.1', () => {
    console.log('Listening to request on port 3000');
});

// We started listening for inc req on the local host IP
// 2.,3. params optional, ip default olarak makinedeki ip...
