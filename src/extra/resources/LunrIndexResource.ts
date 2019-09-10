class LunrIndexResource extends IndexResource {
  constructor(name ? : string, base ? : string, index?: any) {
    super(name, base, index);
  }

  public searchChildrenResources(qry: string, callback) {
    let indx = this.getIndexEngine();
    let list = [];
    
    let rv = indx.search(qry);

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

  public initIndexEngine(callback) {
    let Lunr = window['lunr'];
    Lunr.tokenizer.seperator = /[\W]+/;
    let index = Lunr(function () {
      this.ref('id');
      this.field('body');
      this.field('path');
      this.field('name');

    });

    callback(index);
  }

  public indexTextData(text, callback) {
    let name = this.baseName;
    let path = this.getStoragePath();

    let id = '/'+path;
    let indx = this.getIndexEngine();

    indx.update({
      id:id,
      name:name,
      path:path,
      body:text
    });

    callback();
  }

  public removeChildResource(name: string, callback) {
    let path = this.getStoragePath(name);
    let id = '/'+path;
    let indx = this.getIndexEngine();

    indx.remove({id:id});

    callback();
  }
}
