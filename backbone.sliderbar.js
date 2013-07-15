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
                'change:value': this.calculateView
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
                        
            this.set('viewValue', currentMax * (prevVal || 1) / prevMax);
        },
        calculateView: function() {
            var attr = this.toJSON();
            
            var viewValue = attr.value * attr.viewMax / attr.max;
            
            this.set('viewValue', viewValue);
        },
        validate: function(attributes) {
            if(attributes.viewValue > attributes.viewMax) {
                return "value larger than max";
            }
            if(attributes.viewValue < 0) {
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
            'click': 'updatePosition'
        },
        options: {
            theme: 'theme-green',
            horizontal: true
        },
        className: 'slider-bar',
        initialize: function(options) {
            if(options && options.model) {
                this.model = (Model.extend(model))();
            } else if(options && options.defaults) {
                this.model = new Model();
                this.model.set(options.defaults);
            } else {
                this.model = new Model();
            }
            
            this.listenTo(this.model, 'change:viewValue', this.render);
            
            _.bindAll(this, 'respond');
            $(window).resize(this.respond);
            
            return this;
        },
        render: function() {
            var dragger = $('<div class="value-bar" />'),
                model = this.model.toJSON(),
                val = this.isDown ? model.viewValue : model.value * model.viewMax / model.max - 7;
            
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
            
            return this;
        },
        addTicks: function() {
            for(var i = 0; i <= this.model.get('max'); i++) {
                var tick = $('<div class="tick" />');
                tick.css({
                    left: i * this.model.get('viewMax') / this.model.get('max'),
                    position: 'absolute'
                });
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
            
            return this;
        },
        mouseup: function() {
            this.isDown = false;
            this.render();
            
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
        }
    });
    
    return View;
    
}());