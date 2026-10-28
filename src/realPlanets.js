// The real planets: distance to the Sun (AU), year (Earth days), orbital speed (km/s), mass (Earth masses), eccentricity.
// The game puts them at other distances, so that they all fit on the screen (see planetData in StarScene.jsx),
// but keeps the real proportions of their years.
export const realPlanets = {
  mercury: { distance: 0.387, year: 88, speed: 47.4, mass: 0.055, eccentricity: 0.206 },
  venus: { distance: 0.723, year: 224.7, speed: 35, mass: 0.815, eccentricity: 0.007 },
  earth: { distance: 1, year: 365.25, speed: 29.8, mass: 1, eccentricity: 0.017 },
  mars: { distance: 1.524, year: 687, speed: 24.1, mass: 0.107, eccentricity: 0.093 },
  jupiter: { distance: 5.2, year: 4333, speed: 13.1, mass: 317.8, eccentricity: 0.049 },
  saturn: { distance: 9.58, year: 10759, speed: 9.7, mass: 95.2, eccentricity: 0.057 },
  uranus: { distance: 19.2, year: 30687, speed: 6.8, mass: 14.5, eccentricity: 0.046 },
  neptune: { distance: 30.05, year: 60190, speed: 5.4, mass: 17.1, eccentricity: 0.01 },
};
