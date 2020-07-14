var pcDevtools = {};

pcDevtools.init = function () {
    pcDevtools.app = pc.Application.getApplication();

    var app = pcDevtools.app;

    // Create a frame buffer picker with a resolution of 1024x1024
    pcDevtools.picker = new pc.Picker(pcDevtools.app.graphicsDevice, 1024, 1024);
    app.mouse.on(pc.EVENT_MOUSEDOWN, pcDevtools.onPickerSelectMouse, pcDevtools);
    if (app.touch) {
        app.touch.on(pc.EVENT_TOUCHSTART, pcDevtools.onPickerSelectTouch, pcDevtools);
    }
};

pcDevtools.getPathToEntity = function (node) {
    var path = node.name;
    while (node.parent && node.parent !== pcDevtools.app.root) {
        path = node.parent.name + '/' + path;
        node = node.parent;
    }

    return path;
};


pcDevtools.graphPrinter = {};

pcDevtools.graphPrinter.enabledNodesOnly = false;
pcDevtools.graphPrinter.showPaths = false;

pcDevtools.graphPrinter.withFilter = function (node, path, filterString) {
    var i;
    var indentStr = "";

    for (i = 0; i < node.graphDepth; ++i) {
        indentStr += "  ";
    }

    var shouldPrint = true;
    if (filterString && filterString.length > 0) {
        shouldPrint = eval(filterString);
    }

    // Make the text grey if it is disabled
    var color = '';
    if (!node.enabled) {
        if (pcDevtools.printGraphOnlyEnabled) {
            shouldPrint = false;
        }
        color = 'color: #7f8c8d';
    }

    if (path.length > 0 ) {
        path += '/' + node.name;
    } else if (node !== pcDevtools.app.root) {
        path += node.name;
    }

    if (shouldPrint && node !== pcDevtools.app.root) {
        var str = '%c' + indentStr + node.name;
        if (this.showPaths) {
            str += ' [' + path + ']';
        }
        console.log(str, color);
    }

    var children = node.children;
    for (i = 0; i < children.length; ++i) {
        this.withFilter(children[i], path, filterString);
    }
};


pcDevtools.enablePicker = false;
pcDevtools.pickerCameraPath = "";

pcDevtools.onPickerSelect = function (x, y) {
    if (pcDevtools.enablePicker) {
        var app = pcDevtools.app;
        var camera = app.root.findByPath(pcDevtools.pickerCameraPath).camera;

        console.log('Camera used is: ' + pcDevtools.pickerCameraPath);

        var canvas = app.graphicsDevice.canvas;
        var canvasWidth = parseInt(canvas.clientWidth, 10);
        var canvasHeight = parseInt(canvas.clientHeight, 10);

        var scene = app.scene;
        var picker = pcDevtools.picker;

        picker.prepare(camera, scene);

        // Map the mouse coordinates into picker coordinates and
        // query the selection
        var selected = picker.getSelection(
            Math.floor(x * (picker.width / canvasWidth)),
            Math.floor(y * (picker.height / canvasHeight))
        );

        if (selected.length > 0) {
            // Get the graph node used by the selected mesh instance
            var entity = selected[0] ? selected[0].node : null;

            // Bubble up the hierarchy until we find an actual Entity
            while (!(entity instanceof pc.Entity) && entity !== null) {
                entity = entity.parent;
            }

            // Print it out to console and get the path to it
            if (entity) {
                console.log(entity);
                var path = pcDevtools.getPathToEntity(entity);
                console.log(path);
            }
        }

        console.log('Finished picking');
    }
};

pcDevtools.onPickerSelectMouse = function (evt) {
    if (evt.button == pc.MOUSEBUTTON_MIDDLE) {
        pcDevtools.onPickerSelect(evt.x, evt.y);
    }
};

pcDevtools.onPickerSelectTouch = function (evt) {
    pcDevtools.onPickerSelect(evt.touches[0].x, evt.touches[0].y);
    evt.event.preventDefault();
};


pcDevtools.debugEntityName = '__devtools__';
pcDevtools.addScriptTypeToDebugEntity = function (scriptName, data) {
    var app = pcDevtools.app;
    var debugEntity = app.root.findByName(pcDevtools.debugEntityName);
    if (!debugEntity) {
        debugEntity = new pc.Entity();
        debugEntity.addComponent('script');
        app.root.addChild(debugEntity);
    }

    var scriptInstance = debugEntity.script[scriptName];
    if (!scriptInstance) {
        scriptInstance = debugEntity.script.create(scriptName, {
            attributes: data
        });
    }

    return scriptInstance;
};
