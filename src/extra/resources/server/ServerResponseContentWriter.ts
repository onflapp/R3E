class ServerResponseContentWriter implements ContentWriter {
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

    let c = ctype ? ctype : 'application/octet-stream';
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
    this.respose.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
    this.respose.redirect(301, rpath);
  }

  public sendStatus(code: number) {
    this.closed = true;
    this.respose.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
    this.respose.sendStatus(code);
  }
}
