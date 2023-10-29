document.body.addEventListener('submit', function(evt) {
  localStorage.setItem('_res_ui_content_change_', ''+(new Date().getTime())); 
});
