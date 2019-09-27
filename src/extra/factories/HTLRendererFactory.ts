//https://github.com/megazear7/htl-compiler

class HTLRendererFactory extends TemplateRendererFactory {
  protected HTL = null;

  constructor() {
    super();
    if (window && window['Compiler']) this.HTL = window['Compiler'];
    else this.HTL = require('htl-compiler');
  }

  protected compileTemplate(template: string): any {
    let HTLCompiler = this.HTL;
    return {
      callback: function (map, cb) {
        let com = new HTLCompiler(template, map);
        com.compile().then(function(txt) {
          cb(txt);
        }).catch(function(ex) {
          cb(null, ex);
        });
      }
    }
  }
}
