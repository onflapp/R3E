(async function (res, writer, ctx) {
  writer.start('object/javascript');

  let children = await ctx.listResources('.');

  writer.write(children);
})
