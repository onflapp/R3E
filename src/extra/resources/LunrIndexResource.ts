class LunrIndexResource extends IndexResource {
  constructor(name ? : string, base ? : string, index?: any) {
    super(name, base, index);
  }

  protected makeIndex(callback) {
    let elasticlunr = window['elasticlunr'];

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

  protected initIndexEngine(callback) {
    this.makeIndex(function(index) {
      callback(index);
    });
  }

  public searchResourceNames(qry: string, callback) {
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
        list.push(ref);
      }
    }

    callback(list);
  }

  protected indexTextData(text, callback) {
    let name = this.baseName;
    let path = this.getStoragePath();

    let id = path;
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
    let id = path;
    let indx = this.getIndexEngine();

    indx.removeDoc({'id':id});

    callback();
  }

  public saveIndexAsJSON() : string {
    let indx = this.getIndexEngine();
    if (indx) return JSON.stringify(indx.toJSON());
    else return null;
  }
}
