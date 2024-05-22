(function (res, writer, ctx) {
  let command = res[':command'];
  let path = ctx.getCurrentResourcePath();
  let rstype = 'resource/node';
  let sel = 'res-shell';

  let write_content = function(rv, out) {
    let t = '';
    if (!out) {
      t = '';
    }
    else if (Array.isArray(out)) {
      t = out.join('\n');
    }
    else {
      t = '' + out;
    }
    
    rv.content = rv.content.replace('XXX', command + '\n'+t);
    writer.write(rv);
    writer.end();
  };

  ctx.renderResource(path, rstype, sel).then(function(rv) {
    try {
      let x = eval(command);
      if (Object.getPrototypeOf(x) == Promise.prototype) {
        x.then(function(out) {
          write_content(rv, out);
        });
      }
      else {
        write_content(rv, x);
      }
    }
    catch(ex) {
      write_content(rv, ex);
    }
  });
});
