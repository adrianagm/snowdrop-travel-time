(function() {

    function MapViewerOverlay(_options) {

        this.options = _options || {};

        this.id = this.options.id || 'overlay';

        this.overlayParent = null;
        if (typeof this.options.appendToParent === 'object') {
            this.overlayParent = this.options.appendToParent;
        } else {
            this.overlayParent = document.getElementsByTagName('body');
        }

        //create the overlay
        this._createOverlay();
        this._setOverlayCover();
        this._setOverlayModal();

        this.overlayParent.appendChild(this.overlay);
        this._binding();
    }

    MapViewerOverlay.prototype._createOverlay = function() {
        this.overlay = document.createElement('div');
        this.overlay.className = this.id;
    };

    MapViewerOverlay.prototype._setOverlayCover = function() {
        var cover = document.createElement('div');
        cover.className = this.id + '-cover';
        this.overlay.appendChild(cover);
    };

    MapViewerOverlay.prototype._setOverlayModal = function() {
        var modal = document.createElement('div');
        modal.innerHTML = '<span class="' + this.id + '-close-btn"></span>';
        modal.className = this.id + '-modal';


        if (this.options.modalClasses && typeof this.options.modalClasses === 'string') {
            modal.className += ' ' + this.options.modalClasses;
        }
        else if (this.options.modalClasses && typeof this.options.modalClasses === 'object') {
            modal.classList.add(this.options.modalClasses);
        }

        if (this.options.modalInnerContent && typeof this.options.modalInnerContent === 'string') {
            modal.innerHTML += '<div class="' + this.id + '-modal-inner">' + this.options.modalInnerContent + '</div>';
        }
        else if (this.options.modalInnerContent && typeof this.options.modalInnerContent === 'object') {
            var innerContent = document.createElement('div');
            innerContent.className = this.id + '-modal-inner';
            innerContent.appendChild(this.options.modalInnerContent);
            modal.appendChild(innerContent);
        }

        this.overlay.appendChild(modal);
    };

    MapViewerOverlay.prototype._binding = function() {
        var that = this;
        this.overlayParent.getElementsByClassName(this.id + '-close-btn')[0].onclick = function() {
            that.destroy();
        };

        if (this.options.scripts && typeof this.options.scripts === 'function') {
            this.options.scripts();
        }
    };

    MapViewerOverlay.prototype.destroy = function() {
        this.overlayParent.removeChild(this.overlay);
        //    this.overlay.remove();
    };

    if (typeof window.MapViewerOverlay == 'undefined') {
        window.MapViewerOverlay = MapViewerOverlay;
    }
})();