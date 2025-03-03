function popupPath(type, path_ref, cb) {
  //saveFocus();

  if (type == 1) {
    window.open(path_ref, '_blank');
    if (!window.popupPathCB) window.popupPathCB = {};
    window.popupPathCB[path_ref] = cb;
    document.body.classList.add('mode_popup-visible');
  }
  else {
    let el = document.querySelector('#ui_popup');
    if (!el) {
      el = document.createElement('iframe');
      el.id = 'ui_popup';
      document.body.append(el);
      let onclick = function(evt) {
        if (document.body.classList.contains('mode_popup-visible')) {
          el.classList.remove('visible');
          document.body.classList.remove('mode_popup-visible');
          window.removeEventListener(onclick);
          evt.preventDefault();
          evt.stopPropagation();
        }
      };
      window.addEventListener('click', onclick);
    }

    el.src = path_ref;
    el.popupCB = cb;

    setTimeout(function() {
      el.classList.add('visible');
      document.body.classList.add('mode_popup-visible');
    },50);
  }
}

function getDataProperty(el, name) {    
  let val = $(el).data(name);
  if (val) return val;

  val = $(el).parents('[data-'+name+']').data(name);
  return val;
}

function submitForm(form, cb) {
  let info = handler.parseFormElement(form);
  let data = info.formData;  
  let path = info.formPath;

  if (path.indexOf('#') == -1) path = '#'+path; //force this ti be local path
  
  delete data[':forward'];
  $.post(path, data, cb);
}

$(function () {
  window.addEventListener('message', function(evt) {
    let path_ref = evt.source.location.toString();
    if (window.popupPathCB && window.popupPathCB[path_ref]) {
      Utils.flushResourceCache();
      document.body.classList.remove('mode_popup-visible');
      setTimeout(function() {
        window.popupPathCB[path_ref](evt.data);
        delete window.popupPathCB[path_ref];
        evt.source.close();
      },0);
    }
    else {
      setTimeout(function() {
        let el = $('[src="'+evt.source.location.toString()+'"]').get(0);
        if (el && el['popupCB']) {
          el.popupCB(evt.data);
          delete el['popupCB'];
        }
      },0);
    }
  });

  $(document).on('click', '.act_popup-item-sel', function(evt) {
    let item_ref = $(evt.target).data('item_ref');
    if (!item_ref) item_ref = $(evt.target).parents('[data-item_ref]').data('item_ref');

    if (item_ref) {
      if (window.top != window) {
        window.top.postMessage(item_ref, window.location);
      }
      else if (window.opener != window) {
        window.opener.postMessage(item_ref, window.location);
      } 
    }
    evt.preventDefault();
  });

  $(document).on('click', '.act_popup-show', function(evt) {
    evt.preventDefault();

    let $el = $(evt.target);
    let path = $(evt.target).data('path');
    let href = $(evt.target).attr('href');
    let name = $(evt.target).attr('name');
    let $form = $(evt.target).parents('form');
    let $main = $('#main_data_form');

    if (!path && href) path = href;

    popupPath(0, path, function(item) {
      Utils.flushResourceCache();
      $el.val(item);
      if ($main.length) {
        submitForm($main.get(0), function() {
          Utils.flushResourceCache();
          $form.trigger('submit');
        });
      }
      else {
        $form.trigger('submit');
      }
    });
  });
});
