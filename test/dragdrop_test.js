const dragdrop = require('./library/dragdrop.js');

const options = {
	element: '.dragdrop',
	targets: '.dragdrop-target'
}
new dragdrop.start(options, (dom, api) => {
    dom.addEventListener('drop', (event) => {
        console.log(api.orders)
    })
});