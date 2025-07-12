// Configuration and Data Module
// Contains all the solar system data, scaling constants, and configuration

// Scaling constants
const DISTANCE_SCALE = 200;  // AU to pixels (1 AU = 200 pixels)
const SIZE_SCALE = 4;       // Planet size scaling for visibility

// Zoom slider constants
const ZOOM_MIN = 10;   // Closest zoom
const ZOOM_MAX = 2000; // Farthest zoom

// Solar system data
const sunData = {
    size: 5
};

// Planet data relative to Earth (Earth = 1 unit) - Realistic proportions and distances in AU
const planetData = {
    mercury: { size: 0.38, distance: 0.39, speed: 0.008, color: 0x8C7853, inclination: 7.0 },
    venus: { size: 0.95, distance: 0.72, speed: 0.006, color: 0xFFC649, inclination: 3.4 },
    earth: { size: 1, distance: 1.0, speed: 0.005, color: 0x6B93D6, hasAtmosphere: true, inclination: 0.0 },
    mars: { size: 0.53, distance: 1.52, speed: 0.004, color: 0xCD5C5C, inclination: 1.9 },
    jupiter: { size: 11, distance: 5.2, speed: 0.002, color: 0xD8CA9D, inclination: 1.3 },
    saturn: { size: 9, distance: 9.5, speed: 0.0015, color: 0xFAD5A5, hasRings: true, inclination: 2.5 },
    uranus: { size: 4, distance: 19.2, speed: 0.001, color: 0x4FD0E7, inclination: 0.8 },
    neptune: { size: 3.9, distance: 30.1, speed: 0.0008, color: 0x4B70DD, inclination: 1.8 }
};

// Dwarf planet data with orbital inclinations and eccentricity - Realistic proportions and distances in AU
const dwarfPlanetData = {
    ceres: { size: 0.15, distance: 2.8, speed: 0.003, color: 0x8C7853, type: 'asteroid belt', inclination: 10.6, eccentricity: 0.076 },
    pluto: { size: 0.18, distance: 39.5, speed: 0.0006, color: 0xD4A574, type: 'kuiper belt', inclination: 17.2, eccentricity: 0.244 },
    eris: { size: 0.19, distance: 67.7, speed: 0.0005, color: 0xCCCCCC, type: 'scattered disk', inclination: 44.2, eccentricity: 0.436 },
    haumea: { size: 0.12, distance: 43.3, speed: 0.0006, color: 0xFFFFFF, type: 'kuiper belt', inclination: 28.2, eccentricity: 0.189 },
    makemake: { size: 0.11, distance: 45.8, speed: 0.0005, color: 0xD4A574, type: 'kuiper belt', inclination: 29.0, eccentricity: 0.159 }
};

// Moon data - Realistic proportions
const moonData = {
    earth: [{ name: 'moon', size: 0.27, distance: 15, speed: 0.02, color: 0x969696 }]
};

// Texture paths configuration
const texturePaths = {
    sun: 'textures/8k_sun.jpg',
    mercury: 'textures/8k_mercury.jpg',
    venus: 'textures/8k_venus_surface.jpg',
    earth: 'textures/8k_earth_daymap.jpg',
    earthNight: 'textures/8k_earth_nightmap.jpg',
    earthClouds: 'textures/8k_earth_clouds.jpg',
    mars: 'textures/8k_mars.jpg',
    jupiter: 'textures/8k_jupiter.jpg',
    saturn: 'textures/8k_saturn.jpg',
    ring: 'textures/8k_saturn_ring.png',
    uranus: 'textures/2k_uranus.jpg',
    neptune: 'textures/2k_neptune.jpg',
    moon: 'textures/8k_moon.jpg',
    // Dwarf planets
    ceres: 'textures/4k_ceres.jpg',
    pluto: 'textures/2k_pluto.jpg',
    eris: 'textures/4k_eris.jpg',
    haumea: 'textures/4k_haumea.jpg',
    makemake: 'textures/4k_makemake.jpg'
};
