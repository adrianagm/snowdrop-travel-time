(function() {

    MapViewer.ButtonControl = MapViewer.extend(MapViewer.MapControl, {

        template: '<div class="button-control-outer"><div class="button-control-border"><div class="button-control-inner"><b>Picture Exportation</b></div></div></div>',
        controlClass: 'button-control',

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
            this.buttonText = this.getElementsByClass('button-control-inner')[0];
            this.elem = this.map.getDiv();
            var that = this;

            this.bindEvent('button-control-outer', 'click', function() {
                this.controls = document.getElementsByClassName('map-control');

                if (this.classList.contains("complete-screen")) {
                    this.classList.remove('complete-screen');
                    that.complete = false;
                } else {
                    this.classList.add('complete-screen');
                    that.complete = true;
                }

                if (that.complete) {
                    //Complete screen
                    that.buttonText.innerHTML = "<b>X</b>";
                    that.map.set('disableDefaultUI', true);
                    that.map.set('mapTypeControl', false);
                    for (var i = 0; i < this.controls.length; i++) {
                        if (!this.controls[i].firstChild.classList.contains('button-control'))
                            this.controls[i].style.display = "none";
                    }

                    that.elem.style.width = "100%";
                    that.bounds = that.map.getBounds();
                    that.zoom = that.map.getZoom();

                    if (that.elem.requestFullscreen) {
                        that.elem.requestFullscreen();
                    } else if (that.elem.msRequestFullscreen) {
                        that.elem.msRequestFullscreen();
                    } else if (that.elem.mozRequestFullScreen) {
                        that.elem.mozRequestFullScreen();
                    } else if (that.elem.webkitRequestFullscreen) {
                        that.elem.webkitRequestFullscreen();
                    }

                    setTimeout(function() {
                        that.map.fitBounds(that.bounds);
                        that.map.setZoom(that.zoom);
                    }, 100);

                } else {
                    //Normal screen
                    that.buttonText.innerHTML = "<b>Picture Exportation</b>";
                    that.map.set('disableDefaultUI', false);
                    that.map.set('mapTypeControl', true);

                    that.elem.style.width = "initial";
                    for (var j = 0; j < this.controls.length; j++) {
                        if (!this.controls[j].firstChild.classList.contains('button-control'))
                            this.controls[j].style.display = "initial";
                    }
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                    setTimeout(function() {
                        that.map.fitBounds(that.bounds);
                        that.map.setZoom(that.zoom);
                    }, 100);
                }
            });
        }
    });

    MapViewer.registerModule(MapViewer.ButtonControl, "button");
})();