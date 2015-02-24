(function() {
    var CONTROL_CLASS = 'picture-exportation';
    MapViewer.PictureExportationControl = MapViewer.extend(MapViewer.MapControl, {

        template: '<div class="picture-exportation-control-outer"><div class="picture-exportation-control-border"><div class="picture-exportation-control-inner"><b>Picture Exportation</b></div></div></div>',
        controlClass: 'picture-exportation-control',

        position: 'TOP_RIGHT',
        alias: CONTROL_CLASS,
        link: null,
        controls: null,
        bounds: null,
        zoom: null,
        initialize: function() {
            var that = this;
            this.buttonText = this.getElementsByClass('picture-exportation-control-inner')[0];
            this.link = this.getElementsByClass('picture-exportation-control-outer')[0];
            this.elem = this.map.getDiv();

            this.bindEvent('picture-exportation-control-outer', 'click', function() {
                if (this.classList.contains("complete-screen")) {
                    that.deactivate();
                } else {
                    that.activate();
                }
            });
        },


        deactivate: function() {

            var that = this;

            this.link.classList.remove('complete-screen');

            this.buttonText.innerHTML = "<b>Picture Exportation</b>";
            this.map.set('disableDefaultUI', false);
            this.map.set('mapTypeControl', true);

            this.elem.style.width = "initial";
            this.elem.style.height = this.oldHeight;
            for (var j = 0; j < this.controls.length; j++) {
                if (!this.controls[j].firstChild.classList.contains('picture-exportation-control')) {
                    this.controls[j].style.display = 'block';
                }
            }
            this._deactivateFullScreen();
            setTimeout(function() {
                that.map.fitBounds(that.bounds);
                that.map.setZoom(that.zoom);
            }, 100);
        },

        activate: function() {
            var that = this;
            this.controls = document.getElementsByClassName('map-control');
            this.link.classList.add('complete-screen');
            //Complete screen
            this.buttonText.innerHTML = "<b>X</b>";
            this.map.set('disableDefaultUI', true);
            this.map.set('mapTypeControl', false);
            for (var i = 0; i < this.controls.length; i++) {
                if (!this.controls[i].firstChild.classList.contains('picture-exportation-control')) {
                    this.controls[i].style.display = "none";
                }
            }

            this.elem.style.width = '100%';
            this.oldHeight = this.elem.clientHeight + 'px';
            this.elem.style.height = '100%';
            this.bounds = this.map.getBounds();
            this.zoom = this.map.getZoom();

            this._activateFullScreen();
            
            setTimeout(function() {
                that.map.fitBounds(that.bounds);
                that.map.setZoom(that.zoom);
            }, 100);
        },

        _activateFullScreen: function() {

            var that = this;
            if (this.elem.requestFullscreen) {
                this.elem.requestFullscreen();
                document.addEventListener("fullscreenchange", function() {
                    if (!document.fullscreen) {
                        that.deactivate();
                    }
                }, false);
            } else if (this.elem.msRequestFullscreen) {
                this.elem.msRequestFullscreen();
                document.addEventListener("MSFullscreenChange", function() {
                    if (!document.msFullscreenElement) {
                        that.deactivate();
                    }
                }, false);
            } else if (this.elem.mozRequestFullScreen) {
                this.elem.mozRequestFullScreen();
                document.addEventListener("mozfullscreenchange", function() {
                    if (!document.mozFullScreen) {
                        that.deactivate();
                    }
                }, false);
            } else if (this.elem.webkitRequestFullscreen) {
                this.elem.webkitRequestFullscreen();
                document.addEventListener("webkitfullscreenchange", function() {
                    if (!document.webkitIsFullScreen) {
                        that.deactivate();
                    }
                }, false);
            }
        },
        _deactivateFullScreen: function() {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    });

    MapViewer.registerModule(MapViewer.PictureExportationControl, CONTROL_CLASS);
})();