(function() {
    var f = function() {};
    if (typeof console === 'undefined') {        
        window.console = {
            log: f,  
            debug: f,  
            info: f,  
            warn: f,  
            error: f,  
            assert: f,  
            clear: f,  
            dir: f,  
            dirxml: f,  
            trace: f,  
            group: f,  
            groupCollapsed: f,  
            groupEnd: f,  
            time: f,  
            timeEnd: f,  
            profile: f,  
            profileEnd: f,  
            count: f,  
            exception: f,  
            table: f ,
            create: function() {
                window.console = {
                    log: function(e){
                        alert('log: ' + e);
                    }
                }
            }
        }
    }
})();