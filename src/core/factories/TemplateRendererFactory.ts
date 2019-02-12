class TemplateOutputPlaceholder {
  private buffer: Array < string > = [];
  private session: TemplateRendererSession;
  private closed: boolean = false;

  public id: number;
  public placeholder: string;

  constructor(id: number, session: TemplateRendererSession) {
    let self = this;
    this.id = id;
    this.placeholder = '[[' + id + ']]';
    this.session = session;

    setTimeout(function () {
      if (!self.closed) {
        self.buffer = ['write timeout'];
        self.end();
      }
    }, Resource.IO_TIMEOUT);
  }

  public write(str) {
    if (!this.closed) {
      this.buffer.push(str);
    }
    else {
      console.log('error: write to closed stream');
    }
  }

  public end() {
    this.session.processPendingReplacements();
    this.closed = true;
  }

  public toString() {
    return this.buffer.join('');
  }
}

class TemplateRendererSession {
  private outputPlaceholderID: number = 1;
  private placeholders: Array < TemplateOutputPlaceholder > = [];
  private deferredReplaceFunc: any;
  private pending: any = 0;

  public makeOutputPlaceholder() {
    let self = this;
    let p = new TemplateOutputPlaceholder(this.outputPlaceholderID++, this);
    this.placeholders.push(p);
    this.pending++;

    return p;
  }

  public replaceOutputPlaceholders(text: string, callback: any) {
    let self = this;
    let replaceFunc = function () {
      let ls = self.placeholders.sort(function (a: TemplateOutputPlaceholder, b: TemplateOutputPlaceholder): number {
        return +(a.id > b.id) - +(a.id < b.id);
      });
      for (let i = 0; i < ls.length; i++) {
        let it = ls[i];
        text = text.replace(it.placeholder, it.toString());
      }

      callback(text);
      self.close();
    };

    if (this.pending === 0) replaceFunc();
    else this.deferredReplaceFunc = replaceFunc;
  }

  public processPendingReplacements() {
    this.pending--;
    if (this.pending === 0 && this.deferredReplaceFunc) {
      this.deferredReplaceFunc();
    }
    else if (this.pending < 0) {
      console.log('pending not in sync ' + this.pending);
    }
  }

  protected close() {
    this.pending = 0;
    this.deferredReplaceFunc = null;
    this.placeholders = null;
  }
}

class TemplateRendererFactory implements RendererFactory {
  private static cache = {};

  protected compileTemplate(template: string): any {
    return function () {
      return template;
    };
  }

  public expadPath(path: string, context: ResourceRequestContext): string {
    if (path === '.') return context.getCurrentResourcePath();
    else if (path.charAt(0) === '/') return path;
    else return Utils.filename_path_append(context.getCurrentResourcePath(), path);
  }

  public makeRenderer(resource: Resource, callback: RendererFactoryCallback) {
    let self = this;
    resource.read(new ContentWriterAdapter('utf8', function (data) {
      if (data) {
        let tfunc = TemplateRendererFactory.cache[data];
        if (!tfunc) {
          try {
            tfunc = self.compileTemplate(data);
          }
          catch (ex) {
            callback(null, ex);
            return;
          }
        }

        TemplateRendererFactory.cache[data] = tfunc;

        let session = new TemplateRendererSession();

        callback(function (data: Data, writer: ContentWriter, context: ResourceRequestContext) {
          let map = context.makeContextMap(data);

          map['_session'] = session;
          map['_context'] = context;

          try {
            let txt = tfunc(map);
            session.replaceOutputPlaceholders(txt, function (txt) {
              writer.start('text/html');
              writer.write(txt);
              writer.end(null);
            });
          }
          catch (ex) {
            callback(null, ex);
          }
        });
      }
      else {
        callback(null, new Error('unable to read utf8 from resource'));
      }
    }), null);
  }
}
