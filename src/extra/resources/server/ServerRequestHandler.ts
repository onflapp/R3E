class ResponseContentWriter implements ContentWriter {
  private requestHandler: ServerRequestHandler;
  private respose;

  constructor(res) {
    this.respose = res;
  }

  public setRequestHandler(requestHandler: ServerRequestHandler) {
    this.requestHandler = requestHandler;
  }

  public start(ctype) {
    let c = ctype?ctype:'application/octet-stream';
    this.respose.setHeader('content-type', c);
  }
  public write(content) {
    if (typeof content === 'string') {
      this.respose.write(content);
    }
    else {
      this.respose.write(content);
    }
  }
  public error(error: Error) {
    console.log(error); 
  }
  public end() {
    this.respose.end();
  }

  public redirect(rpath: string) {
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

  public handlePostRequest(req) {
    let self = this;
    let rpath = unescape(req.url);
    let multiparty = require('multiparty');
    let querystring = require('querystring');

    let ct = req.headers['content-type'];

    if (ct && ct.indexOf('multipart/form-data') == 0) {
      let form = new multiparty.Form({
        maxFieldsSize:1024*1024*50
      });
     
      form.parse(req, function(err, fields, files) {
        let data = {};

        for (let file in files) {
          let v = file[0];
					let n = v['originalFilename'];
					let f = v['fieldName'];
					let path = v['path'];
        }

			  for (var k in fields) {
				  var v = fields[k][0];
				  data[k] = v;
			  }
        
        self.transformValues(data);
        rpath = self.expandValue(rpath, data);

        self.handleStore(rpath, data);
      });
    }
    else {
      let body = '';
		  req.on('data', function (data) {
			  body += data;
			  if (body.length > 20000000) req.connection.destroy();
		  });

		  req.on('end', function () {
        let data = {};
			  let fields = querystring.parse(body);
			  for (var k in fields) {
				  var v = fields[k];

          if (Array.isArray(v)) data[k] = v[0];
          else data[k] = v;
			  }
  
        self.transformValues(data);
        rpath = self.expandValue(rpath, data);

        self.handleStore(rpath, data);
		  });
    }
  }

  public forwardRequest(rpath: string) {
    this.resposeContentWriter.redirect(rpath);
  }

}
