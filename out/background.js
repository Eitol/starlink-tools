/*global chrome*/
import {cellToBoundary, cellToLatLng} from "./h3.js";

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.url) {
        checkForStarlinkPage(tab.url);
    }
});


chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (tab) {
        checkForStarlinkPage(tab.url);
    });
});

function getNanoSecondsTimestampLast7Days() {
    let now = new Date();
    now.setDate(now.getDate() - 7);
    let millis = now.getTime(); // Tiempo en milisegundos desde la época Unix
    return millis * 1000000; // Convertir milisegundos a nanosegundos
}

function packCoordsToGeoJson(coords) {
    const coordinates = [];
    for (let i = 0; i < coords.length; i++) {
        coordinates.push([coords[i][0], coords[i][1]]);
    }
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "name": "Parc de la Colasdline"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                            coordinates
                    ]
                }
            }
        ]
    };
}

async function setupUpgradedView(url) {
    console.log("https://www.starlink.com/account/service-line/");
    let urlParts = url.split("/");
    let serviceLineNumber = urlParts[urlParts.length - 1];
    let ssoV1Token = await chrome.cookies.get({url: url, name: 'Starlink.Com.Access.V1'});
    let ssoToken = await chrome.cookies.get({url: url, name: 'Starlink.Com.Sso'});
    console.log("accountId", serviceLineNumber);
    console.log("ssoToken", ssoToken);
    console.log("ssoV1Token", ssoV1Token);
    let devicesResponse = await fetch(`https://api.starlink.com/webagg/v2/accounts/service-line/${serviceLineNumber}`, {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US",
            "content-type": "application/json",
            "cookie": `Starlink.Com.Sso=${ssoToken};Starlink.Com.Access.V1=${ssoV1Token}`,
        },
        "method": "GET"
    });
    let devices = await devicesResponse.json();
    console.log("devices", devices);
    let router = devices['content']['userTerminals'][0]['routers'][0];
    let routerId = router['routerId'];
    let terminalId = router['userTerminalId'];
    let accountNumber = router['accountNumber'];
    // extract from cookies
    let body = {
        "accountNumber": accountNumber,
        "filters": [{
            "operator": "in",
            "field": "DeviceId",
            "value": ['ut' + terminalId, routerId]
        }, {"operator": "gt", "field": "UtcTimestampNs", "value": getNanoSecondsTimestampLast7Days()}]
    }
    let xsrfToken = await chrome.cookies.get({url: url, name: 'XSRF-TOKEN'});
    let xsrfTokenCheck = await chrome.cookies.get({url: url, name: 'Starlink.Com.Sso.CheckSession'});
    let bodyJSON = JSON.stringify(body);
    let telemetryDataResponse = await fetch("https://api.starlink.com/device-data/cache/v1/telemetry", {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US",
            "content-type": "application/json",
            "x-xsrf-token": `${xsrfToken.value}`,
            "cookie": `Starlink.Com.Sso=${ssoToken};XSRF-TOKEN-CHECK=${xsrfTokenCheck};Starlink.Com.Access.V1=${ssoV1Token}`,
        },
        "body": bodyJSON,
        "method": "POST"
    });
    let telemetryData = await telemetryDataResponse.json();
    console.log("telemetryData", `${telemetryData}`);
    let indexes = telemetryData['data']['columnNamesByDeviceType']['u'];
    let h3IndexInValuesArray = indexes.indexOf('H3CellId');
    console.log("h3IndexInValuesArray", h3IndexInValuesArray);
    if (h3IndexInValuesArray != null && h3IndexInValuesArray > 0) {
        console.log("h3IndexInValuesArray != nul", h3IndexInValuesArray);
        let valuesArray = telemetryData['data']['values'];
        console.log("values", valuesArray);
        if (valuesArray.length > 0 && valuesArray[0].length > 0) {
            let values = valuesArray[0];
            console.log("values > 0", values);
            /* type int */
            const hexH3CellDecimal = values[h3IndexInValuesArray];
            const hexH3CellHex = hexH3CellDecimal.toString(16);
            const coords = cellToLatLng(hexH3CellHex);
            const geoJson = cellToBoundary(hexH3CellHex, true);
            console.log('hexCenterCoordinates', coords);
            let mapsUrl = "https://www.google.com/maps/search/?api=1&query=" + coords[0] + "," + coords[1]
            console.log(mapsUrl);

            chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
                for (;true;) {
                    try{
                        await chrome.tabs.sendMessage(tabs[0].id, {
                            action: "updateStarlinkID",
                            deviceMapLink: mapsUrl,
                            geoJson: packCoordsToGeoJson(geoJson),
                        });
                        break;
                    }catch (e) {
                        console.log("Error while sending message to content script", e);
                    }
                }
            });
        }
    }
}

async function checkForStarlinkPage(url) {
    if (url == null) {
        return;
    }
    if (url.includes('starlink.com/account/service-line/')) {
        await setupUpgradedView(url);
    }

}
