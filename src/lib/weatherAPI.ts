import type { Data, Root } from "../interfaces/WeatherResponse";

interface GetWeatherOptions {
  latitude: number;
  longitude: number;
  temp_unit: string;
}

export interface WeatherResult {
  symbol_code: string;
  wind_from_direction: number;
  wind_speed: {
    kph: number | string;
    mph: number | string;
  },
  temperature: {
    local: number | String;
    symbol: string,
    C: number | string;
    F: number | string;
  },
}

let lastResult: WeatherResult | null = null;
let lastFetchDate: number | null = null;
let cacheTime = 35 * 60 * 1000;

export async function getWeather({
  latitude,
  longitude,
  temp_unit,
}: GetWeatherOptions): Promise<WeatherResult> {
  if (lastResult && (Date.now() < lastFetchDate + (cacheTime))) {
    return lastResult;
  }
  const response = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${latitude}&lon=${longitude}`);
  if (response.ok) {
    const json = (await response.json()) as Root;
    const data: Data | null = json.properties?.timeseries[0]?.data || null;
    const temperatureC: string | number =  data?.instant?.details?.air_temperature !== undefined ? Math.floor(data?.instant?.details?.air_temperature) : 'N/A';
    const temperatureF: string | number = (temperatureC !== 'N/A') ? Math.floor((temperatureC as number) * 9 / 5 + 32) : 'N/A';
    const temperatureLocal: string | number = temp_unit == 'imperial' ? temperatureF : temperatureC;
    const temperatureSymbol: string = temp_unit == 'imperial' ? '°F' : '°C';
     
    const mph = data?.instant?.details?.wind_speed ?  Math.floor(data?.instant?.details?.wind_speed * 2.2369362921) : 'N/A';
    const kph = data?.instant?.details?.wind_speed ? Math.floor(data?.instant?.details?.wind_speed * 3.6) : 'N/A';
    lastResult = {
      symbol_code: data.next_1_hours?.summary?.symbol_code,
      wind_from_direction: data.instant.details.wind_from_direction,
      wind_speed: {
        kph,
        mph,
      },
      temperature: {
        local: temperatureLocal,
        symbol: temperatureSymbol,
        C: temperatureC,
        F: temperatureF,
      },
    };
    lastFetchDate = Date.now();
    return lastResult;
  }
  throw new Error(response.statusText);
}