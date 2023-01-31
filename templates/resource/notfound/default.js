(function (res, writer, context) {
  //send 404 only if we are requesing this resource directly
  if (context.getCurrentRequestPath() === context.getCurrentResourcePath()) {
    context.sendStatus(404);
    writer.end();
  }
  else {
    writer.end();
  }
});
