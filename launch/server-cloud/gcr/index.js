const functions = require('@google-cloud/functions-framework');
const {Storage} = require('@google-cloud/storage');

//<bucket><path>

functions.http('googleStorage', (req, res) => {
    const store = new Storage();

    let a = req.path.split('/');
    a.shift();
    let base = a.shift();
    let path = a.join('/');

    if (req.method == 'POST') {
        let content = req.body;
        store.bucket(base).file(path).save(content).then(function() {
            res.send('done:');
        }).catch(function (ex) {
            res.send('error:'+ex);
        });
    }
    else {
        store.bucket(base).file(path).download().then(function(rv) {
            res.send('done:' + rv);
        }).catch(function (ex) {
            res.send('error:'+ex);
        });
    }
});
