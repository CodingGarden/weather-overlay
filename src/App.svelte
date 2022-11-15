<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import type { WeatherResult } from "./lib/weatherAPI";
  import { getWeather } from "./lib/weatherAPI";

  let currentWeather: WeatherResult | null = null;
  let weatherVisible = false;
  const params = new URLSearchParams(window.location.search);
  let errorMessage = "";
  let showMetric = false;
  let showDuration = 10 * 1000;
  let hideDuration = 60 * 1000;

  if (!params.has("lat") || !params.has("lon")) {
    errorMessage =
      "Requires location parameters in the url.\n\nExample: https://site.location.com/?lat=40.7128&lon=74.0060";
  } else {
    getLatestAndShowOrHide();
  }

  async function getCurrentWeather() {
    try {
      currentWeather = await getWeather({
        latitude: Number(params.get("lat")),
        longitude: Number(params.get("lon")),
      });
    } catch (error) {
      errorMessage = error.message;
    }
  }

  async function getLatestAndShowOrHide() {
    if (!weatherVisible) {
      showMetric = false;
      await getCurrentWeather();
      weatherVisible = true;
      setTimeout(() => (showMetric = true), showDuration / 2);
      setTimeout(getLatestAndShowOrHide, showDuration);
    } else {
      weatherVisible = false;
      setTimeout(getLatestAndShowOrHide, hideDuration);
    }
  }
  
  function getWindDirectionFrom(deg:number, type=1) {
    const windDirTypes = [
      "N,NNE,NE,ENE,E,ESE,SE,SSE,S,SSW,SW,WSW,W,WNW,NW,NNW",
      "N,NE,E,SE,S,SW,W,NW",
    ];
    const windDirs = windDirTypes[type].split(",");
    const sections = 360 / windDirs.length;
    return windDirs[Math.floor((deg + sections * .5) / sections) % windDirs.length];
  }
  
</script>

<main>
  {#if errorMessage}
    <div class="error">{errorMessage}</div>
  {/if}
  {#if currentWeather && weatherVisible}
    <div class="container" transition:fly="{{ x: -600, duration: 2000 }}">
      <div class="background"></div>
      <div class="symbol-container">
        <img
          src={`images/svg/${currentWeather.symbol_code}.svg`}
        />
      </div>
      <div class="temperature">
        {#if !showMetric}
          <span out:fade={{ duration: 800 }}>
            {currentWeather.temperature.F}<span class="unit">°F</span>
          </span>
        {:else}
          <span in:fade={{ duration: 800 }}>
            {currentWeather.temperature.C}<span class="unit">°C</span>
          </span>
        {/if}
      </div>
      <div class="wind">
        <div class="wind-direction" style:transform={`rotate(${currentWeather.wind_from_direction}deg)`}>
          <svg id="windIcon" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="--iconColor: currentColor" class="arrow-wind-icon">
            <text 
                  fill=var(--iconColor) 
                  font-size={["6","5","4"][getWindDirectionFrom(currentWeather.wind_from_direction).length - 1]} 
                  x="12" 
                  y="5.5" 
                  text-anchor="middle" 
                  dominant-baseline="central" 
                  transform={`rotate(-${currentWeather.wind_from_direction}, 12, 5.5)`}>
              {getWindDirectionFrom(currentWeather.wind_from_direction)}
            </text>
            <g fill="none" stroke=var(--iconColor) stroke-width="1.5" stroke-linecap="round">
              <path d="M21.4068 8.52621C23.8403 12.0403 18 13.6711 18 9.62277L18 2" />
              <path d="M2.59317 8.52621C0.159734 12.0403 5.99998 13.6711 5.99999 9.62277V2"/>
              <path d="M6 16L11.8232 21.8232C11.9209 21.9209 12.0791 21.9209 12.1768 21.8232L18 16"/>
              <path d="M12 12V21"/>
              <path d="M18 6C18 9.31371 15.3137 12 12 12C8.68629 12 6 9.31371 6 6"/>
              </g>
          </svg>
        </div>
        <div class="wind-speed">
          {#if !showMetric}
            <span out:fade={{ duration: 800 }}>
              {currentWeather.wind_speed.mph} mph
            </span>
          {:else}
            <span in:fade={{ duration: 800 }}>
              {currentWeather.wind_speed.kph} km/h
           </span>
          {/if}
        </div>
      </div>
      <div class="credit">
        Data from MET Norway
      </div>
    </div>
  {/if}
</main>

<style>
  main {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20vmin;
    color: white;
    font-weight: 800;
  }

  .temperature {
    text-align: center;
    line-height: 20vmin;
    display: grid;
  }

  .temperature span {
    grid-area: 1/1;
  }
  
  .container {
    width: 55vmin;
    position: relative;
    padding-top: 1vmin;
    padding-left: 4vmin;
    padding-right: 4vmin;
    padding-bottom: 3vmin;
  }

  .background {
    position: absolute;
    border-radius: 20px;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: -1;
    background: rgba(0, 0, 0, 0.7);
  }

  .symbol-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .symbol-container img {
    width: 50%;
    filter: drop-shadow(10px 10px 10px black);
  }

  .wind {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: -2vmin;
  }

  .arrow-wind-icon {
    width: 11vmin;
    height: 11vmin;
  }

  .wind-direction {
    display: inline-flex;
    transform-origin: center;
    justify-content: center;
    align-items: flex-end;
  }

  .wind-speed {
    margin-left: 2vmin;
    font-size: 6vmin;
    display: grid;
  }
  
  .wind-speed span {
    grid-area: 1/1;
  }

  .unit {
    margin-left: 2vmin;
    font-size: 10vmin;
  }

  .credit {
    margin-top: 2vmin;
    font-size: 2vmin;
    font-style: italic;
    text-align: center;
    font-weight: 200;
  }

  div.error {
    font-size: 5vmin;
    font-weight: 200;
    text-align: center;
    color: black;
    background-color: white;
  }
</style>
