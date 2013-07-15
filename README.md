Backbone Sliderbar
==================

Backbone Sliderbar is an easy to use, responsive slider that allows users to quickly select a value by just dragging thier mouse.

## Basic Use

```javascript
var widget = new SliderBar({id: 'main-slider'});

$(function() {
    $('#basic-use-example').append(widget.$el);  
    widget.render();
});


## API


### Get Value

```javascript
widget.model.get('value'));
```

### Set Value
The slider view will auto update when you set the value attribute on the model.
```javascript
widget.model.set('value', 5);
```
