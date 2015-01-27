(function() {

    MapViewer.ButtonControl = MapViewer.extend(MapViewer.MapControl, {

        template: '<div class="button-control-outer"><div class="button-control-border"><div class="button-control-inner"><b>Texto</b></div></div></div>',
        controlClass: 'button-control',

        position: 'TOP_RIGHT',
        alias: 'button',

        text: 'Default',
        clickFunction: alert,
        clickParams: ['Default function'],

        initialize: function() {
            var that = this;
            this.bindEvent('button-control-outer', 'click', function() {
                that.clickFunction.apply(that.clickThis, that.clickParams);
            });
        }
    });

    MapViewer.registerModule(MapViewer.ButtonControl, "button");
})();
