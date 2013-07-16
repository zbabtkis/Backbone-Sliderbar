var SliderBar = (function() {
    var Model = Backbone.Model.extend({
        defaults: {
            max: 10,
            min: 0,
            viewMax: 300,
            value: 0,
            viewValue: 0,
            decimals: 0,
        },
        
        initialize: function() {
            this.on({
                'change:viewValue': this.calculateModel,
                'change:viewMax': this.responsive,
            });
        },
        
        calculateModel: function() {
            var attr = this.toJSON(),
                trueVal = (Math.abs(attr.max - attr.min) * (0 + attr.viewValue)) / Math.abs(attr.viewMax);
            
            this.set('value', trueVal.toFixed(attr.decimals));
                                    
            return this;
        },
        
        responsive: function() {
            var prevMax = this.previous('viewMax'),
                prevVal =  this.previous('viewValue'),
                currentMax = this.get('viewMax');
                        
            this.set('viewValue', currentMax * (prevVal || 1) / prevMax, {validate: true});
        },
        
        value: function(value) {
            this.set('value', value, {validate: true});
            
            var viewValue = this.get('value') * this.get('viewMax') / this.get('max');
            
            this.set('viewValue', viewValue, {validate: true});
        },
        
        validate: function(attributes) {
            if(attributes.viewValue > attributes.viewMax || attributes.value > attributes.max) {
                return "value larger than max";
            }
            if(attributes.viewValue < 0 || attributes.value < attributes.min) {
                return "value smaller than mix";
            }
        }
    });
    
    var View = Backbone.View.extend({
        tagName: 'div',
        
        events: {
            'mousemove': 'initDrag',
            'mousedown': 'mousedown',
            'mouseup': 'mouseup',
            'click': 'updatePosition',
            'selectstart': 'preventSelect'
        },
        
        defaults: {
            theme: 'theme-green',
            horizontal: true
        },
                
        className: 'slider-bar',
        
        initialize: function(options) {
            var defaults = (options && options.defaults) ? options.defaults : {};
            
            _.defaults(defaults, SliderBar._defaults);
            
            this.model = new Model(defaults);
            
            this.listenTo(this.model, 'change:viewValue', this.render);
            
            _.bindAll(this, 'respond');
            $(window).resize(this.respond);
            
            SliderBar._elements.push(this);
            
            return this;
        },
        
        render: function() {
            var dragger = $('<div class="value-bar"></div>'),
                model = this.model.toJSON(),
                val = this.isDown ? model.viewValue : model.value * model.viewMax / model.max - 7,
                defaults = _.defaults(SliderBar._options, this.defaults);
                        
            this.options = _.defaults(this.options, defaults);
                                    
            this.$el.html('')
                .append(dragger)
                .addClass(this.options.horizontal ? 'horizontal' : 'vertical')
                .addClass(this.options.theme);
            
            this.respond()
                .addTicks();
            
            if(this.options.horizontal) {
                this.$('.value-bar').css({
                    'left': val
                });
            } else {
                this.$('.value-bar').css({
                    'top': val
                });
            }
            
            if(this.dValue) {
                this.dValue.html(model.value);
                this.dValue.css('left', val);
            }
            
            return this;
        },
        
        addTicks: function() {
            for(var i = 0; i <= this.model.get('max'); i++) {
                var tick = $('<div class="tick" />');
                if(this.options.horizontal) {
                    tick.css('left', i * this.model.get('viewMax') / this.model.get('max'));
                } else {
                    tick.css('top', i * this.model.get('viewMax') / this.model.get('max'));
                }
                this.$el.append(tick);
            }
            
            return this;
        },
        
        respond: function() {
            var newSize = (this.options && this.options.horizontal) ? this.$el.width() : this.$el.height();
            this.model.set('viewMax', newSize);
                        
            return this;
        },
        
        mousedown: function() {
            this.isDown = true;
            
            if(this.options.label) {
                this.dValue  = this.dValue || $('<div class="value-display"></div>').hide();
                this.$el.before(this.dValue);
                this.dValue.fadeIn('fast');
            }
            
            return this;
        },
        
        mouseup: function() {
            this.isDown = false;
            this.render();
            
            this.dValue.fadeOut('fast');
                        
            return this;
        },
        
        initDrag: function(e) {
            if(this.isDown) {
                this.updatePosition(e);
            }
            
            return this;
        },
        
        updatePosition: function(e) {
            var newVal = (this.options.horizontal ? e.pageX - this.$el[0].offsetLeft - 5 : e.pageY - this.$el[0].offsetTop - 5);
                                    
            this.model.set('viewValue', newVal, {validate: true});
        },
        
        // Chrome fix for select cursor issue.
        preventSelect: function(e) {
            e.originalEvent.preventDefault();
                        
            return false;
        },
        
        value: function(val) {
            if(_.isNumber(val)) {
                this.model.value(val);
            } else {
                return this.model.get('value');
            }
        }
    });
    
    return View;
    
}());

SliderBar._elements = [];

SliderBar._options = {};

SliderBar._defaults = {};

SliderBar.configure = function(config) {
    _.extend(SliderBar._options, config.options);
    _.extend(SliderBar._defaults, config.defaults);
    
    return SliderBar._options;
}