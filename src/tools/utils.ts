export const getWeather = (city: string): string => {
  const weather: Record<string, string> = {
    Bogra: "Sunny",
    Dhaka: "Rainy",
    Chittagong: "Cloudy",
  };
  return weather[city] || "weather data not available";
};

export const getTime = (city: string): string => {
  const timeZones: Record<string, string> = {
    Bogra: "11:30am GMT+6",
    Dhaka: "11:30am GMT+6",
    Chittagong: "11:30am GMT+6",
  };
  return timeZones[city] || "time zone data not available";
};

export const getCurrency = (country: string): string => {
  const currencies: Record<string, string> = {
    Bangladesh: "Bangladeshi Taka (BDT)", //*lets add some random text to this but summarized version of gpt will ignore this if its out of context
    India: "Indian Rupee (INR)",
    USA: "US Dollar (USD)",
  };
  return currencies[country] || "currency data not available";
};
