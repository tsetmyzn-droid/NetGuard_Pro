import { contextBridge, ipcRenderer } from 'electron';

// Define a context bridge to expose APIs safely
contextBridge.exposeInMainWorld('api', {
    send: (channel, data) => {
        // whitelist channels
        let validChannels = ['toMain'];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        // whitelist channels
        let validChannels = ['fromMain'];
        if (validChannels.includes(channel)) {
            // Strip event and use func to receive data
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
});

// Additional security measures can be added below if necessary