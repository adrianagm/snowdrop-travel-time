(function() {

    MapViewer.LayerList = MapViewer.extend(MapViewer.MapControl, {

        template: '<div class="header">Layers</div><ul class="layer-list"></ul></ul><div class="clear">Clear</div>',
        controlClass: 'layer-list-control',

        position: 'RIGHT_CENTER',
        alias: 'layer-list',

        layerList: null,
        layer: [],

        initialize: function() {
            var layers = this.layers;
            this.layerList = this.getElementsByClass('layer-list')[0];
            for (var l = 0; l < layers.length; l++) {
                this.addLI(layers[l]);
            }

            var that = this;
            this.bindEvent('layer', 'click', function(event) {
                var li = event.currentTarget;

                if (li.classList.contains('active')) {
                    that.layerDeselected(li);
                } else {
                    that.layerSelected(li);
                }
            });

            this.bindEvent('header', 'click', function(event) {
                that.toggleList();
            });

            this.bindEvent('clear', 'click', function(event) {
                that.clearList();
            });
        },

        layerSelected: function(li) {
            li.classList.add('active');
        },

        layerDeselected: function(li) {
            li.classList.remove('active');
        },

        toggleList: function() {
            var style = this.layerList.style;
            if (style.display !== 'none') {
                style.display = 'none';
            } else {
                style.display = 'initial';
            }
        },

        clearList: function() {
            var lis = this.getElementsByClass('layer');
            for (var l = 0; l < lis.length; l++) {
                this.layerDeselected(lis[l]);
            }
        },

        addLI: function(text) {
            var li = document.createElement('li');
            li.className = 'layer';
            li.innerHTML = text;
            this.layerList.appendChild(li);
        }
    });

    MapViewer.registerModule(MapViewer.LayerList, "layer-list");
})();
