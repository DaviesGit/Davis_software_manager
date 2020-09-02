(function () {
    const path = require('path');
    const fs = require('fs');
    const child_process = require('child_process');
    const configuration = {
        ResourcesExtract_exe_path: path.join(__dirname, 'ResourcesExtract.exe'),
    }


    function extract_icons(file, folder) {
        args = [
            '/Source', file.replace(/\//g, '\\'),
            '/DestFolder', folder.replace(/\//g, '\\'),
            '/ExtractIcons', '1',
            '/ExtractCursors', '0',
            '/ExtractBitmaps', '0',
            '/ExtractHTML', '0',
            '/ExtractManifests', '0',
            '/ScanSubFolders', '0',
            '/ExtractAnimatedIcons', '0',
            '/ExtractAnimatedCursors', '0',
            '/ExtractAVI', '0',
            '/ExtractTypeLib', '0',
            '/ExtractBinary', '0',
            '/ExtractStrings', '0',
            '/OpenDestFolder', '0',
            '/SaveBitmapAsPNG', '0',
            '/SubFolderDepth', '0',
            '/FileExistMode', '1',
            '/MultiFilesMode', '1',
        ]
        var result = child_process.execFileSync(configuration.ResourcesExtract_exe_path, args);
        return true;
    }


    function extract_icon(file, icon_path) {
        var target_folder = path.join(icon_path, '../temp_icon');
        if (fs.existsSync(target_folder)) {
            alert('target folder already existed! please check it!');
            return false;
        }
        fs.mkdirSync(target_folder);
        if (!extract_icons(file, target_folder)) {
            alert('extract icon error!');
            return false;
        }
        var target_icon_index = '',
            target_icon_filename = '';
        var icons = fs.readdirSync(target_folder);
        icons.forEach(function (icon) {
            if (-1 === target_icon_index) {
                return;
            }
            var index = icon.match(/_\d+\.ico/);
            if (!index) {
                target_icon_index = -1;
                target_icon_filename = '';
                return; //console.log('filename without index information!', icon);
            }
            index = index[0].substring(1, index[0].length - 4);
            if (target_icon_index) {
                if ((+index) < (+target_icon_index)) {
                    // fs.unlinkSync(path.join(target_folder, target_icon_filename));
                    (target_icon_index = index, target_icon_filename = icon);
                } else {
                    // fs.unlinkSync(path.join(target_folder, icon));
                }
            } else {
                target_icon_index = index;
                target_icon_filename = icon;
            }
        });
        if (!target_icon_filename && icons.length) {
            target_icon_filename = icons[0];
        }
        icons.forEach(function (icon) {
            if (icon !== target_icon_filename) {
                fs.unlinkSync(path.join(target_folder, icon));
            }
        });
        if (!target_icon_filename) {
            alert('target icon cannot been found!');
            return false;
        }
        fs.renameSync(path.join(target_folder, target_icon_filename), icon_path);
        fs.rmdirSync(target_folder);
        return true;
    }
    module.exports = {
        extract_icon: extract_icon,
        extract_icons: extract_icons,
    }
})();

