class Tools {
  public static reoderChildren(children, order) {
    children.sort(function (a, b) {
      let ai = order.indexOf(a.getName());
      let bi = order.indexOf(b.getName());

      return (ai - bi);
    });
  }

  public static visitAllChidren(res: Resource, resolve: boolean, callback) {
    let processing = 0;
    let done = function () {
      if (processing === 0) {
        callback(null);
      }
    };

    let visit_children = function (path, name, res) {
      processing++;

      res.listChildrenNames(function (names) {
        processing--;
        processing += names.length;

        for (var i = 0; i < names.length; i++) {
          let name = names[i];

          res.resolveChildResource(name, function (r) {
            let rpath = Utils.filename_path_append(path, name);

            let skip = callback(rpath, r);
            processing--;

            if (!skip) {
              visit_children(rpath, name, r);
            }
            done();

          }, !resolve);
        }

        done();
      });
    };

    visit_children('', res.getName(), res);
  }
}
