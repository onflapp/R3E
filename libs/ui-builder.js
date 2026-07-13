Layout = {

  convertToRelative:function(el, type) {
    if (type.indexOf('w') != -1) {
      var r = el.parentElement.clientWidth - (el.offsetWidth + el.offsetLeft);
      el.style.right = r + 'px';
      el.style.left = el.offsetLeft + 'px';
      el.style.width = '';
    }
    else if (type.indexOf('r') != -1) {
      var r = el.parentElement.clientWidth - (el.offsetWidth + el.offsetLeft);
      el.style.right = r + 'px';
      el.style.width = el.clientWidth + 'px';
      el.style.left= '';
    }
    if (type.indexOf('h') != -1) {
      var b = el.parentElement.clientHeight - (el.offsetHeight + el.offsetTop);
      el.style.bottom = b + 'px';
      el.style.top = el.offsetTop + 'px';
      el.style.height = '';
    }
    else if (type.indexOf('b') != -1) {
      var b = el.parentElement.clientHeight - (el.offsetHeight + el.offsetTop);
      el.style.bottom = b + 'px';
      el.style.height = el.clientHeight + 'px';
      el.style.top = '';
    }
  },

  convertToAbsolute:function(el) {
  }
};

Builder = {
  generateItem:function(it) {
    var buff = 
    `<div class="ui_dragger-item">
      <span class="ui_dragger-handle"></span>
      <span class="ui_dragger-resizer"></span>
      <div class="sec_content">
      hello
      </div>
    </div>`;

    var div = document.createElement('div');
    div.innerHTML = buff;

    var el = div.firstChild;

    if (it.top) el.style.top = it.top + 'px';
    if (it.left) el.style.left = it.left + 'px';
    if (it.width) el.style.width = it.width + 'px';
    if (it.height) el.style.height = it.height + 'px';

    return el;
  },
  generateCanvas:function(id, list) {
    var canvas = document.getElementById(id);
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      var el = this.generateItem(it);

      canvas.appendChild(el);
    }
  }
};
