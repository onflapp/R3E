(async function (res, writer, ctx) {
  let command = res[':command'];
  let path = ctx.getCurrentResourcePath();
  let rstype = 'resource/node';
  let sel = 'res-shell';
  let out = "";

  try {
    let x = eval(command);
    out += x;
  }
  catch(ex) {
    out += ex;
  }

  let rv = await ctx.renderResource(path, rstype, sel);
  if (rv) {
    rv.content = rv.content.replace('XXX', ':' + out);
    writer.write(rv);
  }
  writer.end();
});
