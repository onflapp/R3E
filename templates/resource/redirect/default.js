(function (res, writer, context) {
  let rurl = res._['redirect'];
  if (rurl && context.getCurrentRequestPath() === context.getCurrentResourcePath()) {
    let pref = context.getConfigProperty('APP_PREFIX');
    if (pref) rurl = pref + rurl;

    context.forwardRequest(rurl);
    writer.end();
  }
  else {
    writer.end();
  }
});
