class LunrIndexResource extends IndexResource {
  constructor(name ? : string, base ? : string, index?: any) {
    super(name, base, index);
  }

  protected restoreIndex(elasticlunr: any, callback) {
    callback();
  }

  protected makeIndex(elasticlunr: any, callback) {
    elasticlunr.tokenizer.setSeperator(/[\W]+/);
    let index = elasticlunr(function () {
      this.setRef('id');
      this.addField('body');
      this.addField('path');
      this.addField('name');
      this.saveDocument(false);

    });
    callback(index);
  } 

  public initIndexEngine(callback) {
    let self = this;
    let elasticlunr = window['elasticlunr'];

    if (this.getIndexEngine()) {
      self.makeIndex(elasticlunr, callback);
    }
    else {
      self.restoreIndex(elasticlunr, function(index) {
        if (index) {
          callback(index);
        }
        else {
          self.makeIndex(elasticlunr, callback);
        }
      });
    }
  }

  public searchResources(qry: string, callback) {
    let indx = this.getIndexEngine();
    let list = [];
    let opts = {
      expand: true,
      bool: "AND"
    };
    
    let rv = indx.search(qry, opts);

    for (let i = 0; i < rv.length; i++) {
      let doc = rv[i];
      let ref = doc['ref'];
      let score = doc['score'];
      if (score > 0) {
        let res = new ObjectResource({'reference':ref, 'score':doc['score']}, ref);
        list.push(res);
      }
    }

    callback(list);
  }

  public indexTextData(text, callback) {
    let name = this.baseName;
    let path = this.getStoragePath();

    let id = '/'+path;
    let indx = this.getIndexEngine();
    let doc = {
      id:id,
      name:name,
      path:path,
      body:text
    };

    indx.removeDoc(doc);
    indx.addDoc(doc);

    callback();
  }

  public removeResourcesFromIndex(name: string, callback) {
    let path = this.getStoragePath(name);
    let id = '/'+path;
    let indx = this.getIndexEngine();

    indx.removeDoc({id:id});

    callback();
  }

  public saveIndexAsJSON() : string {
    let indx = this.getIndexEngine();
    return indx.toJSON();
  }
}
