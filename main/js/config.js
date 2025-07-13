// Configuration and Data Module
// Contains all the solar system data, scaling constants, and configuration

// Scaling constants
const DISTANCE_SCALE = 200;  // AU to pixels (1 AU = 200 pixels)
const SIZE_SCALE = 4;       // Planet size scaling for visibility

// Zoom slider constants
const ZOOM_MIN = 100;   // Closest zoom
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
    // Main dwarf planets officially recognized by IAU
    ceres: { size: 0.07, distance: 2.8, speed: 0.003, color: 0x8C7853, type: 'asteroid belt', inclination: 10.6, eccentricity: 0.076 },
    pluto: { size: 0.18, distance: 39.5, speed: 0.0006, color: 0xD4A574, type: 'kuiper belt', inclination: 17.2, eccentricity: 0.244 },
    eris: { size: 0.19, distance: 67.7, speed: 0.0005, color: 0xCCCCCC, type: 'scattered disk', inclination: 44.2, eccentricity: 0.436 },
    haumea: { size: 0.15, distance: 43.3, speed: 0.0006, color: 0xFFFFFF, type: 'kuiper belt', inclination: 28.2, eccentricity: 0.189 },
    makemake: { size: 0.11, distance: 45.8, speed: 0.0005, color: 0xD4A574, type: 'kuiper belt', inclination: 29.0, eccentricity: 0.159 },

    // Additional significant dwarf planets
    sedna: { size: 0.08, distance: 76.0, speed: 0.0003, color: 0x8B4513, type: 'sednoid', inclination: 11.9, eccentricity: 0.855 },
    quaoar: { size: 0.09, distance: 43.7, speed: 0.0006, color: 0x654321, type: 'kuiper belt', inclination: 8.0, eccentricity: 0.037 },
    orcus: { size: 0.07, distance: 39.4, speed: 0.0006, color: 0x444444, type: 'kuiper belt', inclination: 20.6, eccentricity: 0.226 },
    gonggong: { size: 0.10, distance: 67.3, speed: 0.0005, color: 0x8B0000, type: 'scattered disk', inclination: 30.8, eccentricity: 0.500 },
};

// Moon data - Realistic proportions and distances
const moonData = {
    earth: [{ name: 'moon', size: 0.27, distance: 10, speed: 0.02, color: 0x969696 }],
};

// Comet data with highly eccentric orbits and tail effects
const cometData = {
    halley: {
        name: "Halley",
        size: 0.02,
        perihelion: 0.59,
        aphelion: 35.1,
        eccentricity: 0.967,
        inclination: 162.3,
        speed: 0.0008,
        color: 0xCCCCFF,
        tailLength: 8,
        tailOpacity: 0.6,
        period: 76,
        nucleus: {
            rotation: 0.02,
            tumble: 0.005
        }
    },
    haleBopp: {
        name: "Hale-Bopp",
        size: 0.03,
        perihelion: 0.91,
        aphelion: 370,
        eccentricity: 0.995,
        inclination: 89.4,
        speed: 0.0003,
        color: 0xFFCCCC,
        tailLength: 12,
        tailOpacity: 0.7,
        period: 2533,
        nucleus: {
            rotation: 0.015,
            tumble: 0.003
        }
    },
    hyakutake: {
        name: "Hyakutake",
        size: 0.022,
        perihelion: 0.23,
        aphelion: 3410,
        eccentricity: 0.9998,
        inclination: 124.9,
        speed: 0.0002,
        color: 0xCCFFFF,
        tailLength: 15,
        tailOpacity: 0.8,
        period: 72000,
        nucleus: {
            rotation: 0.012,
            tumble: 0.002
        }
    },
    encke: {
        name: "Encke",
        size: 0.018,
        perihelion: 0.34,
        aphelion: 4.1,
        eccentricity: 0.850,
        inclination: 11.8,
        speed: 0.0012,
        color: 0xCCEEDD,
        tailLength: 5,
        tailOpacity: 0.5,
        period: 3.3,
        nucleus: {
            rotation: 0.018,
            tumble: 0.004
        }
    },
    neowise: {
        name: "NEOWISE",
        size: 0.020,
        perihelion: 0.29,
        aphelion: 715,
        eccentricity: 0.9992,
        inclination: 128.9,
        speed: 0.0002,
        color: 0xFFEECC,
        tailLength: 10,
        tailOpacity: 0.7,
        period: 6800,
        nucleus: {
            rotation: 0.014,
            tumble: 0.003
        }
    },

    bernstein: {
        name: "Bernardinelli–Bernstein",
        size: 0.15,
        perihelion: 10.9,
        aphelion: 40000,
        eccentricity: 0.999,
        inclination: 95,
        speed: 0.00005,
        color: 0xBBBBFF,
        tailLength: 6,
        tailOpacity: 0.4,
        period: 4000000,
        nucleus: { rotation: 0.006, tumble: 0.001 }
    }
};

// Oort Cloud configuration - spherical shell of comets
const oortCloudData = {
    innerRadius: 2000,         // ~2,000 AU - inner edge of Oort Cloud
    outerRadius: 100000,       // ~100,000 AU - outer edge of Oort Cloud
    particleCount: 2000000,    // Number of comet nuclei to show
    opacity: 0.25,             // Slightly more visible
    size: 1.0,                 // Size of points (adjust depending on renderer)
    colors: {
        icy: 0xCCDDFF,         // Fresh ice - blue-white
        dirty: 0x998877,       // Dirty ice - brownish
        carbonaceous: 0x665544,// Carbon-rich - dark brown
        methane: 0xFFEEDD      // Methane ice - yellowish
    }
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
    makemake: 'textures/4k_makemake.jpg',
    sedna: 'textures/sedna.jpg',
    quaoar: 'textures/quaoar.jpg',
    orcus: 'textures/orcus.jpg',
    gonggong: 'textures/gonggong.jpg'
};
