class Tools {
  public static makeID(resource: Resource, name: string) {
    let sv = localStorage.getItem(name);
    let rv = resource.getProperty(name);

    let sn = Number.parseInt(sv);
    let rn = Number.parseInt(rv);

    let n = 1;
    if (sn && rn && sn > rn) n = sn;
    else if (rn) n = rn;

    n++;
    resource.values[name] = '' + n;
    localStorage.setItem(name, '' + n);
    return n;
  }

  public static reorderChildren(children, order) {
    children.sort(function (a, b) {
      return Utils.compareNames(a.getName(), b.getName());        
    });
    if (order) {
      let rv = [];
      let done = {};
      let find = function(name) {
        for (let z = 0; z < children.length; z++) {
          let it = children[z];
          if (it.getName() == name) return it;
        }
        return null;
      };

      for (let i = 0; i < order.length; i++) {
        let n = order[i];
        let c = find(n);
        if (c) {
          rv.push(c);
          done[n] = n;
        }
      }

      for (let z = 0; z < children.length; z++) {
        let it = children[z];
        let n = it.getName();
        if (!done[n]) rv.push(it);
      }

      return rv;
    }
    else {
      return children;
    }
  }

  public static exportChilrenResources(resource: Resource, level, writer: ContentWriter, incSource ? : boolean): void {
    let processingc = 0;
    let processingd = 0;
    let processingn = 0;

    //---
    let done = function () {
      if (processingc === 0 && processingd === 0 && processingn === 0) {
        writer.end(null);
      }
    };

    //---
    let export_children = function (path, name, res) {
      processingc++; //children
      processingd++; //data

      res.exportData(function (data: Data) {
        if (name) data.values[':name'] = name;
        if (path) data.values[':path'] = path;

        writer.write(data);
        processingd--; //data
        done();
      });

      res.listChildrenNames(function (names) {
        processingn += names.length; //names

        for (var i = 0; i < names.length; i++) {
          let name = names[i];

          res.resolveChildResource(name, function (r) {
            let rpath = Utils.filename_path_append(path, name);

            export_children(rpath, name, r);
            processingn--; //names
            done();
          });
        }

        processingc--; //children
        done();
      });
    };

    writer.start('object/javascript');
    export_children(incSource ? resource.getName() : '', resource.getName(), resource);
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
