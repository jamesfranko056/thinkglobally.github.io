$(function(){


  var setInputSize = function() {

    var inputArray = $('.input-regular');

    for (var i=0;i<inputArray.length;i++){
      var input = inputArray[i],
          placeholder = $(input).attr('placeholder'),
          fontSize = $(input).css('fontSize'),
          form = $(input).closest('.email-form'),
          copy = $(document.createElement('span')).text(placeholder).css({'fontSize': fontSize, 'opacity': 0, 'height': 0, 'padding': '0 12px 0', 'border': '2px solid transparent',  'display': 'inline-block', 'font-family': 'wf_segoe-ui_light, helvetica, arial, sans-serif'
}).attr('id', ('input'+i) );

          if ( $(form).attr('id') === 'footer-email-form' ){
            $(copy).css('padding', '0 10px 0');
          }

      $('#input'+i).detach();
      $(form).append(copy);
      var width = $(copy).css('width');
      $(input).css('width', (parseInt(width))+'px' ); //(parseInt(width)+4)+'px'

    }

  }

  setInputSize();

  $(window).resize(function(){
    setInputSize();
  });


});
