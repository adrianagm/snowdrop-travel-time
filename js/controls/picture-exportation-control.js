(function() {

    MapViewer.ButtonControl = MapViewer.extend(MapViewer.MapControl, {

        template: '<div class="picture-exportation-control-outer"><div class="picture-exportation-control-border"><div class="picture-exportation-control-inner"><b>Picture Exportation</b></div></div></div>',
        controlClass: 'picture-exportation-control',

        position: 'TOP_RIGHT',
        alias: 'button',

        text: 'Default',
        clickFunction: alert,
        clickParams: ['Default function'],
        complete: false,
        controls: null,
        bounds: null,
        zoom: null,
        initialize: function() {
            this.buttonText = this.getElementsByClass('picture-exportation-control-inner')[0];
            this.elem = this.map.getDiv();
            var that = this;
            this.bindEvent('picture-exportation-control-outer', 'click', function() {

                if (this.classList.contains("complete-screen")) {
                    this.classList.remove('complete-screen');
                    that.deactivate();
                } else {
                    this.classList.add('complete-screen');
                    that.activate();
                }
            });
        },


        deactivate: function() {

            var that = this;
            //Normal screen
            that.buttonText.innerHTML = "<b>Picture Exportation</b>";
            that.map.set('disableDefaultUI', false);
            that.map.set('mapTypeControl', true);

            that.elem.style.width = "initial";
            for (var j = 0; j < this.controls.length; j++) {
                if (!this.controls[j].firstChild.classList.contains('picture-exportation-control'))
                    this.controls[j].style.display = "initial";
            }
            this._deactivateFullScreen();
            setTimeout(function() {
                that.map.fitBounds(that.bounds);
                that.map.setZoom(that.zoom);
            }, 100);
        },

        activate: function() {
            this.controls = document.getElementsByClassName('map-control');
            
            var that = this;
            //Complete screen
            that.buttonText.innerHTML = "<b>X</b>";
            that.map.set('disableDefaultUI', true);
            that.map.set('mapTypeControl', false);
            for (var i = 0; i < this.controls.length; i++) {
                if (!this.controls[i].firstChild.classList.contains('picture-exportation-control'))
                    this.controls[i].style.display = "none";
            }

            that.elem.style.width = "100%";
            that.bounds = that.map.getBounds();
            that.zoom = that.map.getZoom();

            this._activateFullScreen();
            
            setTimeout(function() {
                that.map.fitBounds(that.bounds);
                that.map.setZoom(that.zoom);
            }, 100);
        },

        _activateFullScreen: function() {

            var that = this;
            if (that.elem.requestFullscreen) {
                that.elem.requestFullscreen();
                document.addEventListener("fullscreenchange", function() {
                    if (!document.fullscreen) {
                        that.deactivate();
                    }
                }, false);
            } else if (that.elem.msRequestFullscreen) {
                that.elem.msRequestFullscreen();
                document.addEventListener("msfullscreenchange", function() {
                    if (!document.msFullscreenElement) {
                        that.deactivate();
                    }
                }, false);
            } else if (that.elem.mozRequestFullScreen) {
                that.elem.mozRequestFullScreen();
                document.addEventListener("mozfullscreenchange", function() {
                    if (!document.mozFullScreen) {
                        that.deactivate();
                    }
                }, false);
            } else if (that.elem.webkitRequestFullscreen) {
                that.elem.webkitRequestFullscreen();
                document.addEventListener("webkitfullscreenchange", function() {
                    if (!document.webkitIsFullScreen) {
                        that.deactivate();
                    }
                }, false);
            }
        },
        _deactivateFullScreen: function() {
            var that = this;
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

    MapViewer.registerModule(MapViewer.ButtonControl, "picture-exportation");
})();