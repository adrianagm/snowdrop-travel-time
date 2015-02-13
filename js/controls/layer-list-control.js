(function() {

    MapViewer.LayerList = MapViewer.extend(MapViewer.MapControl, {

        template: '<div class="header"><a class="collapse-class" href="#"></a>Layers</div><ul class="layer-list"></ul><div class="clear">Clear</div>',
        controlClass: 'layer-list-control',

        position: 'LEFT_TOP',
        alias: 'layer-list',

        layerList: null,
        layers: [],
        layersLoaded: [],

        startCollapse: false,


        initialize: function() {
            var layers = this.layers;
            this.layerList = this.getElementsByClass('layer-list')[0];
            var i = 0;
            for (var layer in layers) {
                layers[layer].index = i;
                this.addLI(layer);
                i++;
            }
            if (this.startCollapse) {
                this.toggleList();
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
                that.toggleList(event.target);
            });

            this.bindEvent('clear', 'click', function(event) {
                that.clearList();
            });
        },

        addLayerGme: function(layer) {
            return new google.maps.visualization.MapsEngineLayer({
                mapId: layer.layerId,
                layerKey: layer.layerName,
                map: this.map
            });
        },

        addLayerWms: function(layer) {
            var requestParams = {
                service: "wms",
                version: "1.1.1",
                format: 'image/png',
                transparent: true,
                srs: 'EPSG:3857',
                width: 256,
                height: 256,
            };
            if (layer.requestParams) {
                for (var p in layer.requestParams) {
                    requestParams[p] = layer.requestParams[p];
                }
                
            }

            var wms = MercatorProjectionLayer.loadWMS(layer, requestParams);

            this.map.overlayMapTypes.setAt(layer.index, wms);

            return wms;
        },

        layerSelected: function(li) {
            li.classList.add('active');
            var layer = this.layers[li.innerHTML];
            var type = layer.type;

            if (type == 'gme') {
                this.layersLoaded[li.innerHTML] = this.addLayerGme(layer);
            }
            if (type == 'wms') {
                this.layersLoaded[li.innerHTML] = this.addLayerWms(layer);
            }

        },

        layerDeselected: function(li) {
            li.classList.remove('active');
            var layer = this.layers[li.innerHTML];
            var type = layer.type;
            if (type == 'wms') {
                this.map.overlayMapTypes.setAt(layer.index, null);
            } else {
                this.layersLoaded[li.innerHTML].setMap(null);
            }
        },

        toggleList: function(header) {
            var style = this.layerList.style;
            if (style.display !== 'none') {
                header.classList.add('collapse');
                style.display = 'none';
            } else {
                header.classList.remove('collapse');
                style.display = 'block';
            }

            var clear = this.getElementsByClass('clear')[0];
            clear.style.display = style.display;
        },

        clearList: function() {
            var lis = this.getElementsByClass('layer');
            for (var l = 0; l < lis.length; l++) {
                if (lis[l].classList.contains('active')) {
                    this.layerDeselected(lis[l]);
                }
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