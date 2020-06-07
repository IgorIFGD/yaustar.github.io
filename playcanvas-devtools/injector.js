if (!__addedDebugTools__) {
    var __addedDebugTools__ = false;
    (function () {
        if (!__addedDebugTools__) {
            var baseUrl;
            var useGitHubUrl = false;
            if (useGitHubUrl) {
                baseUrl = 'https://yaustar.github.io/playcanvas-devtools/';
            } else {
                baseUrl = 'http://localhost:8080/';
            }
            
            var scriptFilenames = [
                'playcanvas-extras.js'
            ];

            var callback = function () {
                console.log('All PlayCanvas Debug Tool scripts loaded');

                // Load the ministats
                var app = pc.Application.getApplication();
                var ministats = new pc.MiniStats(app);

            };

            var scriptsLoaded = 0;
            for (var i = 0; i < scriptFilenames.length; ++i) {
                var imported = document.createElement('script');
                imported.src = baseUrl + scriptFilenames[i];
                imported.onload = function () {
                    scriptsLoaded += 1;
                    if (scriptsLoaded == scriptFilenames.length) {
                        callback();
                    }
                };
                document.head.appendChild(imported);
            }

            __addedDebugTools__ = true;
        }
    })();
}