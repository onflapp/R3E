class HBSRendererFactory extends TemplateRendererFactory {
  protected Handlebars = null;

  constructor() {
    super();

    if (typeof window !== 'undefined' && window['Handlebars']) this.Handlebars = window['Handlebars'];
    else this.Handlebars = require('handlebars');

    let self = this;

    //include "/path"
    //include "/path" "sel"
    //include "/path" "render/type"
    //include "/path" "render/type" "sel"

    let include = function (arg0, arg1) {
      let path = arg0;
      let block = arg1;
      let selector = null;
      let rtype = null;

      if (arguments.length == 3) {
        if (arguments[1].indexOf('/') > 0) rtype = arguments[1];
        else selector = arguments[1];

        block = arguments[2];
      }
      else if (arguments.length == 4) {
        rtype = arguments[1];
        selector = arguments[2];
        block = arguments[3];
      }

      let safe = (block.name === 'include-safe') ? true : false;
      let session: TemplateRendererSession = block.data.root._session;
      let context: ResourceRequestContext = block.data.root._context;
      let res: Resource = block.data.root._resource;

      if (!selector) selector = context.getCurrentSelector();
      if (!selector) selector = 'default';

      let render = function (contentType, content) {
        if (contentType === 'object/javascript') {
          let out = '';
          if (Array.isArray(content)) {
            for (var i = 0; i < content.length; i++) {
              let it = content[i];

              if (typeof block.fn === 'function') out += block.fn(it);
              else out += JSON.stringify(it);
            }
          }
          else {
            let it = content;

            if (typeof block.fn === 'function') out += block.fn(it);
            else out += JSON.stringify(it);
          }
          if (safe) out = self.Handlebars.Utils.escapeExpression(out);
          p.write(out);
          p.end();
        }
        else {
          if (safe) content = self.Handlebars.Utils.escapeExpression(content);
          p.write(content);
          p.end();
        }
      };

      let p = session.makeOutputPlaceholder();

      if (typeof path === 'string') {
        path = self.expadPath(path, context);
        context.renderResource(path, rtype, selector).then(function (rv) {
          render(rv.contentType, rv.content);
        });
      }
      else {
        render('object/javascript', path);
      }

      return p.placeholder;
    };

    //include "/path"
    //include "/path" "sel"
    //include "/path" "render/type"
    //include "/path" "render/type" "sel"

    this.Handlebars.registerHelper('include', include);
    this.Handlebars.registerHelper('include-safe', include);

    this.Handlebars.registerHelper('dump', function (block) {
      var rv = {};
      var context = block['data']?block.data.root:block;

      for (var key in context) {
        var val = context[key];
        if (key === '_') {
          rv[key] = val;
        }
        else if (typeof val !== 'object') {
          rv[key] = val;
        }
      }

      //return new Handlebars.SafeString(JSON.stringify(rv));
      return JSON.stringify(rv);
    });

  }

  protected compileTemplate(template: string): any {
    return this.Handlebars.compile(template);
  }
}
