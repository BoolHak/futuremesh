"use strict";
var MapGenerator;
require('mapgenerator.tabs', 'mapgenerator.forms', 'mapeditor.modal',
        'mapeditor.progressbar', 'mainview', 'mapgenerator.terraingenerator',
        'mapcompressor', 'mapgenerator.mapgeneratorscrollbars');

/**
 * Map Generator main class. This class controlls the UI and map generation.
 */
MapGenerator = function () {
    var tabs, form, select, option, i, type, forms, modal, progressbar, view,
            terrainGenerator, compressor, executeBatch, generateMap;
    
    modal = new Modal('Initializing...');
    progressbar = new Progressbar(50);
    modal.appendChild(progressbar);
    modal.center();
    
    tabs = new Tabs();
    forms = new Forms();
    compressor = new MapCompressor();
    view = new MainView();
    view.setCanvases(document.getElementById('terrain'),
            document.getElementById('buildings'),
            document.getElementById('units'), document.getElementById('sfx'));
    new MapGeneratorScrollbars(view);
    terrainGenerator = new TerrainGenerator();
    form = document.getElementsByTagName('form')[0];
    select = form.getElementsByTagName('select')[0];
    for (i = 0; type = TilesDefinition.getType(i); i++) {
        if (!type.accessible) {
            option = document.createElement('option');
            option.appendChild(document.createTextNode(i));
            option.value = i;
            select.appendChild(option);
        }
    }
    
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        modal = new Modal('Generating map...');
        progressbar = new Progressbar(0);
        modal.appendChild(progressbar);
        modal.center();
        tabs.setActiveTab(0, 1);
        generateMap();
    }, false);
    
    /**
     * Generates the map using the data provided in the form.
     */
    generateMap = function () {
        var data, map;
        executeBatch([
            function () { // retrieve the form data
                data = forms.getFormData(form);
                progressbar.setValue(5);
            },
            function () { // generate an empty map
                map = terrainGenerator.generateEmptyMap(data);
                progressbar.setValue(90);
            },
            function () { // export the map data
                document.getElementById('map').value =
                        compressor.compress(map.exportData(), 3);
                progressbar.setValue(95);
            },
            function () { // display the map
                view.setMap(map);
                view.display(0, 0);
                modal.close();
            }
        ], 10);
    };
    
    /**
     * Executes a batch of functions (tasks) in the provided order. The tasks
     * with be executed with scheduled breaks between the task execution, so
     * that the browser UI can be updated.
     * 
     * @param {Array} tasks An array of functions to execute in order.
     * @param {Number} pause The pause between task execution in miliseconds.
     */
    executeBatch = function (tasks, pause) {
        var interval, task;
        task = 0;
        interval = setInterval(function () {
            if (task >= tasks.length) {
                clearInterval(interval);
                return;
            }
            tasks[task++]();
        }, pause);
    };
    
    modal.close();
};
