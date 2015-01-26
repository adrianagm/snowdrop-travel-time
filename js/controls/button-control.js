(function() {

    MapViewer.ButtonControl = MapViewer.extend(MapViewer.MapControl, {

        template: '<div class="button-control-outer"><div class="button-control-border"><div class="button-control-inner"><b>Texto</b></div></div></div>',

        controlClass: 'button-control',

        initialize: function(options) {
            this.bindEvent('button-control-inner', 'click', function() {
                options.clickFunction.apply(options.clickThis, options.clickParams);
            });
        }
    });

    var msg = "Default function";
    MapViewer.registerModule(MapViewer.ButtonControl, "button", 'TOP_RIGHT', {
        text: 'Default',
        clickFunction: alert,
        clickParams: [msg]
    });
})();
