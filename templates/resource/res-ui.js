document.body.addEventListener('submit', function(evt) {
  localStorage.setItem('_res_ui_content_change_', ''+(new Date().getTime())); 
  var txt = document.querySelector('textarea');
  var x = txt.selectionStart;
  sessionStorage.setItem('__LAST_CUR_POS', ''+x);
});

function restore_text() {
  var x = sessionStorage.getItem('__LAST_CUR_POS');
  var txt = document.querySelector('textarea');
  if (x && txt) {
    txt.selectionStart = parseInt(x);
    txt.selectionEnd = parseInt(x);
  }
}
