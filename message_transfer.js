(function () {
    const electron = require('electron');

    const all_windows = {};
    // 'window_name':{
    //     window_name:'window_name',
    //     window:window,
    // }
    function message_transfer(event, info) {
        var target_window = all_windows[info.target_window_name];
        if (!target_window) {
            event.returnValue = false;
        }
        event.returnValue = target_window.window.webContents.send('transfer_message', info.message);
    }
    electron.ipcMain.on('transfer_message', message_transfer);
    function add_new_window(window, window_name) {
        all_windows[window_name] = {
            window_name: window_name,
            window: window,
        };
    }
    function remove_window(window_name) {
        delete all_windows[window_name];
    }
    module.exports = {
        add_new_window: add_new_window,
        remove_window: remove_window,
    }
})();