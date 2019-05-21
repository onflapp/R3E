class Tools {
  public static reoderChildren(children, order) {
    children.sort(function (a, b) {
      let ai = order.indexOf(a.getName());
      let bi = order.indexOf(b.getName());

      return (ai - bi);
    });
  }

  // be aware of the 'resolve' flag
  // if set to false there is no guarantee metatada/content is going to be correct  
  public static visitAllChidren(res: Resource, resolve: boolean, callback) {
    let processing = 0;
    let done = function () {
      if (processing === 0) {
        callback(null);
        processing = -1;
      }
      else if (processing === -1) {
        console.log('something is wrong, we should be finished by now!');
      }
    };

    let visit_children = function (path, name, res) {
      processing++;

      res.listChildrenNames(function (names) {
        processing += names.length;

        for (var i = 0; i < names.length; i++) {
          let name = names[i];

          res.resolveChildResource(name, function (r) {
            let rpath = Utils.filename_path_append(path, name);
            let skip = callback(rpath, r);

            if (!skip) {
              visit_children(rpath, name, r);
            }

            processing--;
            done();

          }, !resolve);
        }

        processing--;
        done();
      });
    };

    visit_children('', res.getName(), res);
  }
}
