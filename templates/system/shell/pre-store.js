(async function (res, writer, ctx) {
  debugger;
  let command = res[':command'];
  let path = ctx.getCurrentResourcePath();
  let tx = '\n';
  let rstype = 'system/shell';
  let sel = 'edit';

  try {
    let x = eval(command);
  }
  catch(ex) {
  }

  let rv = await ctx.renderResource(path, rstype, sel);

  writer.write(rv);
  writer.end();
});
