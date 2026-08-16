import circularNatalHoroscope from "circular-natal-horoscope-js";
const { Origin, Horoscope } = circularNatalHoroscope;
const origin = new Origin({ year: 1990, month: 5, date: 15, hour: 14, minute: 30, latitude: 40.7128, longitude: -74.006 });
const horoscope = new Horoscope({
  origin, houseSystem: "placidus", zodiac: "tropical",
  aspectPoints: ["bodies", "angles"], aspectWithPoints: ["bodies", "angles"],
  aspectTypes: ["major"], language: "en",
});
console.log(Object.keys(horoscope.Aspects));
const bodies = ["sun","moon","mercury","venus","mars","jupiter","saturn","uranus","neptune","pluto"];
const filtered = horoscope.Aspects.all.filter(a => bodies.includes(a.point1Key) && bodies.includes(a.point2Key));
console.log(filtered.length);
console.log(JSON.stringify(filtered.slice(0,5), null, 2));
console.log(Object.keys(horoscope.CelestialBodies.sun));
console.log(horoscope.CelestialBodies.sun.ChartPosition.Ecliptic);
