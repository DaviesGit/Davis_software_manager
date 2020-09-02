(function () {
    const jQuery = require('../../library/jquery-3.2.1.js'),
        $ = jQuery;
    const path = require('path');
    const fs = require('fs');
    const electron = require('electron');
    const generate_package_json = require('../../tools/generate_package_json.js');
    const MD5 = require('../../tools/MD5.js');
    const global_configuration = require('../../global_configuration.js');


    const configuration = {
        properties: [
            'name',
            'type',
            'base_path',
            'file_path',
            'icon',
            'tag',
            'description',
            'start_parameters',
            'start_folder',
            'auto_start',
            'before_run',
            'other_attribute',
        ],
    }

    function render() {
        electron.remote.getCurrentWindow().setSize(790, /* screen.height */ 180);
        electron.remote.getCurrentWindow().setPosition(screen.width - 790, 0);

        $('#button_submit').on('click', function (event) {

        });
        $('#drop_area .alert').on("dragover", function (event) {
            event.preventDefault();
            event.stopPropagation();
            $(this).addClass('dragging');
        }).on("dragleave", function (event) {
            event.preventDefault();
            event.stopPropagation();
            $(this).removeClass('dragging');
        }).on("drop", function (event) {
            event.preventDefault();
            event.stopPropagation();
            $(this).removeClass('dragging');
            var type = $(event.delegateTarget).text().trim();
            var files = Array.from(event.originalEvent.dataTransfer.files);
            files.forEach(function (file) {
                generate_package_json.generate(null, type, global_configuration.base_path, file.path.replace(/\\/g, '/'));
                // console.log(file);
            });
        });
    }
    module.exports = {
        render: render,
    }
})();