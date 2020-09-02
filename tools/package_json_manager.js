(function () {
    const fs = require('fs');
    const path = require('path');
    const extract_icon = require('../utilities/extract_icon.js');
    const MD5 = require('./MD5.js');

    const global_configuration = require('../global_configuration.js');

    function storage_package(package_path, package) {
        fs.writeFileSync(package_path, JSON.stringify(package));
    }
    function get_package(package_path) {
        var package = false;
        if (!fs.existsSync(package_path)) {
            return false;
        }
        try {
            package = JSON.parse(fs.readFileSync(package_path, { encoding: 'utf8' }));
        } catch (e) {
            console.error(e);
            return false;
        }
        return package;
    }

    function get_all_software(base_path) {
        var all_software = [];
        software_directories = fs.readdirSync(base_path);
        software_directories.forEach(function (directory) {
            var software_path = path.join(base_path, directory, 'package.json');
            if (fs.existsSync(software_path)) {
                var software = JSON.parse(fs.readFileSync(software_path, { encoding: 'utf8' }));
                all_software = all_software.concat(software);
            }
        });
        return all_software;
    }

    function get_software_by_id(id, all_software) {
        for (var software of all_software) {
            if (id === software.id) {
                return software;
            }
        }
        return false;
    }
    function remove_software_by_id(id, all_software) {
        for (var i = 0, len = all_software.length; i < len; ++i) {
            if (id === all_software[i].id) {
                all_software.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    function generate_file_info(base_path, file_path) {
        var name, icon, file_name, file_extension, relative_path, software_folder_name;
        if (!file_path) {
            return false;
        }
        {
            base_path[base_path.length - 1] !== '/' && (base_path += '/');
            relative_path = file_path.indexOf(base_path);
            if (0 !== relative_path) {
                return false;
            }
            relative_path = './' + file_path.replace(base_path, '');
            relative_path = relative_path.substring(0, relative_path.length - path.basename(file_path).length);
            software_folder_name = relative_path.match(/\.\/[^\/]+\//)[0];
            software_folder_name = software_folder_name.substring(2, software_folder_name.length - 1);
            file_name = path.basename(file_path);
            var index = file_name.lastIndexOf('.');
            if (-1 !== index) {
                file_extension = file_name.substr(index + 1);
                file_name = file_name.substring(0, index);
            } else {
                file_extension = '';
            }
        }
        !name && (name = file_name);
        !icon && (icon = path.join(base_path, relative_path, file_name + '.ico').replace(/\\/g, '/'));

        var item = {};
        item.name = name;
        item.base_path = base_path;
        item.software_folder_name = software_folder_name;
        item.relative_path = relative_path;
        item.relative_file_path = relative_path + file_name + (file_extension ? ('.' + file_extension) : '');
        item.file_name = file_name;
        item.file_extension = file_extension;
        item.icon = icon;

        return item;
    }

    function generate_software_id(file_path, start_parameters) {
        id = MD5(file_path + ' ' + start_parameters.join(' '));
        return id;
    }

    function delete_software_by_id(id) {
        var all_software = get_all_software(global_configuration.base_path);
        var software = get_software_by_id(id, all_software);
        return delete_software(software);
    }
    function delete_software(software) {
        var package_path = path.join(software.base_path, software.software_folder_name, 'package.json');
        var package = get_package(package_path);
        if (!package) {
            return false;
        }
        if (!remove_software_by_id(software.id, package)) {
            return false;
        }
        storage_package(package_path, package);
        return true;
    }
    function add_software(software) {
        var package_path = path.join(software.base_path, software.software_folder_name, 'package.json');
        var package = get_package(package_path);
        !package && (package = []);
        package.push(software);
        storage_package(package_path, package);
    }

    module.exports = {
        get_package: get_package,
        get_all_software: get_all_software,
        get_software_by_id: get_software_by_id,
        remove_software_by_id: remove_software_by_id,
        generate_file_info: generate_file_info,
        generate_software_id: generate_software_id,
        delete_software_by_id: delete_software_by_id,
        delete_software: delete_software,
        add_software: add_software,
    }
})();