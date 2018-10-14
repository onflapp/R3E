class ResponseContentWriter implements ContentWriter {
  private requestHandler: ServerRequestHandler;
  private respose;
  private transform;
  private closed: boolean;

  constructor(res) {
    this.respose = res;
  }

  public setRequestHandler(requestHandler: ServerRequestHandler) {
    this.requestHandler = requestHandler;
  }

  public start(ctype) {
    if (this.closed) return;

    let c = ctype?ctype:'application/octet-stream';
    if (c === 'object/javascript') {
      c = 'application/json';
      this.transform = 'json';
    }

    this.respose.setHeader('content-type', c);
  }
  public write(content) {
    if (this.closed) return;

    if (this.transform === 'json') {
      this.respose.write(JSON.stringify(content));
    }
    else if (typeof content === 'string') {
      this.respose.write(content);
    }
    else {
      this.respose.write(content, 'binary');
    }
  }
  public error(error: Error) {
    console.log(error); 
  }
  public end() {
    this.respose.end();
    this.requestHandler = null;
    this.respose = null;
    this.closed = true;
  }

  public redirect(rpath: string) {
    this.closed = true;
    this.respose.setHeader('Cache-Control','no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
    this.respose.redirect(301, rpath);
  }
}

class ServerRequestHandler extends ResourceRequestHandler {
  private resposeContentWriter: ResponseContentWriter;
  
  constructor(resourceResolver: ResourceResolver, templateResolver: ResourceResolver, res) {
    let writer = new ResponseContentWriter(res);
    super(resourceResolver, templateResolver, writer);
    this.resposeContentWriter = writer;
    this.resposeContentWriter.setRequestHandler(this);
  }

  public handleGetRequest(req) {
    let URL = require('url').URL;
    let rpath = unescape(req.path);
    let referer = req.headers.referrer || req.headers.referer;

    if (referer) {
      let r = new URL(referer);
      this.refererPath = r.pathname;
    }
    this.queryProperties = req.query;

    super.handleRequest(rpath);
  }

  public handlePostRequest(req) {
    let URL = require('url').URL;
    let self = this;
    let rpath = unescape(req.path);
    let multiparty = require('multiparty');
    let querystring = require('querystring');
    let referer = req.headers.referrer || req.headers.referer;

    if (referer) {
      let r = new URL(referer);
      this.refererPath = r.pathname;
    }

    this.queryProperties = req.query;

    let ct = req.headers['content-type'];

    if (ct && ct.indexOf('multipart/form-data') == 0) {
      let form = new multiparty.Form({
        maxFieldsSize:1024*1024*500
      });
     
      form.parse(req, function(err, fields, files) {
        let data = {};

        for (let file in files) {
          let v = files[file][0];
					let f = v['originalFilename'];
					let n = v['fieldName'];
          let ct = v['headers']['content-type'];
					let path = v['path'];
          let pref = '';

          if (n.lastIndexOf('/') > 0) pref = n.substr(0, n.lastIndexOf('/')+1);

          data[n] = f;
          data[pref+'_ct'] = ct;
          data[pref+Resource.STORE_CONTENT_PROPERTY] = function(writer, callback) {
            let fs = require('fs');
            let fd = fs.openSync(path, 'r');

            writer.start(ct);
            let pos = 0;
            let sz = 0;
            while (true) {
              let buff = new Buffer(1024*1000);
              sz = fs.readSync(fd, buff, 0, buff.length, pos);
              if (!sz) break;

              pos += sz;
              if (sz < buff.length) {
                writer.write(buff.slice(0, sz));
              }
              else {
                writer.write(buff);
              }
            }

            fs.closeSync(fd);
            fs.unlinkSync(path);

            writer.end();
            if (callback) callback();
          };

          break;
        }

			  for (var k in fields) {
				  var v = fields[k][0];
				  data[k] = v;
			  }
        
        data = self.transformValues(data);
        rpath = self.expandValue(rpath, data);

        self.handleStore(rpath, new Data(data));
      });
    }
    else {
      let body = '';
		  req.on('data', function (data) {
			  body += data;
			  if (body.length > (1024*1000)) req.connection.destroy();
		  });

		  req.on('end', function () {
        let data = {};
			  let fields = querystring.parse(body);
			  for (var k in fields) {
				  var v = fields[k];

          if (Array.isArray(v)) data[k] = v[0];
          else data[k] = v;
			  }
  
        data = self.transformValues(data);
        rpath = self.expandValue(rpath, data);

        self.handleStore(rpath, new Data(data));
		  });
    }
  }

  public forwardRequest(rpath: string) {
    this.resposeContentWriter.redirect(rpath);
  }

}
