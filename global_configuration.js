(function () {
    const configuration = {
        base_path: 'S:/software_binary',
        empty_software_placeholder: {
            id: '',
            name: ' ',
            type: '', // software, library, framework, source, document, 
            base_path: '',
            software_folder_name: '',
            relative_file_path: '', //use relative path
            file_name: '',
            file_extension: '',
            icon: 'data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==', /* if  is using default software.ico in software.exe folder*/
            tag: [],
            description: '',
            start_parameters: [],
            start_folder: '',
            auto_start: false,
            before_run: [],
        },
        total_software: 24 * 9,
        work_directory: 'P:/default_software_directory',
    };
    module.exports = configuration;
})();