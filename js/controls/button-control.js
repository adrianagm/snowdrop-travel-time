(function() {

    MapViewer.ButtonControl = function(options) {

        var html = '<div class="button-control-outer"><div class="button-control-border"><div class="button-control-inner"><b>' + options.text + '</b></div></div></div>';

        this.setContent(html);

        var that = this;
        google.maps.event.addDomListener(this.content, 'click', function() {
            options.clickFunction.apply(options.clickThis, options.clickParams);
        });
    };

    var msg = "Default function";
    MapViewer.registerModule(MapViewer.ButtonControl, "button", 'TOP_RIGHT', {
        text: 'Default',
        clickFunction: alert,
        clickParams: [msg]
    });
})();
