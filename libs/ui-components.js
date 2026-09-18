SortedTable = {
  filterTable:function(item_ref) {
    let $table = $(this);
    if (item_ref) {
      let $tr = $table.find(`[data-item_ref=${item_ref}]`).parents('tr');
      $table.find('tr').hide();
      $tr.show();
    }
    else {
      $table.find('tr').show();
    }
  },

  searchTable:function(text) {
    let $table = $(this);
    if (text) {
      $table.find('tbody tr').each(function(n, tr) {
        let $tr = $(tr);
        let line = $tr.text();
        if (line.indexOf(text) > 0) {
          $tr.show();
        }
        else {
          $tr.hide();
        }
      });
    }
    else {
      $table.find('tr').show();
    }
  },

  groupTable:function(group_ref) {
    let $table = $(this);
    $table.find('td,th').show();

    if (group_ref) {
      let rows = [];
      let groups = [];

      $table.find(`tbody td[data-group_ref=${group_ref}]`).each(function(n, it) {
        let tr = it.parentElement;
        tr.item_title = it.innerText;
        tr.item_html = it.innerHTML;

        if (it.classList.contains('archived')) {
          tr.item_archived = true;
        }

        if (tr.item_title == '') {
          tr.item_title = tr.item_html = '000Untitled';
          tr.item_class = 'untitled';
        }

        rows.push(tr);
      });

      rows.sort(function(a, b) {
        return a.item_title.localeCompare(b.item_title);
      });

      let last = null;
      rows.forEach(function(it) {
        if (it.item_title != last) {
          let n = it.children.length - 1;
          let el = document.createElement('tr');
          el.classList.add('sec_group-heading');
          el.classList.add('act_drop');
          el.dataset['group_ref'] = group_ref;
          el.innerHTML = '<td colspan="'+n+'"><h3>'+it.item_html+'</h3></td>';

          if (it.item_archived) el.classList.add('archived');
          if (it.item_class) el.classList.add(it.item_class);

          groups.push(el);
        }
        groups.push(it);
        last = it.item_title;
      });

      $table.find(`td[data-group_ref=${group_ref}]`).hide();
      $table.find(`th[data-group_ref=${group_ref}]`).hide();
      $table.find('tbody').empty().append(groups);
    }
    else {
    }
  },

  sortTable:function(group_ref) {
    let $table = $(this);
    if (group_ref) {
      let rows = [];

      $table.find(`tbody td[data-group_ref=${group_ref}]`).each(function(n, it) {
        let tr = it.parentElement;
        tr.item_title = it.innerText;
        rows.push(tr);
      });

      rows.sort(function(a, b) {
        return a.item_title.localeCompare(b.item_title);
      });

      $table.find('tbody').empty().append(rows);
    }
    else {
    }
  },

  restore:function() {
    if (this.template) {
      this.innerHTML = this.template;
    }
  },

  init:function() {
    let ls = document.getElementsByClassName("ui_sorted-table");
    for (let i = 0; i < ls.length; i++) {
      let it = ls[i];

      //merge our functions to real table
      for (let k in SortedTable) {
        it[k] = SortedTable[k];
      }
      it.template = it.innerHTML;

      let group_by = it.dataset['group_by'];
      let sort_by = it.dataset['sort_by'];
      if (sort_by) {
        it.sortTable(sort_by);
      }
      if (group_by) {
        it.groupTable(group_by);
      }
    }
  }
};

TextField = {
  autoSizeTextarea:function(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight+2+'px';
  },

  init:function() {
    let ls = document.getElementsByClassName("ui_text-field");
    for (let i = 0; i < ls.length; i++) {
      let el = ls[i];
      TextField.autoSizeTextarea(el);
      el.addEventListener('input', function(evt) {
        TextField.autoSizeTextarea(el);
      });
      window.addEventListener('resize', function(evt) {
        TextField.autoSizeTextarea(el);
      });
    }
  }
};

Highlighter = {
  makeFG:function(bgColor, lightColor, darkColor) {
    let color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    let r = parseInt(color.substring(0, 2), 16); // hexToR
    let g = parseInt(color.substring(2, 4), 16); // hexToG
    let b = parseInt(color.substring(4, 6), 16); // hexToB
    let uicolors = [r / 255, g / 255, b / 255];
    let c = uicolors.map((col) => {
      if (col <= 0.03928) {
        return col / 12.92;
      }
      return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    let L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
    return (L > 0.179) ? darkColor : lightColor;
  },

  init:function() {
    $('[data-item_style]').each(function(n, it) {
       if (it.dataset['item_style']) {
         let color = it.dataset.item_style;
         let fg = Highlighter.makeFG(color, '#FFFFFF', '#000000');
         it.style.backgroundColor = color;
         it.style.color = fg;
       }
    });
  }
};

DraggableList = {
  commitChanges:function(drag, cb) {
    if (drag.action_move) {
      for (let i = 0; i < drag.action_move.length; i++) {
        let it = drag.action_move[i];
        let url = '#' + it.from;
        let forward = document.body.dataset['base_url'];
        let opts = {':moveto':it.to};

        submitDataAsync(opts, url, function() {
          if (cb) cb();
        });
      }
    }
  },
  init:function() {
    $('.ui_draggable-list').dragger({
      ondropped:function(source, pos, destination) {
        let f = source.dataset['item_ref'];
        let t = destination.dataset['item_ref'];

        if (pos == 'over') {
          t = t + '/' + Utils.filename(f);
        }
        else if (pos == 'after') {
          t = Utils.filename_dir(t) + '/' + Utils.filename(f);
        }

        if (f == t) {
          cosole.log('is the same file:' + f);
          return false;
        }

        this.action_move = [];
        this.action_move.push({
          position:pos,
          from:f,
          to:t
        });
            
        //over / after
        //to be overridden
        return true;
      },

      onfinish:function(success) {
        if (success) {
          DraggableList.commitChanges(this, function() {
            window.location.reload();
          });
        }
        console.log(success);
      }
    });
  }
}

DropZone = {

  _dropZone:function(target) {
    if (target.classList.contains('ui_drop-zone')) {
      return target;
    }
    else {
      let p = target.parentElement;
      while (p) {
        if (p.classList.contains('ui_drop-zone')) return p;
        p = p.parentElement;
      }
    }
  },

  _localDate:function(val) {
    var d = new Date(val);
    return d.toISOString().slice(0, 16);
  },

  _eventInfo:function(evt) {
    if (evt.targetTouches && evt.targetTouches.length) {
      var t = evt.targetTouches[0];
      return {
        timestamp:evt.timeStamp,
        pageX:t.pageX,
        pageY:t.pageY
      };
    }
    else {
      return {
        timestamp:evt.timeStamp,
        pageX:evt.pageX,
        pageY:evt.pageY
      };
    }
  },

  _updateForm:function(drop_zone, files, urls, text) {
    var fl_form = drop_zone.querySelector('input[type=file]');
    var tx_form = drop_zone.querySelector('input[type=text]');
    var ta_form = drop_zone.querySelector('textarea');

    if (files.length > 0 && fl_form) {
      fl_form.files = files;
      var fn = drop_zone.querySelector('input[name=filename]');
      if (fn) fn.value = files[0].name;

      var fd = drop_zone.querySelector('input[name=modified]');
      if (fd) fd.value = this._localDate(files[0].lastModified);
    }
    else if (urls && tx_form)        tx_form.value = urls;
    else if (text && tx_form)        tx_form.value = text;
    else if (urls && ta_form)        ta_form.value = urls;
    else if (text && ta_form)        ta_form.value = text;
  },

  onDrop:function(evt) {
    var drop_zone = this._dropZone(evt.target);
    var dt = evt.dataTransfer;
    var files = dt.files;
    var urls = dt.getData('text/uri-list');
    var text = dt.getData('text/plain');

    this._updateForm(drop_zone, files, urls, text);

    drop_zone.classList.remove('selected');

    evt.dataTransfer.dropEffect = 'copy';
    evt.preventDefault();
    evt.stopPropagation();
  },

  onDragOver:function(evt) {
    evt.dataTransfer.dropEffect = 'copy';
    evt.preventDefault();
    evt.stopPropagation();
  },

  onDragEnter:function(evt) {
    var drop_zone = this._dropZone(evt.target);
    if (drop_zone) drop_zone.classList.add('selected');
    
    evt.dataTransfer.dropEffect = 'copy';
    evt.preventDefault();
    evt.stopPropagation();
  },

  onDragLeave:function(evt) {
    var drop_zone = this._dropZone(evt.target);
    if (evt.target.classList.contains('ui_drop-zone')) {
      drop_zone = evt.target;
    }
    else {
      let p = evt.target.parentElement;
      while (p) {
        if (p.classList.contains('ui_drop-zone')) drop_zone = p;
        p = p.parentElement;
      }
    }

    var ei = this._eventInfo(evt);
    var r = drop_zone.getBoundingClientRect();
    var outside = false;

    if      (ei.pageY < r.top) outside = true;
    else if (ei.pageY > r.top+r.height-2) outside = true;
    else if (ei.pageX < r.left) outside = true;
    else if (ei.pageX > r.left + r.width-2) outside = true;

    if (outside) evt.target.classList.remove('selected');

    evt.preventDefault();
    evt.stopPropagation();
  },

  onChange:function(evt) {
    var drop_zone = this._dropZone(evt.target);
    var files = evt.target.files;

    this._updateForm(drop_zone, files, null, null);
  },

  init:function() {
    let self = this;
    let ignore = function(evt) {
      evt.preventDefault();
      evt.stopPropagation();
    };

    document.querySelectorAll('.ui_drop-zone').forEach(function(it) {
      it.addEventListener('dragover', self.onDragOver.bind(self), false);
      it.addEventListener('dragenter', self.onDragEnter.bind(self), false);
      it.addEventListener('dragleave', self.onDragLeave.bind(self), false);
      it.addEventListener('drop', self.onDrop.bind(self), false);
    });

    document.querySelectorAll('.ui_drop-zone input[type=file]').forEach(function(it) {
      it.addEventListener('change', self.onChange.bind(self), false);
    });

    document.addEventListener('dragenter', ignore);
    document.addEventListener('dragover', ignore);
    document.addEventListener('drop', ignore);
  }
}
