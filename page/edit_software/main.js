(function () {
    const jQuery = require('../../library/jquery-3.2.1.js'),
        $ = jQuery;
    const path = require('path');
    const fs = require('fs');
    const electron = require('electron');
    const generate_package_json = require('../../tools/package_json_manager.js');
    const package_json_manager = require('../../tools/package_json_manager.js');
    const MD5 = require('../../tools/MD5.js');


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
        package_properties: [
            'id',
            'name',
            'type',
            'base_path',
            'software_folder_name',
            'relative_file_path',
            'file_name',
            'file_extension',
            'icon',
            'tag',
            'description',
            'start_parameters',
            'start_folder',
            'auto_start',
            'before_run',
        ],
        software: null,
    }
    function transfer_message(message) {
        return electron.ipcRenderer.sendSync('transfer_message', message);
    }

    electron.ipcRenderer.on('transfer_message', function (event, arg) {
        configuration.software = arg.software;
        var software = {};
        Object.assign(software, configuration.software);
        delete software.id;
        for (var property of configuration.properties) {
            switch (property) {
                case 'file_path':
                    var file_path = path.join(software.base_path, software.relative_file_path).replace(/\\/g, '/');
                    $('#' + property).val(file_path);
                    break;
                case 'tag':
                    $('#' + property).val(JSON.stringify(software[property]));
                    break;
                case 'start_parameters':
                    $('#' + property).val(JSON.stringify(software[property]));
                    break;
                case 'auto_start':
                    $('#' + property).prop('checked', software[property]);
                    break;
                case 'before_run':
                    $('#' + property).val(JSON.stringify(software[property]));
                    break;
                case 'other_attribute':
                    break;
                default:
                    $('#' + property).val(software[property]);
            }
        }
        for (var property of configuration.package_properties) {
            delete software[property];
        }
        $('#' + 'other_attribute').val(JSON.stringify(software));
        event.returnValue = true;
    });

    function render() {
        // electron.remote.getCurrentWindow().setSize(790, screen.height - 300);
        // electron.remote.getCurrentWindow().setPosition(screen.width - 790, 0);

        $('#button_cancel').on('click', function (event) {
            window.close();
        });
        $('#button_delete').on('click', function (event) {
            transfer_message({
                target_window_name: 'main_window',
                message: {
                    type: 'command',
                    command: {
                        type: 'delete_software',
                        software: configuration.software,
                    },
                },
            });
            window.close();
        });
        $('#button_confirm').on('click', function (event) {
            var _software = {},
                software = {};
            Object.assign(software, configuration.software);
            if (!software) {
                alert('system error! cannot find configuration.software');
                return false;
            }
            for (var property of configuration.properties) {
                switch (property) {
                    case 'auto_start':
                        _software[property] = $('#' + property).prop('checked');
                        break;
                    default:
                        _software[property] = $('#' + property).val();
                }
            }
            software.name = _software.name;
            software.type = _software.type;
            software.base_path = _software.base_path;
            software.icon = _software.icon;
            software.description = _software.description;
            software.start_folder = _software.start_folder;
            software.auto_start = _software.auto_start;
            var file_info = package_json_manager.generate_file_info(_software.base_path, _software.file_path);
            if (!file_info) {
                alert('file path info error! pease check it!');
                return false;
            }
            software.software_folder_name = file_info.software_folder_name;
            software.relative_file_path = file_info.relative_file_path;
            software.file_name = file_info.file_name;
            software.file_extension = file_info.file_extension;
            try {
                software.tag = JSON.parse(_software.tag);
                software.start_parameters = JSON.parse(_software.start_parameters);
                software.before_run = JSON.parse(_software.before_run);
                var other_attribute = JSON.parse(_software.other_attribute);
                Object.assign(software, other_attribute);
            } catch (e) {
                console.error(e);
                alert('json data format error!');
                return false;
            }
            software.id = package_json_manager.generate_software_id(_software.file_path, software.start_parameters);
            transfer_message({
                target_window_name: 'main_window',
                message: {
                    type: 'command',
                    command: {
                        type: 'update_software',
                        old_software: configuration.software,
                        new_software: software,
                    },
                },
            });
            window.close();
        });
    }
    module.exports = {
        render: render,
    }
})();

