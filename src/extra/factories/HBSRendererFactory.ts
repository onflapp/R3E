class HBSRendererFactory extends TemplateRendererFactory {
  protected Handlebars = null;

  constructor() {
    super();

    if (typeof window !== 'undefined' && window['Handlebars']) this.Handlebars = window['Handlebars'];
    else this.Handlebars = require('handlebars');

    let self = this;

    //include "/path"
    //include "/path" "sel"

    let include = function (arg0, arg1) {
      let path = arg0;
      let block = arg1;
      let selector = null;
      let rtype = null;

      if (arguments.length == 3) {
        selector = arguments[1];
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

      path = self.expadPath(path, context);

      let p = session.makeOutputPlaceholder();

      context.renderResource(path, rtype, selector, context, function (contentType, content) {
        if (contentType === 'object/javascript') {
          let out = '';
          if (Array.isArray(content)) {
            for (var i = 0; i < content.length; i++) {
              let it = content[i];
              out += block.fn(it);
            }
          }
          else {
            let it = content;
            out = block.fn(it);
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
      });
      return p.placeholder;
    };

    //include "/path"
    //include "/path" "sel"

    this.Handlebars.registerHelper('include', include);
    this.Handlebars.registerHelper('include-safe', include);

    this.Handlebars.registerHelper('p', function (val, options) {
      if (typeof val === 'object') {
        return JSON.stringify(val);
      }
      else {
        return val;
      }
    });

    this.Handlebars.registerHelper('or', function () {
      var args = arguments;

      for (var i in args) {
        if (args[i] !== null && args[i] !== undefined) return args[i];
      }
    });

    this.Handlebars.registerHelper('eq', function (lvalue, rvalue, result) {
      if (lvalue === rvalue) return result;
      else return null;
    });

    this.Handlebars.registerHelper('prop', function (path, block) {
      let context: ResourceRequestContext = block.data.root._context;
      let session: TemplateRendererSession = block.data.root._session;

      if (path.charAt(0) !== '/') path = self.expadPath(path, context);

      let name = Utils.filename(path);
      let base = Utils.filename_dir(path);

      let p = session.makeOutputPlaceholder();
      context.resolveResource(base, function (res: Resource) {
        if (res) {
          let val = res.getProperty(name);
          p.write(val ? val : '');
          p.end();
        }
        else {
          p.write('non');
          p.end();
        }
      });

      return new self.Handlebars.SafeString(p.placeholder);
    });

    /************************************************************************

    {{#match Database.Tables.Count ">" 5}}
    There are more than 5 tables
    {{/match}}

    {{#match "Test" "Test"}}
    Default comparison of "==="
    {{/match}}

     ************************************************************************/

    this.Handlebars.registerHelper('match', function (lvalue, operator, rvalue, options) {
      let operators = null;
      let result = null;

      if (arguments.length < 3) {
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
      }

      if (options === undefined) {
        options = rvalue;
        rvalue = operator;
        operator = "===";
      }

      operators = {
        '==': function (l, r) {
          return l == r;
        },
        '===': function (l, r) {
          return l === r;
        },
        '!=': function (l, r) {
          return l != r;
        },
        '!==': function (l, r) {
          return l !== r;
        },
        '<': function (l, r) {
          return l < r;
        },
        '>': function (l, r) {
          return l > r;
        },
        '<=': function (l, r) {
          return l <= r;
        },
        '>=': function (l, r) {
          return l >= r;
        },
        'startsWith': function (l, r) {
          if (l && l.indexOf(r) === 0) return true;
          else return false;
        },
        '!startsWith': function (l, r) {
          if (l && l.indexOf(r) === 0) return false;
          else return true;
        },
        'typeof': function (l, r) {
          return typeof l == r;
        }
      };

      if (!operators[operator]) {
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
      }

      result = operators[operator](lvalue, rvalue);
      if (result) options.data.root._match_rval = true;

      if (result) return options.fn(this);
      else return options.inverse(this);
    });


    this.Handlebars.registerHelper('default', function (options) {
      let result = false;

      if (options.data.root._match_rval) result = true;
      delete options.data.root._match_rval;

      if (!result) return options.fn(this);
      else return options.inverse(this);
    });

    this.Handlebars.registerHelper('dump', function (block) {
      var rv = {};
      var context = block.data.root;

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

  protected compileTemplate(template: string): string {
    return this.Handlebars.compile(template);
  }
}
