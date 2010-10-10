(function($){
  var cache = {};

  function compl(str) {
    return "var p=[],print=function(){p.push.apply(p,arguments);};" +

    // Introduce the data as local variables using with(){}
    "with(arguments[0]){p.push('" +

    // Convert the template into pure JavaScript
    str
      .replace(/[\r\t\n]/g, " ")
      .split("{%").join("\t")
      .replace(/((^|%>)[^\t]*)'/g, "$1\r")
      .replace(/\t=(.*?)%\}/g, "',$1,'")
      .split("\t").join("');")
      .split("%}").join("p.push('")
      .split("\r").join("\\'")

    + "');}return p.join('');";
  }

  function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var name;
    if (str instanceof Array) {
      name = str[0];
      str = str[1];
    }

    try {
      var fn = new Function(compl(str));
      name && (cache[name] = fn);
    } catch (ex) {
      return null;
    }

    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  }

  $.tmpl = tmpl;
  tmpl.get = function (name) {
    return cache[name] || null;
  };
  tmpl.clear = function () {
    cache = {};
  }
})(jQuery);

/*
<div id="<%=id%>" class="<%=(i % 2 == 1 ? " even" : "")%>">
  <div class="grid_1 alpha right">
    <img class="righted" src="<%=profile_image_url%>"/>
  </div>
  <div class="grid_6 omega contents">
    <p><b><a href="/<%=from_user%>"><%=from_user%></a>:</b> <%=text%></p>
  </div>
</div>

<% for ( var i = 0; i < users.length; i++ ) { %>
  <li><a href="<%=users[i].url%>"><%=users[i].name%></a></li>
<% } %>

*/
