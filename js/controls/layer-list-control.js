(function() {

    var CONTROL_CLASS = 'layer-list';

    MapViewer.LayerList = MapViewer.extend(MapViewer.MapControl, {

        template: '<div class="header"><a class="collapse-class" href="#"></a>Layers</div>' +
        '<div class="layer-list-collapsible-wrap">' +
        '<div class="search-dataset">Search Dataset</div>' +
        '<div class="layer-list-options-wrap">' +
        '<ul class="layer-list"></ul>' +
        '</div>' +
        '<div class="clear">Clear</div>' +
        '</div>',
        controlClass: 'layer-list-control',

        position: 'LEFT_TOP',
        alias: CONTROL_CLASS,

        layerList: null,
        layers: [],
        layersLoaded: [],
        internalDataset: [],
        startCollapse: false,


        initialize: function() {
            var layers = this.layers;

            this.layerList = this.getElementsByClass('layer-list')[0];

            var layersLength = layers.length;
            for (var i = 0; i < layersLength; i++) {
                layers[i].index = i;
                this._addNewLayerLi(layers[i].label);
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

            this.internalDatasetsPromise = that.api.retrieveDatasets();
            this.bindEvent('search-dataset', 'click', function(event) {

                that.internalDatasetsPromise.then(function(datasets) {
                    
                    that.internalDataset = datasets;
                    var options = [];

                    var index = that.layers.length;
                    for (var layer in datasets) {
                        if (datasets.hasOwnProperty(layer)) {
                            that.internalDataset[layer].index = index;
                            index++;
                            options.push(datasets[layer].label);
                        }
                    }

                    var overlayOptions = {
                        parentObj: that,
                        appendToParent: that.owner.element,
                        modalClasses: 'search-dataset-overlay-modal',
                        modalInnerContent: that._searchDatasetModalTemplate(options),
                        scripts: that._searchDatasetScript
                    };

                    var overlay = new JLLOverlay(overlayOptions);
                });

            });


        },

        addLayerGme: function(layer) {
            return new google.maps.visualization.MapsEngineLayer({
                layerId: layer.id,
                //layerKey: layer.layerName,
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

            if (!layer.opacity) {
                layer.opacity = 1;
            }

            var wms = MercatorProjectionLayer.loadWMS(layer, requestParams);

            this.map.overlayMapTypes.setAt(layer.index, wms);

            return wms;
        },

        layerSelected: function(li, _layer) {
            li.classList.add('active');
            var layers = li.classList.contains('internal') ? this.internalDataset : this.layers;
            var layer = _layer || this._getLayerByLabel(li.innerText, layers);
            this._loadLayer(layer);
        },

        _loadLayer: function(layer) {
            if (layer) {
                var type = layer.type;
                if (type === 'gme') {
                    this.layersLoaded[layer.label] = this.addLayerGme(layer);
                }
                if (type === 'wms') {
                    this.layersLoaded[layer.label] = this.addLayerWms(layer);
                }
            }
        },

        layerDeselected: function(li) {
            li.classList.remove('active');
            var layers = li.classList.contains('internal') ? this.internalDataset : this.layers;
            var layer = this._getLayerByLabel(li.innerText, layers);
            if (layer) {
                var type = layer.type;
                if (type === 'wms') {
                    this.map.overlayMapTypes.setAt(layer.index, null);
                } else {
                    this.layersLoaded[li.innerText].setMap(null);
                }
            }
        },

        toggleList: function(header) {
            if (this.getElementsByClass('layer-list-collapsible-wrap')[0]) {
                var style = this.getElementsByClass('layer-list-collapsible-wrap')[0].style;
                if (style.display !== 'none') {
                    header.classList.add('control-collapse');
                    style.display = 'none';
                } else {
                    header.classList.remove('control-collapse');
                    style.display = 'block';
                }
            }
        },

        clearList: function() {
            var lis = this.getElementsByClass('layer');
            for (var l = 0; l < lis.length; l++) {
                if (lis[l].classList.contains('active')) {
                    this.layerDeselected(lis[l]);
                }
            }
        },

        _getLayerByLabel: function(labelName, from) {
            var layer = {};
            var layers = from || this.layers;
            var layersLength = layers.length;
            for (var i = 0; i < layersLength; i++) {
                if (labelName === layers[i].label) {
                    layer = layers[i];
                    break;
                }
            }
            return layer;
        },

        _searchDatasetModalTemplate: function(select_options) {

            var html = '';
            html += '<div class="overlay-search-dataset-modal">';
            html += '   <div class="overlay-header">';
            html += '       <label for="search-dataset-input">Search Dataset:</label>';
            html += '       <input type="text" class="overlay-form-input overlay-form-item search-dataset-input" name="search-dataset-input">';
            html += '   </div>';
            html += '   <div class="overlay-content">';
            html += '       <label for="search-dataset-list">Availables Dataset:</label>';
            html += '       <select multiple class="overlay-form-select-multiple overlay-form-item search-dataset-list" name="search-dataset-list">';
            for (var i = 0; i < select_options.length; i++) {
                html += '<option class="layer" value="' + i + '">' + select_options[i] + '</option>';
            }
            html += '       </select>';
            html += '   </div>';
            html += '   <div class="overlay-footer">';
            html += '       <button type="button" class="overlay-btn add-dataset-btn">Add</button>';
            html += '   </div>';
            html += '</div>';

            return html;
        },
        _searchDatasetScript: function() {
            /*
             this function is execute insite JLLOverlay Class so 'this' is refered to the JLLOverlay object
             */
            var map = this.parentObj.owner.element;
            var searchInput = map.getElementsByClassName('search-dataset-input')[0];
            var searchList = map.getElementsByClassName('search-dataset-list')[0];
            var addBtn = map.getElementsByClassName('add-dataset-btn')[0];
            var layerList = this.parentObj.layerList;
            var layerListOptions = layerList.getElementsByClassName('layer');
            var that = this.parentObj;
            var disabledOptions = [];


            for (var i = 0; i < layerListOptions.length; i++) {
                disabledOptions.push(layerListOptions[i].innerText);
            }

            var searchListOptions = [];


            for (var i = 0; i < searchList.options.length; i++) {
                if (disabledOptions.lastIndexOf(searchList.options[i].text) > -1) {
                    searchList.removeChild(searchList.options[i]);
                    //searchList[i].remove();
                } else {
                    searchListOptions.push(searchList.options[i].text);
                }
            }
            if (searchInput && searchList) {
                searchInput.addEventListener("keyup", function(e) {
                    var inputValue = e.target.value.toLowerCase();
                    searchList.innerHTML = '';
                    for (var i = 0; i < searchListOptions.length; i++) {
                        var optionValue = searchListOptions[i];
                        if (new RegExp(inputValue).test(optionValue.toLowerCase())) {
                            var op = document.createElement('option');
                            op.className = 'layer';
                            op.innerText = optionValue;
                            searchList.appendChild(op);
                        }
                    }
                }, false);
            }

            addBtn.onclick = function() {
                var removed = [];
                var searchListlength = searchList.length;
                for (var i = 0; i < searchListlength; i++) {
                    if (searchList[i]) {
                        var option = searchList[i];
                        if (option.selected) {
                            var li = that._addNewLayerLi(option.text, true);
                            var layer = that._getLayerByLabel(option.text, that.internalDataset);
                            //that._loadLayer(layer)
                            that.layerSelected(li, layer);
                            removed.push(option);

                        }
                    }
                }
                that._ajustHeight();
                var removedLength = removed.length;
                for (var i = 0; i < removedLength; i++) {
                    var option = removed[i];
                    var index = searchListOptions.indexOf(option.text);
                    searchList.removeChild(option);
                    searchListOptions.splice(index, 1);
                }

            };

        },

        _addNewLayerLi: function(layerName, _removable) {
            var removable = _removable ? true : false;
            if (layerName) {
                var li = document.createElement('li');
                var span = document.createElement('span');
                li.className = 'layer';
                li.innerHTML = layerName;

                this.layerList.appendChild(li);
                var that = this;
                google.maps.event.addDomListener(li, 'click', function(event) {
                    that._onClickLayerItem(event);
                });

                if (removable) {
                    span.className = 'remove-layer';
                    li.classList.add('internal');
                    li.appendChild(span);
                    span.onclick = function(event) {
                        event.stopPropagation();
                        if (li.classList.contains('active')) {
                            that.layerDeselected(li);
                        }
                        that.layerList.removeChild(li);
                        that._ajustHeight();
                    };
                }

                return li;
            }
        },

        _ajustHeight: function() {
            var layerListOptions = this.layerList.getElementsByClassName('layer');
            var layerListOptionsWrap = this.getElementsByClass('layer-list-options-wrap')[0];

            if (layerListOptions.length > 8 && layerListOptionsWrap) {
                layerListOptionsWrap.classList.add('enable-scroll');
            } else {
                layerListOptionsWrap.classList.remove('enable-scroll');
            }
        },

        _onClickLayerItem: function(event) {
            var li = event.currentTarget;
            if (li.classList.contains('active')) {
                this.layerDeselected(li);
            } else {
                this.layerSelected(li);
            }
        }

    });

    MapViewer.registerModule(MapViewer.LayerList, CONTROL_CLASS);
})
();
