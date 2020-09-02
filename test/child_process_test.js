
const child_process = require('child_process');
var child = child_process.spawn('cmd.exe');
child.stdout.on('data', function (data) {

});
child.stderr.on('data', function (data) {

});
child.on('close', function (code) {
    if (9009 === code) {

    }
    console.log('code:', code);
});
child.stdin.write('');


var external_command = require('./tools/external_command.js');
external_command. execute_commands(['echo hello', 'dir'],
    function (data) {
        console.log(data);
    },
    function (data) {
        console.log(data);
    });
