(function (res, writer, context) {
  let x = context.getConfigProperty('X');
  context.forwardRequest(context.getCurrentResourcePath()+x+'edit');
  writer.end();
});
