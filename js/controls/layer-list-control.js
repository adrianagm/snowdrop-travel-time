(function() {

    var CONTROL_CLASS = 'layer-list';

    MapViewer.LayerList = MapViewer.extend(MapViewer.MapControl, {

        template: '<div class="header"><a class="collapse-class" href="#"></a>Layers</div><ul class="layer-list"></ul>' +
        '<div class="search-dataset">Search Dataset</div><ul class="search-list"></ul><div class="clear">Clear</div>',
        controlClass: 'layer-list-control',

        position: 'LEFT_TOP',
        alias: CONTROL_CLASS,

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


            this.bindEvent('search-dataset', 'click', function(event) {
                var overlayOptions = {
                    parent: that.owner.element,
                    modalClasses: 'search-dataset-overlay-modal',
                    modalInnerContent: that._searchDatasetModalTemplate(),
                    scripts: that._searchDatasetScript
                };

                var overlay = new JLLOverlay(overlayOptions);
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
                srs: 'EPSG:900913',
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
        },

        _searchDatasetModalTemplate: function() {
            var select_options = {
                'item_a': 'item-A',
                'item_b': 'item-B',
                'item_c': 'item-C',
                'item_d': 'item-D',
                'item_e': 'item-E',
                'item_f': 'item-F',
                'item_g': 'item-G',
                'item_h': 'item-H',
                'item_i': 'item-I',
                'item_j': 'item-J',
                'item_k': 'item-K',
                'item_l': 'item-L',
                'item_m': 'item-M'
            };
            var html = '';
            html += '<div class="overlay-search-dataset-modal">';
            html += '   <div class="overlay-header">';
            html += '       <label for="search-dataset-input">Search Dataset:</label>';
            html += '       <input type="text" class="overlay-form-input overlay-form-item search-dataset-input" name="search-dataset-input">';
            html += '   </div>';
            html += '   <div class="overlay-content">';
            html += '       <label for="search-dataset-list">Availables Dataset:</label>';
            html += '       <select multiple class="overlay-form-select-multiple overlay-form-item search-dataset-list" name="search-dataset-list">';
            for (var key in select_options) {
                if (select_options.hasOwnProperty(key)) {
                    html += '<option value="' + key + '">' + select_options[key] + '</option>';
                }
            }
            html += '       </select>';
            html += '   </div>';
            html += '   <div class="overlay-footer">';
            html += '       <button type="button" class="overlay-btn">Add</button>';
            html += '   </div>';
            html += '</div>';

            return html;
        },
        _searchDatasetScript: function() {
            /*
             this function is execute insite JLLOverlay Class so 'this' is refered to the JLLOverlay object
             */
            var map = this.parent;
            var searchInput = map.getElementsByClassName('search-dataset-input')[0];
            var searchList = map.getElementsByClassName('search-dataset-list')[0];

            if (searchInput && searchList) {
                searchInput.addEventListener("keyup", function(e) {
                    var inputValue = e.target.value;
                    var options = searchList.getElementsByTagName('option');
                    for (var i = 0; i < options.length; i++) {
                        var optionValue = options[i].text;
                        if (new RegExp('^' + inputValue).test(optionValue)) {
                            options[i].style.display = 'block';
                        } else {
                            options[i].style.display = 'none';
                        }
                    }
                }, false);
            }

        }

    });

    MapViewer.registerModule(MapViewer.LayerList, CONTROL_CLASS);
})();