(function (res, writer, ctx) {
  var Handlebars = res.Handlebars;
  
/*
 * path "."
 * path "/content" "res-list"
 * APP_PREFIX for client side
 */

  var path_func = function () {
    var args = arguments;
    var context = args[args.length-1].data.root;
    var rv = [];
    var i = 0;

    if (context.C['APP_PREFIX']) rv.push(context.C['APP_PREFIX']);
    if (context.C['P']) rv.push(context.C['P']);

    for (;i < (args.length-1); i++) {
      var p = args[i];
      if (i == 0) {
        if (p == '.') p = context.R['PATH'];
        else p = Utils.absolute_path(p, context.R['PATH']);
      }
      else if (args.length > 2 && i == args.length-2) {
        if (p !== '' && p.indexOf('.') === -1 && context.C['X']) rv.push(context.C['X']);
      }
      rv.push(p);
    }

    if (args.length == 2) {
      if (context.R['SELECTOR']) {
        rv.push(context.C['X']);
        rv.push(context.R['SELECTOR']);
        if (context['Q']) {
          i = 0;
          for (var k in context['Q']) {
            if (i == 0) rv.push('?');
            else rv.push('&');
            var v = context['Q'][k];
            rv.push(escape(k));
            rv.push('=');
            rv.push(escape(v));
          }
        }
      }
    }

    return rv.join('');
  };

  var include_paths = function (tag, paths, block) {
    var context = block.data.root._context;
    var session = block.data.root._session;
    var p = session.makeOutputPlaceholder();

    var render_content = function(path) {
      context.resolveTemplateResourceContent(path).then(function(buff) {
        p.write(buff);

        var pp = paths.shift();
        if (pp) render_content(pp);
        else {
          p.write('</'+tag+'>');
          p.end();
        }
      });
    };

    p.write('<'+tag+'>');
    render_content(paths.shift());

    return p.placeholder;
  };

  Handlebars.registerHelper('ref_path', function () {
    var context = arguments[arguments.length-1].data.root;
    var refurl = context.R['REF_URL'];

    if (refurl) return refurl;
    else return path_func.apply(this, arguments);
  });

  Handlebars.registerHelper('req_path', path_func);

  Handlebars.registerHelper('res_path', function () {
    var args = arguments;
    var context = args[args.length-1].data.root;
    var rv = [];
    var i = 0;

    for (;i < (args.length-1); i++) {
      var p = args[i];
      rv.push(p);
    }

    var p = rv.join('/');
    return Utils.absolute_path(p, context.R['RES_PATH']);
  });

  Handlebars.registerHelper('reset', function (type, name, val) {
    if (arguments.length > 3) {
      var root = arguments[arguments.length-1].data.root;
      var context = root._context;

      if (type == 'Q') {
        if (!context.pathInfo['query']) context.pathInfo['query'] = {};
        context.pathInfo['query'][name] = val;
      }
      else if (type == 'R') {
        if (name == 'SELECTOR') {
          context.pathInfo['selector'] = val;
          root['R']['SELECTOR'] = val;
        }
      }
      else if (type == 'S') {
        root['S'][name] = val;
      }
    }
    return '';
  });

/*
 * return first not emoty argument
 */

  Handlebars.registerHelper('or', function () {
    var args = arguments;

    for (var i = 0; i < args.length-1; i++) {
      if (args[i] !== null && args[i] !== undefined) return args[i];
    }
    return '';
  });

/*
 * if all arguments are non-empty, return return last argument
 */

  Handlebars.registerHelper('and', function () {
    var args = arguments;

    for (var i = 0; i < args.length-1; i++) {
      if (!args[i]) return '';
    }

    return args[args.length-2];
  });

  Handlebars.registerHelper('val', function () {
    var args = arguments;

    if (!args[0]) return null;
    else return args[1].replace('%s', args[0]);
  });


  Handlebars.registerHelper('eq', function (lvalue, rvalue, result, options) {
    if (lvalue === rvalue) return result;
    else return null;
  });

  /************************************************************************

  {{#match Database.Tables.Count ">" 5}}
  There are more than 5 tables
  {{/match}}

  {{#match "Test" "Test"}}
  Default comparison of "==="
  {{/match}}

   ************************************************************************/

  Handlebars.registerHelper('match', function (lvalue, operator, rvalue, options) {
    var operators = null;
    var result = null;

    if (arguments.length < 3) {
      if (lvalue) {
        operator.data.root._match_rval = true;
        return operator.fn(this);
      }
      else return operator.inverse(this);
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

  Handlebars.registerHelper('default', function (options) {
    var result = false;

    if (options.data.root._match_rval) result = true;
    delete options.data.root._match_rval;

    if (!result) return options.fn(this);
    else return options.inverse(this);
  });

  Handlebars.registerHelper('trace', function () {
    var block = arguments[arguments.length-1];
    var args = [];
    var renpath = null;
    var respath = null;
    for (var i = 0; i < arguments.length-1; i++) {
      var it = arguments[i];
      if (typeof it === 'string') {
        args.push(it);
      }
      else {
        var rv = {};
        for (var key in it) {
          var val = it[key];
          if (key === '_context') continue;
          if (key === '_session') continue;
      
          rv[key] = val;
        }

        args.push(JSON.stringify(rv, null, 2));
      }
    }

    if (block && block['data'] && block['data']['root']) {
      var ctx = block['data']['root']['_context'];
      renpath = Utils.get_trace_path(ctx['traceRenderInfo']);
      respath = Utils.get_trace_path(ctx['currentResource']);

      if (renpath) args.push('ren:'+renpath);
      if (respath) args.push('res:'+respath);
    }

    var txt = '<!-- '+args.join(' ')+' -->';
    return new Handlebars.SafeString(txt);
  });

  Handlebars.registerHelper('include_css', function () {
    if (arguments.length < 2) return ''

    var block = arguments[arguments.length-1];
    var args = [];
    for (var i = 0; i < arguments.length-1; i++) {
      args.push(arguments[i]);
    }

    return include_paths.apply(this, ['style', args, block]);
  });

  Handlebars.registerHelper('include_js', function () {
    if (arguments.length < 2) return ''

    var block = arguments[arguments.length-1];
    var args = [];
    for (var i = 0; i < arguments.length-1; i++) {
      args.push(arguments[i]);
    }

    return include_paths.apply(this, ['script', args, block]);
  });

  Handlebars.registerHelper('dump', function (block) {
    if (!block) return '';
    var rv = {};
    var context = block['data']?block.data.root:block;

    for (var key in context) {
      var val = context[key];
      if (key === '_context') continue;
      if (key === '_session') continue;
      
      rv[key] = val;
    }

    return JSON.stringify(rv, null, 2);
  });

  writer.end();
});
