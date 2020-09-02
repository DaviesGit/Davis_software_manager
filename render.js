(function () {
    const jQuery = require('./library/jquery-3.2.1.js'),
        $ = jQuery;
    const dragdrop = require('./library/dragdrop.js');
    const path = require('path');
    const fs = require('fs');
    const url = require('url')
    const electron = require('electron');
    const child_process = require('child_process');
    const package_json_manager = require('./tools/package_json_manager.js');
    const global_configuration = require('./global_configuration.js');
    const software_manager = require('./tools/software_manager.js');
    const external_command = require('./tools/external_command.js');


    const configuration = {
        all_software_configure_path: path.join(__dirname, '../Davis_configuration/software_configure.json'),
        default_directory: 'P:/default_software_directory',
    }

    function get_all_software_configure() {
        if (fs.existsSync(configuration.all_software_configure_path)) {
            return JSON.parse(fs.readFileSync(configuration.all_software_configure_path, { encoding: 'utf8' }));
        } else {
            return [];
        }
    }
    function storage_all_software_configure(all_software_configure) {
        fs.writeFileSync(configuration.all_software_configure_path, JSON.stringify(all_software_configure));
    }
    function get_software_by_id(id, all_software) {
        for (var software of all_software) {
            if (id === software.id) {
                return software;
            }
        }
        return false;
    }
    function get_update_software_list() {
        function get_all_software() {
            var all_software = [];
            software_directories = fs.readdirSync(global_configuration.base_path);
            software_directories.forEach(function (directory) {
                var software_path = path.join(global_configuration.base_path, directory, 'package.json');
                if (fs.existsSync(software_path)) {
                    var software = JSON.parse(fs.readFileSync(software_path, { encoding: 'utf8' }));
                    all_software = all_software.concat(software);
                }
            });
            return all_software;
        }
        var all_software = get_all_software();
        var all_software_configure = get_all_software_configure();
        for (var i = 0; i < all_software_configure.length; ++i) {
            if ('' !== all_software_configure[i].id) {
                if (!get_software_by_id(all_software_configure[i].id, all_software)) {
                    all_software_configure.splice(i, 1);
                    --i;
                }
            }
        }
        for (var i = 0; i < all_software.length; ++i) {
            if (!get_software_by_id(all_software[i].id, all_software_configure)) {
                software_manager.add_software(all_software[i], null, all_software_configure);
            }
        }
        while (all_software_configure.length < global_configuration.total_software) {
            all_software_configure.push(global_configuration.empty_software_placeholder);
        }
        while (all_software_configure.length > global_configuration.total_software) {
            if (!all_software_configure[all_software_configure.length].id) {
                all_software.pop();
            } else {
                break;
            }
        }
        storage_all_software_configure(all_software_configure);
        return all_software_configure;
    }

    function open_software(software_id, /* thumbnail, */ start_parameters, start_folder, before_run) {
        var software = software_manager.get_software_by_id(software_id);
        !start_parameters && (start_parameters = software.start_parameters);
        !start_folder && (start_folder = software.start_folder);
        !before_run && (before_run = software.before_run);
        switch (software.type) {
            case 'software':
                start_software(path.join(software.base_path, software.relative_file_path), start_parameters, start_folder, before_run);
                break;
            case 'batch':
                call_batch_file(path.join(software.base_path, software.relative_file_path), start_parameters, start_folder, before_run);
                break;
            default:

        }
        // if (thumbnail) {
        //     $(thumbnail).removeClass('open_animation');
        //     setTimeout(function () {
        //         $(thumbnail).addClass('open_animation');
        //     });
        // }
        return true;
    }

    function init_software_list(all_software_configure) {
        var all_software = Array.from(all_software_configure);
        all_software.forEach(function (software, index, array) {
            software = `
                        <div class="_col-1 dragdrop-target">
                            <figure data-id=`+ index + (software.id ? (` data-software_id="` + software.id + '"') : '') + ` class="figure software_container dragdrop">
                                <img draggable="false" title="`+ software.description + `" class="img-fluid figure-img w-100" src="` + software.icon + `">
                                <figcaption title="`+ software.name + `" class="figure-caption text-center">` + software.name + `</figcaption>
                            </figure>
                        </div>`;
            array[index] = software;
        });
        $('#all_software').html(all_software.join('\n'));
        $('.software_container[data-software_id]').dblclick(function (event) {
            var software_id = $(event.delegateTarget).data('software_id');
            open_software(software_id);
            hide_window();
        }).contextmenu(function (event) {
            var software_id = $(event.delegateTarget).data('software_id');
            var top = event.clientY > window.innerHeight - 130 ? window.innerHeight - 130 : event.clientY;
            var left = event.clientX > window.innerWidth - 180 ? window.innerWidth - 180 : event.clientX;
            $('#menu')
                .data('software_id', software_id)
                .css('left', left)
                .css('top', top);
            $('#menu_overlay').show();

            // console.log(event);
        }).on("dragover", function (event) {
            event.preventDefault();
            event.stopPropagation();
            $(event.delegateTarget).addClass('dragging');
        }).on("dragleave", function (event) {
            event.preventDefault();
            event.stopPropagation();
            $(event.delegateTarget).removeClass('dragging');
        }).on("drop", function (event) {
            event.preventDefault();
            event.stopPropagation();
            $(event.delegateTarget).removeClass('dragging');
            var software_id = $(event.delegateTarget).data('software_id');
            var files = Array.from(event.originalEvent.dataTransfer.files);
            files = files.map(file => '"' + file.path + '"');
            open_software(software_id, files);
            hide_window();
        });;

    }

    function start_software(software, start_parameters, start_folder, before_run) {
        var start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
        software = path.join(software);
        !start_parameters && (start_parameters = []);
        !before_run && (before_run = []);
        start_parameters = start_parameters.join(' ');
        var commands = Array.from(before_run);
        commands.push(start + ' ""' + (start_folder ? (' /D "' + start_folder + '"') : '') + ' "' + software + '" ' + start_parameters);
        external_command.execute_commands(commands, /* e => console.log(e.data+''), e => console.log(e.data+'') */);
    }

    function call_batch_file(software, start_parameters, start_folder, before_run) {
        start_software('cmd.exe', ['/c', 'call', '"' + software + '"'].concat(start_parameters), start_folder, before_run);
    }

    function run_command(command) {
        switch (command.type) {
            case 'delete_software':
                software_manager.delete_software_by_id(command.software.id);
                package_json_manager.delete_software_by_id(command.software.id);
                var all_software_configure = software_manager.get_all_software_configure();
                init_software_list(all_software_configure);
                storage_all_software_configure(all_software_configure);
                break;
            case 'update_software':
                var index = software_manager.get_software_index(command.old_software.id);
                software_manager.delete_software_by_id(command.old_software.id);
                package_json_manager.delete_software_by_id(command.old_software.id);
                software_manager.add_software(command.new_software, index);
                package_json_manager.add_software(command.new_software);
                var all_software_configure = software_manager.get_all_software_configure();
                init_software_list(all_software_configure);
                storage_all_software_configure(all_software_configure);
                break;
            default:
                return false;
        }
        return true;
    }

    electron.ipcRenderer.on('transfer_message', function (event, arg) {
        switch (arg.type) {
            case 'command':
                event.returnValue = run_command(arg.command);
                break;
            default:
                event.returnValue = false;
        }
    });

    function register_once_callback(callback_function, callback_name) {
        !callback_name && (callback_name = 'callback_' + Math.floor(Math.random() * 1e10));
        electron.ipcRenderer.once(callback_name, callback_function);
        return callback_name;
    }
    function register_callback(callback_function, callback_name) {
        !callback_name && (callback_name = 'callback_' + Math.floor(Math.random() * 1e10));
        electron.ipcRenderer.on(callback_name, callback_function);
        return callback_name;
    }
    function remove_registered_callback(callback_name, callback_function) {
        if (!callback_function) {
            electron.ipcRenderer.removeAllListeners(callback_name);
        } else {
            electron.ipcRenderer.removeListener(callback_name, callback_function);
        }
    };

    function init_page() {
        $('#menu button').on('click', function (event) {
            var id = event.delegateTarget.id;
            $('#menu_overlay').hide();
            var software_id = $('#menu').data('software_id');
            switch (id) {
                case 'menu_open':
                    open_software(software_id);
                    hide_window();
                    break;
                case 'menu_open_folder':
                    var software = software_manager.get_software_by_id(software_id);
                    var software_path = path.join(software.base_path, software.relative_file_path);
                    start_software('explorer.exe', ['/select, "' + software_path + '"']);
                    hide_window();
                    break;
                case 'menu_setting':
                    var software = software_manager.get_software_by_id(software_id);
                    var callback_name = register_once_callback(function (event, arg) {
                        electron.ipcRenderer.sendSync('transfer_message', {
                            target_window_name: 'edit_software_window',
                            message: {
                                software: software,
                            },
                        });
                        event.returnValue = true;
                    });
                    var edit_software_window = electron.ipcRenderer.sendSync('open_window', {
                        window_basic_info: {
                            width: 790,
                            height: 850,
                        },
                        window_name: 'edit_software_window',
                        url: url.format({
                            pathname: path.join(__dirname, './page/edit_software/edit_software.html'),
                            protocol: 'file:',
                            slashes: true
                        }),
                        dom_ready: callback_name,
                    });
                    // var edit_window = window.open('./page/edit_software/edit_software.html');
                    // edit_window.eval('window.software_id=\'' + software_id + '\';');
                    break;
                default:
            };
            // console.log(software_id);
        });
        $('#menu_overlay').click(function (event) {
            $('#menu_overlay').hide();
        });
        var is_edit_order = false;
        var current_order = null;
        $('#button_edit_order').click(function (event) {
            if (is_edit_order) {
                is_edit_order = false;
                var all_software_configure = software_manager.get_all_software_configure();
                var _all_software_configure = {};
                Object.assign(_all_software_configure, all_software_configure);
                current_order.forEach(function (order, index) {
                    all_software_configure[index] = _all_software_configure[order.elementId];
                });
                init_software_list(all_software_configure);
                storage_all_software_configure(all_software_configure);
                $(event.delegateTarget).attr('class', 'btn btn-primary').text('edit order');
            } else {
                is_edit_order = true;
                current_order = null;
                new dragdrop.start((dom, api) => {
                    dom.addEventListener('drop', (event) => {
                        current_order = api.orders;
                    })
                });
                $(event.delegateTarget).attr('class', 'btn btn-danger').text('confirm');
            }
        });
    }
    function start_auto_start() {
        var all_software = software_manager.get_all_software_configure();
        all_software.forEach(function (software) {
            if (software.id && software.auto_start) {
                open_software(software.id)
            }
        });
    }
    function hide_window() {
        electron.remote.getCurrentWindow().hide();
    }
    function show_window() {
        electron.remote.getCurrentWindow().show();
    }

    function render() {
        $(window).keydown(function (event) {
            if (event.ctrlKey) {
                switch (event.keyCode) {
                    case 'D'.charCodeAt(0):
                        var edit_software_window = electron.ipcRenderer.sendSync('open_window', {
                            window_basic_info: {
                                // width: 790,
                                // height: 780,
                            },
                            window_name: 'add_software_window',
                            url: url.format({
                                pathname: path.join(__dirname, './page/add_software/add_software.html'),
                                protocol: 'file:',
                                slashes: true
                            }),
                        });
                        hide_window();
                        break;
                    case 'M'.charCodeAt(0):
                        break;
                    case 'O'.charCodeAt(0):
                        break;
                    default:
                        break;
                }
            }
            if (27 === event.keyCode) {
                hide_window();
            }
        });
        var all_software_configure = get_update_software_list();
        software_manager.init(all_software_configure);
        init_software_list(all_software_configure);
        init_page();
        start_auto_start();

        // debugger;
        // all_software_configure.forEach(function (software) {
        //     software.auto_start = global_configuration.empty_software_placeholder.auto_start;
        //     software.before_run = global_configuration.empty_software_placeholder.before_run;
        //     if (software.id) {
        //         package_json_manager.delete_software_by_id(software.id);
        //         package_json_manager.add_software(software);
        //     }
        // });
        // storage_all_software_configure(all_software_configure);


    }

    module.exports = {
        render: render,
    }
})();