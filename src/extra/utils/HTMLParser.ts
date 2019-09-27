class HTMLParser {
  public static parse(code) {
    if (typeof window !== 'undefined' && typeof window['jQuery'] !== 'undefined') {
      let parser = new DOMParser();
      let doc = parser.parseFromString(code, "text/html");

      //emulate cheerio with jQuery
      let jq = function (sel) {
        return window['jQuery'](sel, doc);
      };

      jq['html'] = function() {
        let ser = new XMLSerializer();
        return ser.serializeToString(doc);
      };

      return jq;
    }
    else {
      let cheerio = require('cheerio');
      return cheerio.load(code);
    }
  }
}
