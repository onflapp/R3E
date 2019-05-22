interface ContentWriter {
  start(ctype: string);
  write(data: any);
  error(error: Error);
  end(callback: any);
}

class ContentWriterAdapter implements ContentWriter {
  private callback: any;
  private data = [];
  private ctype: string;
  private conversion: string;
  constructor(typ: string, callback: any) {
    this.callback = callback;
    this.conversion = typ;
  }

  public start(ctype: string) {
    this.ctype = ctype;
  }
  public write(data: any) {
    this.data.push(data);
  }
  public error(error: Error) {
    console.log(error);
  }
  public end(cb: any) {
    if (this.conversion === 'utf8') {
      let v = this.data[0];
      let self = this;
      if (!v) {
        this.callback('', this.ctype);
      }
      else if (typeof v === 'string') {
        this.callback(this.data.join(''), this.ctype);
      }
      else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(v)) {
        let b = Buffer.concat(this.data);
        this.callback(b.toString('utf8'), this.ctype);
      }
      else if (v instanceof Blob && typeof window !== 'undefined') {
        let reader = new FileReader();
        reader.onload = function () {
          self.callback(reader.result, self.ctype);
        };
        reader.readAsText(v);
      }
      else if (v instanceof ArrayBuffer && typeof window !== 'undefined') {
        let t = new window['TextDecoder']('utf-8').decode(v);
        this.callback(t, this.ctype);
      }
      else if (v) {
        this.callback(this.data, this.ctype);
      }
      else {
        this.callback(null, this.ctype);
      }
    }
    else {
      if (this.data.length === 1) {
        this.callback(this.data[0], this.ctype);
      }
      else {
        this.callback(this.data, this.ctype);
      }
    }
    if (cb) cb();

    //cleanup
    this.callback = null;
    this.data = null;
  }
}
