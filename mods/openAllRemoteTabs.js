/* opens all tabs from another device in current window */

let other_device_name = "NAME_OF_OTHER_DEVICE_HERE";

chrome.sessions.getDevices(devices => {
    const selectedDevice = devices.find(x => x.deviceName===other_device_name);
    selectedDevice.sessions.forEach(session => {
        session.window.tabs.forEach(tab => {
            chrome.tabs.create({url: tab.url});
        });
    });
});
