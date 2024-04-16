# Starlink management tools  🚀  

![docs/maps.png](public/icons/icon192.png)

## Features

### Terminal Geo location

You must install the extension and then go to your device detail. There you will see two buttons that were added

![docs/geo_button.png](docs/geo_buttons.png)

- View the actual location of the dish. If you click on "View in Map" you will be redirected to a Google Maps map that contains the central location of cell H3 where said antenna is.
![docs/maps.png](docs/maps.png)
- See the H3 cell assigned to your dish. If you click there, the GeoJSON polygon of cell H3 will be copied to your clipboard and then the GeoJSON page will open so you can proceed to paste the value and view the cell
![docs/maps.png](docs/geojson.png)

#### How does it work?

Within the telemetry data obtained from the page, the id of cell H3 where the antenna is located is encoded. This does not give us an exact result, but it allows us to know approximately where it is located.


