// Generated by CoffeeScript 1.7.1
(function() {
  var Slider;

  Slider = (function() {
    function Slider(elem, text, steps, callback) {
      this.steps = steps;
      this.slider = $(elem).slider({
        animate: true,
        min: 0,
        max: this.steps.length - 1,
        value: 1,
        slide: (function(_this) {
          return function(event, ui) {
            var v;
            v = _this.steps[ui.value];
            $(text).val(v);
            return callback(v);
          };
        })(this)
      });
    }

    Slider.prototype.set_slider = function(v) {
      var set_i;
      set_i = 0;
      $.each(this.steps, function(i, v2) {
        if (v2 <= v) {
          return set_i = i;
        }
      });
      return this.slider.slider("value", set_i);
    };

    return Slider;

  })();

  window.Slider = Slider;

}).call(this);
