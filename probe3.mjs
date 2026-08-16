import circularNatalHoroscope from "circular-natal-horoscope-js";
const { Origin, Horoscope } = circularNatalHoroscope;
const origin = new Origin({ year: 1990, month: 5, date: 15, hour: 14, minute: 30, latitude: 40.7128, longitude: -74.006 });
const horoscope = new Horoscope({
  origin, houseSystem: "placidus", zodiac: "tropical",
  aspectPoints: ["bodies", "angles"], aspectWithPoints: ["bodies", "angles"],
  aspectTypes: ["major"], language: "en",
});
console.log(Object.keys(horoscope.Ascendant));
console.log(horoscope.Ascendant.ChartPosition.Ecliptic.DecimalDegrees);
console.log(horoscope.Midheaven.ChartPosition.Ecliptic.DecimalDegrees);
console.log(horoscope._houses.map(h=>({id:h.id, deg: h.ChartPosition.StartPosition.Ecliptic.DecimalDegrees})));
