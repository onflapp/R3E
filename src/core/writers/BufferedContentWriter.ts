class BufferedContentWriter implements ContentWriter {
  private contentType: string;
  private content = [];
  private callback: any;

  constructor(callback: any) {
    this.callback = callback;
  }
  start(ctype: string) {
    this.contentType = ctype;
  }
  write(data: any) {
    this.content.push(data);
  }
  error(err: Error) {
    console.log(err);
  }
  end() {
    if (this.content.length === 0) {
      this.callback(this.contentType, null);
    }
    else if (this.contentType && Utils.is_texttype(this.contentType)) {
      this.callback(this.contentType, this.content.join(''));
    }
    else if (this.content.length == 1) {
      this.callback(this.contentType, this.content[0]);
    }
    else {
      this.callback(this.contentType, this.content);
    }
  }
}
