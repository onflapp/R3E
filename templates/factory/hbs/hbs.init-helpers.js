(function (res, writer, context) {
  var Handlebars = res.values.Handlebars;
  
  var path_func = function () {
    var args = arguments;
    var context = args[args.length-1].data.root;
    var last = args[args.length-2];
    var rv = [];
    var i = 0;

    if (context.C['P']) rv.push(context.C['P']);

    for (;i < (args.length-2); i++) {
      rv.push(args[i]);
    }

    if (last && last.indexOf('.') === -1 && context.C['X']) rv.push(context.C['X']);

    rv.push(last);

    return rv.join('');
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
      rv.push(args[i]);
    }

    return rv.join('');
  });

  Handlebars.registerHelper('or', function () {
    var args = arguments;

    for (var i in args) {
      if (args[i] !== null && args[i] !== undefined) return args[i];
    }
  });

  Handlebars.registerHelper('val', function () {
    var args = arguments;

    if (!args[0]) return null;
    else return args[1].replace('%s', args[0]);
  });

  Handlebars.registerHelper('and', function () {
    var args = arguments;

    for (var i in args) {
      if (args[i]) return args[i+1];
    }

    return null;
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

  writer.end();
});
