(function () {
    const fs = require('fs');
    const path = require('path');
    const extract_icon = require('../utilities/extract_icon.js');
    const MD5 = require('./MD5.js');
    const package_json_manager = require('./package_json_manager.js');


    function generate(name, type, base_path, file_path, icon, tag, description, start_parameters, start_folder, auto_start, before_run, other_attribute) {
        if (!file_path) {
            return alert('must pass file_path!');
        }
        var file_name, file_extension, relative_path, software_folder_name;
        {
            base_path[base_path.length - 1] !== '/' && (base_path += '/');
            relative_path = file_path.indexOf(base_path);
            if (0 !== relative_path) {
                return alert('base_path parameter error!');
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
        if (!type) {
            return alert('must specify the file type!');
        }
        if (!icon) {
            icon = path.join(base_path, relative_path, file_name + '.ico').replace(/\\/g, '/');
            if (!fs.existsSync(icon) && 'exe' === file_extension.toLocaleLowerCase()) {
                extract_icon.extract_icon(file_path, icon);
            }
        }
        !tag && (tag = []);
        !description && (description = '');
        !start_parameters && (start_parameters = []);
        !start_folder && (start_folder = '');
        !auto_start && (auto_start = false);
        !before_run && (before_run = []);
        !other_attribute && (other_attribute = {});
        var package_json_path = path.join(base_path, software_folder_name, 'package.json');
        var package_json = [];
        if (fs.existsSync(package_json_path)) {
            package_json = JSON.parse(fs.readFileSync(package_json_path, { encoding: 'utf8' }));
        }

        id = MD5(file_path + ' ' + start_parameters.join(' '));
        var item = Object.create(other_attribute);
        item.id = id;
        item.name = name;
        item.type = type;
        item.base_path = base_path;
        item.software_folder_name = software_folder_name;
        item.relative_file_path = relative_path + file_name + (file_extension ? ('.' + file_extension) : '');
        item.file_name = file_name;
        item.file_extension = file_extension;
        item.icon = icon;
        item.tag = tag;
        item.description = description;
        item.start_parameters = start_parameters;
        item.start_folder = start_folder;
        item.auto_start = auto_start;
        item.before_run = before_run;


        package_json.push(item);
        fs.writeFileSync(package_json_path, JSON.stringify(package_json));
        return true;
    }
    module.exports = {
        generate: generate,
    }
})();