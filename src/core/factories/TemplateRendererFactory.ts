class TemplateOutputPlaceholder {
  private buffer: Array < string > = [];
  private session: TemplateRendererSession;
  private closed: boolean = false;

  public id: number;
  public placeholder: string;

  constructor(id: number, session: TemplateRendererSession) {
    let self = this;
    this.id = id;
    this.placeholder = '_D3EASW_' + id + '_G4FDH9_';
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
        let tt = it.toString();
        text = text.split(it.placeholder).join(tt);
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
    else if (path.charAt(0) === '/') {
      return Utils.absolute_path(path);
    }
    else {
      let p = Utils.filename_path_append(context.getCurrentResourcePath(), path);
      return Utils.absolute_path(p);
    }
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

        callback(function (data: any, writer: ContentWriter, context: ResourceRequestContext) {
          let map = Object.assign({}, data);

          map['R'] = context.getRequestProperties();
          map['Q'] = context.getQueryProperties();
          map['C'] = context.getConfigProperties();
          map['S'] = context.getSessionProperties();

          map['_session'] = session;
          map['_context'] = context;

          let render_ouput = function(txt) {
            session.replaceOutputPlaceholders(txt, function (txt) {
              writer.start('text/html');
              writer.write(txt);
              writer.end(null);
            });
          };

          if (typeof tfunc === 'function') {
           try {
              let txt = tfunc(map);
              render_ouput(txt);
            }
            catch (ex) {
              callback(null, ex);
            }
          }
          else if (typeof tfunc.callback === 'function') {
            tfunc.callback(map, function(txt, error) {
              if (txt) render_ouput(txt);
              else callback(null, error);
            });
          }
          else {
            console.log(tfunc);
            callback(null, new Error('invalid renderer function'));
          }
        });
      }
      else {
        callback(null, new Error('unable to read utf8 from resource'));
      }
    }), null);
  }
}
