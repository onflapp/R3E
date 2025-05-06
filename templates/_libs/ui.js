function fix_textarea() {
  var txt = document.querySelector('textarea');

  document.body.addEventListener('submit', function(evt) {
    localStorage.setItem('_res_ui_content_change_', ''+(new Date().getTime())); 
    var x = txt.selectionStart;
    var r = {
      cursor:x,
      scroll:txt.scrollTop,
      loc:window.location.toString()
    };
    sessionStorage.setItem('__LAST_CUR_INFO', JSON.stringify(r));
  });

  var restore_text = function() {
    var r = JSON.parse(sessionStorage.getItem('__LAST_CUR_INFO'));
    var txt = document.querySelector('textarea');
    if (txt && r && r.loc == window.location.toString()) {
      txt.selectionStart = r.cursor;
      txt.selectionEnd = r.cursor;
      txt.scrollTop = r.scroll;
    }
  };

  txt.addEventListener('keydown', function(evt) {
    if (evt.keyCode == 13) {
      var t = Math.ceil(evt.target.scrollTop);
      setTimeout(function() {
        evt.target.scrollTop = t;
      }, 1);
      evt.target.scrollTop = 0;
    }
  });

  restore_text();
}

function scroll_fix() {
  let h = window.visualViewport.height;
  document.body.style.height = h+'px';

  window.ontouchend = function(evt) {
    if (window.pageYOffset < 5) return;

    window.scrollTo(0, -1);
    setTimeout(function() {
      window.scrollTo(0, -1);
    },50);

    evt.preventDefault();
    evt.stopPropagation();
  };
}

function scroll_unfix() {
  window.scrollTo(0, -1);
  window.ontouchend = null;
  window.onscroll = null;
  document.body.style.height = null;
}

window.visualViewport.addEventListener('resize', function(evt) {
  if (window.visualViewport.height < 200) {
    document.body.classList.add('small');
  }
  else {
    document.body.classList.remove('small');
  }

  /*
  if (window.visualViewport.height < window.document.body.clientHeight) {
    window.scrollTo(0, -1);
    setTimeout(function() {
      scroll_fix();
    }, 300);
  }
  else {
    scroll_unfix();
  }
  */

});
