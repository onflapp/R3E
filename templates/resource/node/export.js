(function (res, writer, context) {
  let out = writer;
  let processing = 0;
  let ended = false;
  let count = 0;
  let path = context.getCurrentDataPath();

  let export_content = function (data) {
    let func = data['_content'];
    let ct = data['_ct'];
    let bin = true;

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

  let done = function () {
    if (processing === 0 && ended) {
      out.write('\n]');
      out.end();
      if (out !== writer) writer.end();
    }
  };

  let export_children = function () {
    let path = res['path'];
    context.exportAllResources(path, 0, {
      start: function (ctype) {
        out.start('application/package-json');
        out.write('[\n');
      },
      write: function (data) {

        if (data.values['_content']) {
          processing++;
          export_content(data.values); //might contain func!
        }
        else {
          if (count > 0) out.write('\n,\n');
          out.write(JSON.stringify(data.getValues(), null, 2));
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
    context.resolveResource(path).then(function(ores) {
      if (ores) {
        out = ores.getWriter();
        export_children();
      }
      else {
        context.storeAndResolveResource(path, {'_content':''}).then(function(ores) {
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
