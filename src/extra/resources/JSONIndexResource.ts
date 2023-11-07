class JSONIndexResource extends IndexResource {
  constructor(name ? : string, base ? : string, index?: any) {
    super(name, base, index);
  }

  protected initIndexEngine(callback) {
    callback([]);
  }

  public searchResourceNames(qry: string, callback) {
    let list = [];
    let indx = this.getIndexEngine();
    let a = qry.split(' ');
    let words = [];
    let paths = [];
    
    for (let i = 0; i < a.length; i++) {
      let it = a[i];
      if (it.indexOf('path:') == 0) {
        paths.push(it.substr(5));
      }
      else {
        words.push(new RegExp('\\b'+it ,'i'));
      }
    }

    let matches = function(str, path) {
      let c = 0;
      if (paths.length) {
        let p = path.join('/');
        for (let i = 0; i < paths.length; i++) {
          let it = paths[i];
          if (p.indexOf(it) === 0) c++;
        }
        if (c == 0) return false;
      }
      if (words.length) {
        for (let i = 0; i < words.length; i++) {
          let it = words[i];
          if (!it.test(str)) return false;
        }
        return true;
      }
      else if (c > 0) {
        return true;
      }
      else {
        return false;
      }
    };

    let search_ob = function(path, ob) {
      let m = 0;
      for (let k in ob) {
        let v = ob[k];

        if (m == 0 && typeof v === 'string') {
          if (matches(v, path)) {
            list.push(path.join('/'));
            m++;
          }
        }
        else if (typeof v === 'object') {
          path.push(k);
          search_ob(path, v);
          path.pop();
        }
      }
    };

    for (let i = 0; i < indx.length; i++) {
      let ix = indx[i];
      search_ob([ix.name], ix.value);
    }

    callback(list);
  }

  protected indexTextData(text, callback) {
    callback();
  }

  public addObject(name: string, value: any) {
    let indx = this.getIndexEngine();
    indx.push({
      name:name,
      value:value
    });
  }

  public removeResourcesFromIndex(name: string, callback) {
    callback();
  }
}
