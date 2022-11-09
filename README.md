# Weather Overlay

An overlay that shows the current weather of a give latitude and longitude:

https://weather-overlay.surge.sh/?lat=39.704555&lon=-105.087551

* Weather Data provided by [MET Norway](https://api.met.no/)
* Icons provided by [nrkno/yr-weather-symbols](https://github.com/nrkno/yr-weather-symbols)

# TODO

* Settings / Customization / URL Generator Page:
  * Location
    * Latitude / Longitude
    * City Name
    * Zip Code??
  * Number of Seconds to stay on screen
  * Number of Seconds between showing on screen
  * Text
    * Font
    * Size
    * Outline
  * Background
    * Color
    * Opacity
  * Temperature Units
    * F
    * C
    * Both
      * Animation to switch between the 2
  * Wind Speed Units
  * Show the Time
    * 12 Hour
    * 24 Hour
* Use cache header from API response to determine when to make next request.

# Setup and Development

```sh
npm i
npm run dev
```