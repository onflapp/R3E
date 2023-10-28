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

    let matches = function(str, qry) {
      if (str.indexOf(qry) >= 0) return true;
      else return false;
    };

    let search_ob = function(path, ob) {
      for (let k in ob) {
        let v = ob[k];

        if (typeof v === 'string') {
          if (matches(v, qry)) {
            list.push(path.join('/'));
            return;
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
