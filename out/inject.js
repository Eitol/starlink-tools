function createViewInMapButton(request) {
    const button = document.createElement("button");
    button.className = "mat-tooltip-trigger button button-outlined";
    button.id = "get-map-button-id";
    button.setAttribute("ngstyle.lt-md", "margin-top:20px");
    button.setAttribute("app-enable-on-permissions", "");
    button.setAttribute("aria-describedby", "cdk-describedby-message-1");
    button.setAttribute("cdk-describedby-host", "");
    button.setAttribute("style", "margin-right: 15px;");
    button.innerText = "View on Map";
    button.onclick = function () {
        window.open(request.deviceMapLink, '_blank');
    };
    return button;
}

function createGeoJsonButton(request) {
    const button = document.createElement("button");
    button.className = "mat-tooltip-trigger button button-outlined";
    button.id = "get-geojson-button-id";
    button.setAttribute("ngstyle.lt-md", "margin-top:20px");
    button.setAttribute("app-enable-on-permissions", "");
    button.setAttribute("aria-describedby", "cdk-describedby-message-1");
    button.setAttribute("cdk-describedby-host", "");
    button.setAttribute("style", "margin-right: 15px;");
    button.innerText = "Copy GeoJSON";
    button.onclick = function () {
        navigator.clipboard.writeText(JSON.stringify(request.geoJson)).then(function () {
            console.log('GeoJSON copied to clipboard');
            window.open("https://geojson.io/#map=2/", '_blank');
        });
    };
    return button;
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "updateStarlinkID") {
        const contentDivList = document.getElementsByTagName("app-service-line-detail");
        if (contentDivList.length > 0) {
            const contentDiv = contentDivList[0]; // suppose you want to
            if (document.getElementById("get-map-button-id")) {
                return;
            }
            const newDiv = document.createElement("div");
            // Aquí estableces el contenido del nuevo div
            newDiv.id = "your-map-container-id";

            const viewInMapButton = createViewInMapButton(request);
            const geoJsonButton = createGeoJsonButton(request);
            newDiv.appendChild(viewInMapButton);
            newDiv.appendChild(geoJsonButton);
            contentDiv.appendChild(newDiv);
        }
    }
});