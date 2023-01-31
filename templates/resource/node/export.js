(function (res, writer, context) {
  var out = writer;
  var processing = 0;
  var ended = false;
  var count = 0;
  var path = context.getCurrentDataPath();

  var export_content = function (data) {
    var func = data['_content'];
    var ct = data['_ct'];
    var bin = true;

    if (Utils.is_texttype(ct)) bin = false;

    func(new ContentWriterAdapter(bin ? null : 'utf8', function (buff) {

      if (bin) {
        data['_ct'] = 'base64:' + (ct ? ct : '');
        data['_content'] = Utils.ArrayBuffer2base64(buff);
      }
      else data['_content'] = buff;

      if (count > 0) out.write('\n,\n');
      out.write(JSON.stringify(data, null, 2));

      processing--;
      done();
    }));
  };

  var done = function () {
    if (processing === 0 && ended) {
      out.write('\n]');
      out.end();
      if (out !== writer) writer.end();
    }
  };

  var export_children = function () {
    res.exportChilrenResources(0, {
      start: function (ctype) {
        out.start('application/json');
        out.write('[\n');
      },
      write: function (data) {

        if (data.values['_content']) {
          processing++;
          export_content(data.values);
        }
        else {
          if (count > 0) out.write('\n,\n');
          out.write(JSON.stringify(data.values, null, 2));
        }
        count++;
      },
      error: function (err) {
        console.log(err);
      },
      end: function () {
        ended = true;
        done();
      }
    }, true);
  };

  if (path) {
    context.resolveResource(path, function(ores) {
      if (ores) {
        out = ores.getWriter();
        export_children();
      }
      else {
        context.storeAndResolveResource(path, {'_content':''}, function(ores) {
          out = ores.getWriter();
          export_children();
        });
      }
    });
  }
  else {
    export_children();
  }

});
