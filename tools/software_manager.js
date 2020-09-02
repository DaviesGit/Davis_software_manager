(function () {
    const fs = require('fs');
    const path = require('path');
    const extract_icon = require('../utilities/extract_icon.js');
    const MD5 = require('./MD5.js');

    const global_configuration = require('../global_configuration.js');
    const configuration = {
        all_software_configure: null,
    }

    function get_software_by_id(id, all_software) {
        !all_software && (all_software = configuration.all_software_configure);
        var index = get_software_index(id, all_software);
        if (-1 === index) {
            return false;
        }
        return all_software[index];
    }

    function get_software_index(id, all_software) {
        !all_software && (all_software = configuration.all_software_configure);
        for (var i = 0; i < all_software.length; ++i) {
            if (id === all_software[i].id) {
                return i;
            }
        }
        return -1;
    }


    function delete_software_by_index(index, all_software) {
        !all_software && (all_software = configuration.all_software_configure);
        var software = all_software[index];
        all_software[index] = global_configuration.empty_software_placeholder;
        return software;
    }

    function delete_software_by_id(id, all_software) {
        !all_software && (all_software = configuration.all_software_configure);
        var index = get_software_index(id, all_software);
        if (-1 === index) {
            return false;
        }
        return delete_software_by_index(index);
    }

    function add_software(software, index, all_software) {
        !all_software && (all_software = configuration.all_software_configure);
        if ('number' !== typeof index) {
            index = get_software_index('', all_software);
        }
        if (all_software[index].id) {
            return -1;
        }
        all_software[index] = software;
        return index;
    }

    function init(all_software_configure) {
        configuration.all_software_configure = all_software_configure;
    }
    function get_all_software_configure() {
        return configuration.all_software_configure;
    }

    module.exports = {
        get_software_by_id: get_software_by_id,
        get_software_index: get_software_index,
        delete_software_by_index: delete_software_by_index,
        delete_software_by_id: delete_software_by_id,
        add_software: add_software,
        init: init,
        get_all_software_configure: get_all_software_configure,
    }

})();