var worker = new Worker(chrome.runtime.getURL('worker.js'));
worker.onmessage = function(event) {
    alert('Message from worker: ' + event.data);
};