class EJSRendererFactory extends TemplateRendererFactory {
  protected EJS = null;

  constructor() {
    super();
    if (window && window['ejs']) this.EJS = window['ejs'];
    else this.EJS = require('ejs');
  }

  protected compileTemplate(template: string): string {
    return this.EJS.compile(template);
  }
}
