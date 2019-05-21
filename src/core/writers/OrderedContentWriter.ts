class OrderedContentWriter implements ContentWriter {
  protected contentQueue: Array < any > ;
  protected contentType: string;
  protected instances = 0;
  protected parentWriter;
  protected delegateWriter: ContentWriter;

  constructor(delegate: ContentWriter) {
    this.contentQueue = new Array();
    this.delegateWriter = delegate;
  }

  public makeNestedContentWriter(): ContentWriter {
    let p = this.parentWriter ? this.parentWriter : this;
    let w = new OrderedContentWriter(null);
    w.parentWriter = p;
    this.contentQueue.push(w);

    p.instances++;
    return w;
  }

  public write(content) {
    this.contentQueue.push(content);
  }

  public start(contentType) {
    let p = this.parentWriter ? this.parentWriter : this;
    if (contentType && !p.contentType) p.contentType = contentType;
  }

  public error(err) {
    console.log(err);
  }

  public end() {
    let p = this.parentWriter ? this.parentWriter : this;

    if (p.instances > 0) {
      p.instances--;
    }
    else if (p.instances == 0) {
      p.endAll();
    }
  }

  protected endAll() {
    let delegate = this.delegateWriter;
    if (!delegate) return;

    let writeOutQueue = function (writer) {
      if (writer.contentQueue) {
        for (var i = 0; i < writer.contentQueue.length; i++) {
          var content = writer.contentQueue[i];

          if (content instanceof OrderedContentWriter) {
            writeOutQueue(content);
          }
          else {
            delegate.write(content);
          }
        }
      }
      //clear references, helps with garbage collection
      writer.parentWriter = null;
      writer.contentQueue = new Array();
      writer.contentType = null;
    };

    delegate.start(this.contentType);
    writeOutQueue(this);
    setTimeout(function () {
      delegate.end(null);
    });
  }
}
