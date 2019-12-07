class ObjectResource extends Resource {

  constructor(obj: any, name: string) {
    super(name);
    if (!obj) throw new Error('no object for ObjectResource');

    this.values = obj;
  }

  public getRenderType(): string {
    let rt = this.values['_rt'];
    return rt ? rt : null;
  }

  public getRenderSuperType(): string {
    let st = this.values['_st'];
    return st ? st : null;
  }

  public getType(): string {
    let st = this.values['_pt'];
    return st ? st : 'resource/node';
  }

  public resolveChildResource(name: string, callback: ResourceCallback, walking ? : boolean): void {
    let rv = this.values[name];

    if (typeof rv === 'object') {
      if (rv['_content'] || rv['_content64'] || rv['_pt'] === 'resource/content') callback(new ObjectContentResource(rv, name));
      else callback(new ObjectResource(rv, name));
    }
    else if (typeof rv === 'function') {
      callback(new ObjectContentResource(rv, name));
    }
    else {
      callback(null);
    }
  }

  public allocateChildResource(name: string, callback: ResourceCallback): void {
    let rv = {};
    this.values[name] = rv;
    callback(new ObjectResource(rv, name));
  }

  public listChildrenNames(callback: ChildrenNamesCallback) {
    var rv = [];
    for (var k in this.values) {
      var v = this.values[k];
      if (typeof v === 'object' && k.charAt(0) !== '.') {
        rv.push(k);
      }
    }
    callback(rv);
  }

  public importContent(func, callback) {
    let res = new ObjectContentResource(this.values, this.resourceName);
    func(res.getWriter(), callback);
  }

  public removeChildResource(name: string, callback) {
    delete this.values[name];
    if (callback) callback();
  }
}

class ObjectContentResourceWriter implements ContentWriter {
  private values;
  private isbase64;
  private istext;
  private buffer = [];

  constructor(obj) {
    this.values = obj;
  }

  public start(ctype: string) {
    if (ctype && ctype.indexOf('base64:') === 0) {
      ctype = ctype.substr(7);
      this.values['_ct'] = ctype;
      this.isbase64 = true;
    }
    else {
      this.values['_ct'] = ctype;
    }

    this.istext = Utils.is_texttype(ctype);
    this.values['_pt'] = 'resource/content';
  }

  public write(data: any) {
    this.buffer.push(data);
  }

  public error(error: Error) {}

  public end(callback: any) {
    //TODO: handling of non-string data is very bad here, it needs to be fixed
    let data = this.buffer[0];

    if (data instanceof ArrayBuffer) {
      if (this.istext && typeof window !== 'undefined') this.values['_content'] = new window['TextDecoder']('utf-8').decode(data);
      else this.values['_content64'] = Utils.ArrayBuffer2base64(data);
    }
    else if (typeof Buffer !== 'undefined' && data instanceof Buffer) {
      data = Buffer.concat(this.buffer);
      if (this.istext) {
        let t = data.toString('utf8');
        this.values['_content'] = t;
      }
      else {
        this.values['_content64'] = data.toString('base64');
        this.values['_content64sz'] = data.length;
      }
    }
    else if (this.isbase64) {
      this.values['_content64'] = data;
    }
    else if (this.buffer) {
      var t = this.buffer.join('');
      this.values['_content'] = t;
    }

    this.buffer = [];
    if (callback) callback();
  }
}

class ObjectContentResource extends ObjectResource {
  constructor(obj: any, name: string) {
    super(obj, name);
  }

  public getType(): string {
    return 'resource/content';
  }

  public isContentResource(): boolean {
    return true;
  }

  public getContentType(): string {
    let contentType = this.values['_ct'];
    if (contentType) return contentType;
    else return Utils.filename_mime(this.getName());
  }

  public getContentSize(): number {
    let t = this.values['_content'];
    let z = this.values['_content64sz'];

    if (z) return z;
    else if (t) return t.length;
    else return 0;
  }

  public getWriter(): ContentWriter {
    delete this.values['_content64sz'];
    delete this.values['_content64'];
    delete this.values['_content'];
    return new ObjectContentResourceWriter(this.values);
  }

  public read(writer: ContentWriter, callback: any): void {
    let data = this.values;
    let contentType = this.getContentType();

    writer.start(contentType ? contentType : 'text/plain');

    if (typeof data['_content'] !== 'undefined') {
      if (data['_content']['type'] === 'Buffer' && data['_content']['data']) { //Buffer that may have been JSON.stringifyed
        writer.write(Int8Array.from(data['_content']['data']).buffer);
      }
      else {
        writer.write(data['_content']);
      }
    }
    else if (data['_content64']) {
      writer.write(Utils.base642ArrayBuffer(data['_content64']));
    }
    else {
      writer.write(data);
    }

    writer.end(callback);
  }

}
