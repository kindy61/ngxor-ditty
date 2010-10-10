// base on http://github.com/namelessjon/ditty

jQuery(function($) {

var tmpl;

$.ajax({
    url: 'static/ditty.tmpl',
    success: function (s) {
        tmpl = $.tmpl(s);
    },
    async: false
});

var r = $('#ditties');

// let tiddlers be closed
r.delegate('span.ditty_control a.close', 'click', function() {
    $(this).closest('.ditty').slideUp('fast', function() { $(this).remove(); });
    return false;
});

// make get links work
$("a.existing").live('click',
function() {
var tag = this;
var ditty_name = $(this).attr('title');
var ditty = $("div.ditty#" + ditty_name);
if (ditty.size() == 0) {
$.get(this, function(data, status) {
$(tag).parents('.ditty').after(data);
}); 
};
return false;
}
);

// make the editing form cancellable
$("div.ditty_edit ul.edit_links a[rel='cancel']").live('click',
function() {
$(this).parents('.ditty_edit').prev().slideDown('fast');
$(this).parents('.ditty_edit').remove();
return false;
}
);

  // make the new link work.
  $("a[href='/new']").live('click',
    function() {
      var tag = this
      $.get(this, function(data, status) {
        $('#ditties').prepend(data);
      });
      return false;
    }
  );

  // make a new link work.
  $("a.new_ditty").live('click',
    function() {
      var tag = this
      $.get(this, function(data, status) {
        $(tag).parents('.ditty').prepend(data);
      });
      return false;
    }
  );

  // make edit links work
$("div.ditty a[rel='edit']").live('click',
function() {
var tag = this;
$.get(this, function(data, status) {
$(tag).parents('.ditty').after(data);
$(tag).parents('.ditty').hide();
});
return false;
}
);

  // make delete links work
  $("div.ditty_edit a[rel='destroy']").live('click',
    function() {
      var tag = this;
      $.ajax({
        url: this,
        type: 'POST',
        timeout: 5000,
        data: {_method: 'DELETE' },
        success: function (data, status) {
          // we return the title, so!
          $("#" + data).remove();
          $("#edit_" + data ).remove();
        },
        error: function (xhr, status) {
          alert(xhr.responseText);
        }
      });
      return false;
    }
  );

  // make done links work
  $("div.ditty_edit a[rel='update']").live('click',
    function() {
      var tag = this;
      var form_data = {};
      form_data._method = 'PUT';

      // find the form
      var form = $(tag).parents('.ditty_edit').children('form');
      form_data.title = $(form).children("input[name='ditty_title']").val();
      form_data.body = $(form).children("textarea[name='ditty_body']").val();

      $.ajax({
        url: this,
        type: 'POST',
        timeout: 5000,
        data: form_data,
        success: function (data, status) {
          $(tag).parents('.ditty_edit').prev().replaceWith(data);
          $(tag).parents('.ditty_edit').remove();
        },
        error: function (xhr, status) {
          alert(xhr.responseText);
        }
      });
      return false;
    }
  );


var converter = new Showdown.converter();

var editform = $('<div class="body_form">' +
    '<form onsubmit="return false;">' +
    'Title: <input type="text" name="ditty_title" size="60" value=""> ' +
    '<input type="button" rel="new" value="save as new"> ' +
    '<input type="button" rel="preview" value="preview"> ' +
    '<input type="button" rel="edit" value="save"> ' +
    '<br> Content: <br>' +
    '<textarea name="ditty_body" class="ditty_body" rows="10"></textarea>' +
    '</form></div>');

$.fn.extend({
edit: function () {
    var bd = this.find('> .body'),
        bdh = bd.height(),
        form = editform.clone().insertAfter(bd),
        obj = this.data('obj'),
        title = form.find('input[name=ditty_title]'),
        body = form.find('textarea[name=ditty_body]');

    bd.hide();

    title.val(obj.title);
    body.val(obj.body).height(Math.max(120, bdh * 1.1));

    var saving = false;

    form.delegate('input[type=button]', 'click', function (ev) {
        var btn = $(this),
            rel = btn.attr('rel');
        switch (rel) {
        case 'new':
            alert('not impl yet!');
            break;
        case 'edit':
            btn.val(btn.val() + ' ...');
            saving = true;

            $.post('/' + rel + '/t/~?' + $.param({
                id: obj.id || 0,
                title: title.val()
            }), body.val(), function (d) {
                saving = false;
                btn.val(btn.val().replace(/ \.{3}$/, ''));
            });
            break;
        case 'preview':
            bd.html(converter.makeHtml(body.val()))
                .append('<p class="preview">' +
                    '<input type="button" rel="close-preview" value="close preview"></p>')
                .show();
            break;
        }
    });

    this.addClass('mode_edit');

    return this;
}
});

r.delegate('span.ditty_control a.edit', 'click', function () {
    $(this).closest('div.ditty').edit();
    return false;
})
.delegate('input[rel=close-preview]', 'click', function (ev) {
    $(this).closest('div.body').hide();
    return false;
});


// load default ditty
$.getJSON('/view/t/recent', function (d) {
    $.each(d, function (_, data) {
        var ditt = $(tmpl(data));
        ditt.find('> .body').html(converter.makeHtml(data.body));
        ditt.data('obj', data);
        r.append(ditt);
        ditt = null;
    });
});

}); // close ready block
