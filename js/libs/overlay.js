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
        this.cover = document.createElement('div');
        this.cover.className = this.id + '-cover';
        this.overlay.appendChild(this.cover);
    };

    MapViewerOverlay.prototype._setOverlayModal = function() {
        this.modal = document.createElement('div');
        this.modal.innerHTML = '<span class="' + this.id + '-close-btn"></span>';
        this.modal.className = this.id + '-modal';


        if (this.options.modalClasses && typeof this.options.modalClasses === 'string') {
            this.modal.className += ' ' + this.options.modalClasses;
        }
        else if (this.options.modalClasses && typeof this.options.modalClasses === 'object') {
            this.modal.classList.add(this.options.modalClasses);
        }

        if (this.options.modalInnerContent && typeof this.options.modalInnerContent === 'string') {
            this.modal.innerHTML += '<div class="' + this.id + '-modal-inner">' + this.options.modalInnerContent + '</div>';
        }
        else if (this.options.modalInnerContent && typeof this.options.modalInnerContent === 'object') {
            var innerContent = document.createElement('div');
            innerContent.className = this.id + '-modal-inner';
            innerContent.appendChild(this.options.modalInnerContent);
            this.modal.appendChild(innerContent);
        }

        this.overlay.appendChild(this.modal);
    };

    MapViewerOverlay.prototype._binding = function() {
        var that = this;
        this.modal.getElementsByClassName(this.id + '-close-btn')[0].onclick = function() {
            that.destroy();
        };

        if (this.options.scripts && typeof this.options.scripts === 'function') {
            this.options.scripts();
        }
    };

    MapViewerOverlay.prototype.destroy = function() {
        this.overlayParent.removeChild(this.overlay);
    };

    if (typeof window.MapViewerOverlay == 'undefined') {
        window.MapViewerOverlay = MapViewerOverlay;
    }
})();