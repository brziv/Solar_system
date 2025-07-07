// Global variables
let scene, camera, renderer;
let sun, planets = {}, moons = {};
let orbits = [];
let timeSpeed = 1;
let currentFocus = null;
let solarSystemGroup;
let galaxyTime = 0;
let loadedTextures = {};
let loadingManager;
let planetInfoPanel;

// New variables for enhanced features
let asteroidBelt, kuiperBelt;
let dwarfPlanets = {};
let dwarfPlanetOrbits = [];
let currentScale = 0; // 0: Inner system, 1: Outer system, 2: Kuiper belt, 3: Oort cloud, 4: Galactic
let scaleTransitionTime = 0;
let galaxyGroup;
let scaleData = {
    0: { name: "Inner Solar System", cameraDistance: 150, showGalaxy: false, scale: 1 },
    1: { name: "Outer Solar System", cameraDistance: 300, showGalaxy: false, scale: 1 },
    2: { name: "Kuiper Belt", cameraDistance: 600, showGalaxy: false, scale: 1 },
    3: { name: "Oort Cloud", cameraDistance: 1200, showGalaxy: false, scale: 0.1 },
    4: { name: "Galactic View", cameraDistance: 5000, showGalaxy: true, scale: 0.001 }
};

// Camera movement variables
let keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    control: false
};
let cameraSpeed = 2;
// Real astronomical data for planet info
const realPlanetData = {
    sun: {
        type: "G-type main-sequence star",
        temperature: "5,778 K",
        rotation: "25.05 days (equator)"
    },
    mercury: {
        orbitPeriod: "88 days",
        rotationPeriod: "58.6 days",
        distance: "0.39 AU"
    },
    venus: {
        orbitPeriod: "225 days",
        rotationPeriod: "243 days",
        distance: "0.72 AU"
    },
    earth: {
        orbitPeriod: "365.25 days",
        rotationPeriod: "1 day",
        distance: "1 AU"
    },
    mars: {
        orbitPeriod: "687 days",
        rotationPeriod: "1.03 days",
        distance: "1.52 AU"
    },
    jupiter: {
        orbitPeriod: "11.86 years",
        rotationPeriod: "9.93 hours",
        distance: "5.2 AU"
    },
    saturn: {
        orbitPeriod: "29.46 years",
        rotationPeriod: "10.7 hours",
        distance: "9.58 AU"
    },
    uranus: {
        orbitPeriod: "84.01 years",
        rotationPeriod: "17.24 hours",
        distance: "19.22 AU"
    },
    neptune: {
        orbitPeriod: "164.8 years",
        rotationPeriod: "16.1 hours",
        distance: "30.1 AU"
    },
    ceres: {
        orbitPeriod: "4.6 years",
        rotationPeriod: "9.1 hours",
        distance: "2.77 AU",
        type: "Dwarf planet (asteroid belt)"
    },
    pluto: {
        orbitPeriod: "248 years",
        rotationPeriod: "6.4 days",
        distance: "39.5 AU",
        type: "Dwarf planet (Kuiper belt)"
    },
    eris: {
        orbitPeriod: "558 years",
        rotationPeriod: "25.9 hours",
        distance: "67.7 AU",
        type: "Dwarf planet (scattered disk)"
    },
    haumea: {
        orbitPeriod: "284 years",
        rotationPeriod: "3.9 hours",
        distance: "43.3 AU",
        type: "Dwarf planet (Kuiper belt)"
    },
    makemake: {
        orbitPeriod: "310 years",
        rotationPeriod: "22.5 hours",
        distance: "45.8 AU",
        type: "Dwarf planet (Kuiper belt)"
    }
};

// Add the planet info panel
function createPlanetInfoPanel() {
    planetInfoPanel = document.createElement('div');
    planetInfoPanel.id = 'planet-info';
    planetInfoPanel.style.position = 'absolute';
    planetInfoPanel.style.top = '10px';
    planetInfoPanel.style.right = '10px';
    planetInfoPanel.style.background = 'rgba(0, 0, 0, 0.8)';
    planetInfoPanel.style.color = 'white';
    planetInfoPanel.style.padding = '15px';
    planetInfoPanel.style.borderRadius = '8px';
    planetInfoPanel.style.zIndex = '100';
    planetInfoPanel.style.width = '250px';
    planetInfoPanel.style.display = 'none';
    document.getElementById('container').appendChild(planetInfoPanel);
}

// Update the planet info panel
function updatePlanetInfo(planetName) {
    if (!planetInfoPanel) return;

    let html = `<h3 style="margin-top: 0; color: #ffd700;">${planetName.charAt(0).toUpperCase() + planetName.slice(1)}</h3>`;

    if (planetName === 'sun') {
        const data = realPlanetData.sun;
        html += `<p>Type: ${data.type}</p>`;
        html += `<p>Temperature: ${data.temperature}</p>`;
        html += `<p>Rotation: ${data.rotation}</p>`;
    } else if (realPlanetData[planetName]) {
        const data = realPlanetData[planetName];
        html += `<p>Orbit Period: ${data.orbitPeriod}</p>`;
        html += `<p>Rotation Period: ${data.rotationPeriod}</p>`;
        html += `<p>Distance from Sun: ${data.distance}</p>`;
    }

    planetInfoPanel.innerHTML = html;
    planetInfoPanel.style.display = 'block';
}
// Texture loader with loading manager
loadingManager = new THREE.LoadingManager();
let textureLoader = new THREE.TextureLoader(loadingManager);


// Texture paths
const texturePaths = {
    sun: 'textures//8k_sun.jpg',
    mercury: 'textures//8k_mercury.jpg',
    venus: 'textures//8k_venus_surface.jpg',
    venusAtmosphere: 'textures//4k_venus_atmosphere.jpg',
    earth: 'textures//8k_earth_daymap.jpg',
    earthNight: 'textures//8k_earth_nightmap.jpg',
    earthClouds: 'textures//8k_earth_clouds.jpg',
    earthNormal: 'textures//8k_earth_normal_map.tif',
    earthSpecular: 'textures//8k_earth_specular_map.tif',
    moon: 'textures//8k_moon.jpg',
    ceres: 'textures//4k_ceres.jpg',
    mars: 'textures//8k_mars.jpg',
    jupiter: 'textures//8k_jupiter.jpg',
    saturn: 'textures//8k_saturn.jpg',
    saturnRings: 'textures//8k_saturn_ring_alpha.png',
    uranus: 'textures//2k_uranus.jpg',
    neptune: 'textures//2k_neptune.jpg',
    pluto: 'textures//2k_pluto.jpg',
    eris: 'textures//4k_eris.jpg',
    haumea: 'textures//4k_haumea.jpg',
    makemake: 'textures//4k_makemake.jpg',
    milkyWay: 'textures//milky_way.jpg',
};

// Fallback colors for when textures fail to load
const fallbackColors = {
    sun: 0xffff00,
    mercury: 0x8c7853,
    venus: 0xffa500,
    earth: 0x6b93d6,
    mars: 0xcd5c5c,
    jupiter: 0xd8ca9d,
    saturn: 0xfad5a5,
    uranus: 0x4fd0e4,
    neptune: 0x4b70dd,
    moon: 0x888888,
    ceres: 0x8c7853,
    pluto: 0xd4a574,
    eris: 0xcccccc,
    haumea: 0xffffff,
    makemake: 0xd4a574
};

// Real astronomical data (scaled for visualization)
const planetData = {
    mercury: { distance: 15, size: 0.4, speed: 4.15, rotationSpeed: 0.017, color: 0x8c7853, moons: [] },
    venus: { distance: 20, size: 0.9, speed: 1.62, rotationSpeed: -0.004, color: 0xffa500, moons: [] },
    earth: { distance: 25, size: 1, speed: 1.0, rotationSpeed: 1.0, color: 0x6b93d6, moons: ['moon'] },
    mars: { distance: 35, size: 0.5, speed: 0.53, rotationSpeed: 0.97, color: 0xcd5c5c, moons: [] },
    jupiter: { distance: 55, size: 5, speed: 0.084, rotationSpeed: 2.4, color: 0xd8ca9d, moons: ['io', 'europa', 'ganymede', 'callisto'] },
    saturn: { distance: 75, size: 4, speed: 0.034, rotationSpeed: 2.2, color: 0xfad5a5, moons: ['titan', 'enceladus'] },
    uranus: { distance: 95, size: 2, speed: 0.012, rotationSpeed: 1.4, color: 0x4fd0e4, moons: [] },
    neptune: { distance: 115, size: 2, speed: 0.006, rotationSpeed: 1.5, color: 0x4b70dd, moons: [] }
};

// Dwarf planet data with elliptical orbits
const dwarfPlanetData = {
    ceres: {
        semiMajorAxis: 45,  // Scaled between Mars and Jupiter
        eccentricity: 0.08,
        inclination: 0.19,
        longitudeOfAscendingNode: 0,
        argumentOfPeriapsis: 0,
        size: 0.3,
        speed: 0.22,
        rotationSpeed: 2.6,
        color: 0x8c7853
    },
    pluto: {
        semiMajorAxis: 200,
        eccentricity: 0.25,
        inclination: 0.3,  // 17 degrees in radians
        longitudeOfAscendingNode: 0.19,  // Additional orbital parameter
        argumentOfPeriapsis: 0.26,      // Makes orbit cross Neptune's
        size: 0.18,
        speed: 0.004,
        rotationSpeed: 0.16,
        color: 0xd4a574
    },
    eris: {
        semiMajorAxis: 350,
        eccentricity: 0.44,
        inclination: 0.79,
        longitudeOfAscendingNode: 0.61,
        argumentOfPeriapsis: 0.33,
        size: 0.19,
        speed: 0.0018,
        rotationSpeed: 0.93,
        color: 0xcccccc
    },
    haumea: {
        semiMajorAxis: 220,
        eccentricity: 0.19,
        inclination: 0.49,
        longitudeOfAscendingNode: 0.35,
        argumentOfPeriapsis: 0.18,
        size: 0.16,
        speed: 0.0035,
        rotationSpeed: 6.1,
        color: 0xffffff
    },
    makemake: {
        semiMajorAxis: 240,
        eccentricity: 0.16,
        inclination: 0.51,
        longitudeOfAscendingNode: 0.14,
        argumentOfPeriapsis: 0.28,
        size: 0.14,
        speed: 0.0032,
        rotationSpeed: 1.1,
        color: 0xd4a574
    }
};

const moonData = {
    moon: { distance: 2, size: 0.27, speed: 13.4, color: 0x888888 },
    io: { distance: 3, size: 0.3, speed: 10, color: 0xffff99 },
    europa: { distance: 4, size: 0.25, speed: 8, color: 0xaaaaff },
    ganymede: { distance: 5, size: 0.4, speed: 6, color: 0x999999 },
    callisto: { distance: 6, size: 0.35, speed: 4, color: 0x666666 },
    titan: { distance: 5, size: 0.4, speed: 7, color: 0xffa500 },
    enceladus: { distance: 3, size: 0.15, speed: 12, color: 0xffffff }
};

// Loading manager events
loadingManager.onLoad = function () {
    console.log('All textures loaded successfully');
    document.getElementById('loading').style.display = 'none';
    document.getElementById('controls').style.display = 'block';
    document.getElementById('info').style.display = 'block';
};

loadingManager.onProgress = function (url, loaded, total) {
    console.log(`Loading: ${loaded}/${total} - ${url}`);
    document.getElementById('loading').textContent = `Loading textures... ${loaded}/${total}`;
};

loadingManager.onError = function (url) {
    console.error('Failed to load:', url);
};

// Preload all textures
function preloadTextures() {
    Object.keys(texturePaths).forEach(key => {
        textureLoader.load(
            texturePaths[key],
            function (texture) {
                loadedTextures[key] = texture;
                console.log(`Loaded texture: ${key}`);
            },
            undefined,
            function (error) {
                console.error(`Failed to load texture ${key}:`, error);
                loadedTextures[key] = null;
            }
        );
    });
}

init();
animate();

// Update init function to create planet info panel
function init() {
    // Create scene
    scene = new THREE.Scene();

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(0, 50, 150);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('container').appendChild(renderer.domElement);

    // Create solar system group (for galaxy movement)
    solarSystemGroup = new THREE.Group();
    scene.add(solarSystemGroup);

    // Preload textures first, then create objects that depend on textures
    preloadTextures();

    // Add stars background
    createStarField();

    // Create planet info panel
    createPlanetInfoPanel();

    // Wait for all textures to load before creating sun, planets and orbits
    loadingManager.onLoad = function () {
        console.log('All textures loaded successfully');
        document.getElementById('loading').style.display = 'none';
        document.getElementById('controls').style.display = 'block';
        document.getElementById('info').style.display = 'block';

        createSun();
        createPlanets();
        createOrbits();
        createDwarfPlanets();
        createAsteroidBelt();
        createKuiperBelt();
        createGalacticStructures();

        // Initialize scale system
        updateObjectVisibility();
        
        // Set initial scale button state
        changeScale(0); // This will properly set the first button as active
    };

    // Add mouse controls
    addMouseControls();

    // Add keyboard controls
    addKeyboardControls();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function createStarField() {
    // Create sphere for background
    const starSphereGeometry = new THREE.SphereGeometry(1500, 64, 64);
    const starSphereMaterial = new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.8,
        color: 0x111111
    });
    const starSphere = new THREE.Mesh(starSphereGeometry, starSphereMaterial);
    scene.add(starSphere);

    // Add additional point stars for depth
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 10000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 1000;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.5,
        transparent: true,
        opacity: 0.6
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

function createSun() {
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);

    let sunMaterial;
    if (loadedTextures.sun) {
        sunMaterial = new THREE.MeshBasicMaterial({
            map: loadedTextures.sun,
            emissive: 0xffaa00,
            emissiveIntensity: 0.2
        });
    } else {
        sunMaterial = new THREE.MeshBasicMaterial({
            color: fallbackColors.sun,
            emissive: 0xffaa00,
            emissiveIntensity: 0.5
        });
    }

    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    solarSystemGroup.add(sun);

    // Add sun light
    const sunLight = new THREE.PointLight(0xffffff, 2, 1000);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    solarSystemGroup.add(sunLight);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.1);
    scene.add(ambientLight);
}

function createPlanets() {
    Object.keys(planetData).forEach(planetName => {
        const data = planetData[planetName];

        // Create planet group
        const planetGroup = new THREE.Group();

        // Create planet mesh with enhanced materials
        const geometry = new THREE.SphereGeometry(data.size, 64, 64);
        let material;

        // Special handling for Earth with multiple textures
        if (planetName === 'earth' && loadedTextures.earth) {
            material = new THREE.MeshPhongMaterial({
                map: loadedTextures.earth,
                bumpMap: loadedTextures.earthNormal,
                bumpScale: 0.1,
                specularMap: loadedTextures.earthSpecular,
                specular: 0x111111,
                shininess: 100
            });

            // Add Earth's atmosphere/clouds as a separate layer
            if (loadedTextures.earthClouds) {
                const cloudGeometry = new THREE.SphereGeometry(data.size * 1.01, 64, 64);
                const cloudMaterial = new THREE.MeshLambertMaterial({
                    map: loadedTextures.earthClouds,
                    transparent: true,
                    opacity: 0.4
                });
                const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
                planetGroup.add(clouds);
            }
        }
        // Special handling for Saturn with rings
        else if (planetName === 'saturn') {
            if (loadedTextures.saturn) {
                material = new THREE.MeshLambertMaterial({
                    map: loadedTextures.saturn
                });
            } else {
                material = new THREE.MeshLambertMaterial({ color: data.color });
            }

            // Add Saturn rings
            if (loadedTextures.saturnRings) {
                const ringGeometry = new THREE.RingGeometry(data.size * 1.2, data.size * 2, 64);
                const ringMaterial = new THREE.MeshLambertMaterial({
                    map: loadedTextures.saturnRings,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.8
                });
                const rings = new THREE.Mesh(ringGeometry, ringMaterial);
                rings.rotation.x = Math.PI / 2;
                planetGroup.add(rings);
            }
        }
        // Special handling for Venus with atmosphere
        else if (planetName === 'venus') {
            if (loadedTextures.venus) {
                material = new THREE.MeshLambertMaterial({
                    map: loadedTextures.venus
                });
            } else {
                material = new THREE.MeshLambertMaterial({ color: data.color });
            }

            // Add Venus atmosphere
            if (loadedTextures.venusAtmosphere) {
                const atmosphereGeometry = new THREE.SphereGeometry(data.size * 1.02, 32, 32);
                const atmosphereMaterial = new THREE.MeshLambertMaterial({
                    map: loadedTextures.venusAtmosphere,
                    transparent: true,
                    opacity: 0.6
                });
                const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
                planetGroup.add(atmosphere);
            }
        }
        // Standard planets
        else {
            if (loadedTextures[planetName]) {
                material = new THREE.MeshLambertMaterial({
                    map: loadedTextures[planetName]
                });
            } else {
                material = new THREE.MeshLambertMaterial({ color: data.color });
            }
        }

        const planet = new THREE.Mesh(geometry, material);
        planet.castShadow = true;
        planet.receiveShadow = true;

        planetGroup.add(planet);
        planetGroup.position.x = data.distance;

        // Create moons
        if (data.moons.length > 0) {
            data.moons.forEach(moonName => {
                const moonData_item = moonData[moonName];
                if (moonData_item) {
                    const moonGeometry = new THREE.SphereGeometry(moonData_item.size, 32, 32);

                    let moonMaterial;
                    if (loadedTextures[moonName]) {
                        moonMaterial = new THREE.MeshLambertMaterial({
                            map: loadedTextures[moonName]
                        });
                    } else {
                        moonMaterial = new THREE.MeshLambertMaterial({
                            color: moonData_item.color
                        });
                    }

                    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
                    moon.position.x = moonData_item.distance;
                    moon.castShadow = true;
                    moon.receiveShadow = true;

                    const moonGroup = new THREE.Group();
                    moonGroup.add(moon);
                    planetGroup.add(moonGroup);

                    moons[moonName] = { mesh: moon, group: moonGroup, data: moonData_item };
                }
            });
        }

        solarSystemGroup.add(planetGroup);
        planets[planetName] = { mesh: planet, group: planetGroup, data: data };
    });
}

// Create improved orbits with better visibility
function createOrbits() {
    Object.keys(planetData).forEach(planetName => {
        const data = planetData[planetName];
        const orbitGeometry = new THREE.RingGeometry(data.distance - 0.2, data.distance + 0.2, 128);
        const orbitMaterial = new THREE.MeshBasicMaterial({
            color: 0x888888,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5
        });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2;
        solarSystemGroup.add(orbit);
        orbits.push(orbit);
    });
}

// Update keyboard controls to add space and ctrl
function addKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key === ' ') {
            keys.space = true;
            e.preventDefault();
        } else if (key === 'control') {
            keys.control = true;
            e.preventDefault();
        } else if (keys.hasOwnProperty(key)) {
            keys[key] = true;
            e.preventDefault();
        }
    });

    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (key === ' ') {
            keys.space = false;
            e.preventDefault();
        } else if (key === 'control') {
            keys.control = false;
            e.preventDefault();
        } else if (keys.hasOwnProperty(key)) {
            keys[key] = false;
            e.preventDefault();
        }
    });
}

// Update camera movement with vertical controls
function updateCameraMovement() {
    if (currentFocus) return; // Don't move camera when focusing on a planet

    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);

    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(cameraDirection, camera.up).normalize();

    const cameraUp = new THREE.Vector3();
    cameraUp.crossVectors(cameraRight, cameraDirection).normalize();

    const moveVector = new THREE.Vector3();

    // Adjust camera speed based on current scale for better navigation
    const scaleInfo = scaleData[currentScale];
    const adjustedSpeed = cameraSpeed * (scaleInfo.cameraDistance / 150); // Scale speed with distance

    if (keys.w) {
        moveVector.add(cameraDirection.clone().multiplyScalar(adjustedSpeed));
    }
    if (keys.s) {
        moveVector.add(cameraDirection.clone().multiplyScalar(-adjustedSpeed));
    }
    if (keys.a) {
        moveVector.add(cameraRight.clone().multiplyScalar(-adjustedSpeed));
    }
    if (keys.d) {
        moveVector.add(cameraRight.clone().multiplyScalar(adjustedSpeed));
    }
    // Add up/down movement
    if (keys.space) {
        moveVector.add(new THREE.Vector3(0, adjustedSpeed, 0));
    }
    if (keys.control) {
        moveVector.add(new THREE.Vector3(0, -adjustedSpeed, 0));
    }

    camera.position.add(moveVector);
}

function addMouseControls() {
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    renderer.domElement.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    renderer.domElement.addEventListener('mousemove', (e) => {
        if (isDragging && !currentFocus) {
            const deltaMove = {
                x: e.clientX - previousMousePosition.x,
                y: e.clientY - previousMousePosition.y
            };

            const spherical = new THREE.Spherical();
            spherical.setFromVector3(camera.position);

            spherical.theta -= deltaMove.x * 0.01;
            spherical.phi += deltaMove.y * 0.01;
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

            camera.position.setFromSpherical(spherical);
            camera.lookAt(0, 0, 0);
        }
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    renderer.domElement.addEventListener('mouseup', () => {
        isDragging = false;
    });

    renderer.domElement.addEventListener('wheel', (e) => {
        if (!currentFocus) {
            const distance = camera.position.length();
            const newDistance = distance + e.deltaY * 0.1;
            const clampedDistance = Math.max(10, Math.min(500, newDistance));

            camera.position.normalize().multiplyScalar(clampedDistance);
        }
    });
}

// Update the animate function with improved planet following
function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001 * timeSpeed;
    galaxyTime += 0.001 * timeSpeed;

    // Update camera movement based on keyboard input
    updateCameraMovement();

    // Rotate sun
    if (sun) {
        sun.rotation.y += 0.01 * timeSpeed;
    }

    // Move solar system through galaxy
    solarSystemGroup.position.x = Math.sin(galaxyTime * 0.1) * 5;
    solarSystemGroup.position.z = Math.cos(galaxyTime * 0.1) * 5;
    solarSystemGroup.rotation.y += 0.001 * timeSpeed;

    // Animate planets
    Object.keys(planets).forEach(planetName => {
        const planet = planets[planetName];
        const data = planet.data;

        // Orbital motion
        const angle = time * data.speed * 0.1;
        planet.group.position.x = Math.cos(angle) * data.distance;
        planet.group.position.z = Math.sin(angle) * data.distance;

        // Planet rotation
        planet.mesh.rotation.y += data.rotationSpeed * 0.02 * timeSpeed;

        // Update Earth shader for day/night cycle if it exists
        if (planetName === 'earth' && planet.mesh.material.uniforms) {
            const sunDirection = new THREE.Vector3();
            sunDirection.subVectors(solarSystemGroup.position, planet.group.position).normalize();
            planet.mesh.material.uniforms.sunDirection.value = sunDirection;
        }

        // Animate moons
        data.moons.forEach(moonName => {
            if (moons[moonName]) {
                const moon = moons[moonName];
                const moonAngle = time * moon.data.speed * 0.2;
                moon.group.rotation.y = moonAngle;
            }
        });
    });

    // Animate particle systems and dwarf planets
    animateParticleSystems(time);

    if (currentFocus) {
        let targetPosition = new THREE.Vector3();

        if (currentFocus === 'sun') {
            targetPosition.copy(solarSystemGroup.position);

            // Fixed offset for sun
            const fixedOffset = new THREE.Vector3(0, 5, 15);
            camera.position.copy(targetPosition).add(fixedOffset);
            camera.lookAt(targetPosition);
        } else if (planets[currentFocus]) {
            const planet = planets[currentFocus];
            // Get the world position of the planet
            const planetWorldPos = planet.group.getWorldPosition(new THREE.Vector3());

            // Fixed offset for planet (no rotation around)
            const viewDistance = Math.max(planet.data.size * 8, 8);
            const offset = new THREE.Vector3(0, planet.data.size * 3, viewDistance);

            camera.position.copy(planetWorldPos).add(offset);
            camera.lookAt(planetWorldPos);
        } else if (dwarfPlanets[currentFocus]) {
            const dwarfPlanet = dwarfPlanets[currentFocus];
            // Get the world position of the dwarf planet
            const dwarfPlanetWorldPos = dwarfPlanet.group.getWorldPosition(new THREE.Vector3());

            // Fixed offset for dwarf planet
            const viewDistance = Math.max(dwarfPlanet.data.size * 12, 6);
            const offset = new THREE.Vector3(0, dwarfPlanet.data.size * 4, viewDistance);

            camera.position.copy(dwarfPlanetWorldPos).add(offset);
            camera.lookAt(dwarfPlanetWorldPos);
        }
    }
    // Render the scene        
    renderer.render(scene, camera);
}

function setTimeSpeed(speed) {
    timeSpeed = speed;

    // Update button states
    document.querySelectorAll('.speed-controls button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Update focusPlanet function with toggle functionality
function focusPlanet(planetName) {
    // If already focusing on this planet, toggle focus off
    if (currentFocus === planetName) {
        resetCamera();
        return;
    }

    currentFocus = planetName;
    document.getElementById('currentFocus').textContent = `Focus: ${planetName.charAt(0).toUpperCase() + planetName.slice(1)}`;

    // Update button states
    document.querySelectorAll('.planet-controls button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Show planet information
    updatePlanetInfo(planetName);
}


// Update resetCamera function to also hide planet info
function resetCamera() {
    currentFocus = null;

    // Reset camera based on current scale
    const scaleInfo = scaleData[currentScale];
    const distance = scaleInfo.cameraDistance;

    camera.position.set(0, distance * 0.3, distance);
    camera.lookAt(0, 0, 0);

    document.getElementById('currentFocus').textContent = 'Focus: Free Camera';

    // Remove active state from planet buttons
    document.querySelectorAll('.planet-controls button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Hide planet info panel
    if (planetInfoPanel) {
        planetInfoPanel.style.display = 'none';
    }
}

function toggleOrbits() {
    const show = document.getElementById('showOrbits').checked;
    orbits.forEach(orbit => {
        orbit.visible = show;
    });
    // Also toggle dwarf planet orbits
    dwarfPlanetOrbits.forEach(orbit => {
        orbit.visible = show;
    });
}

function toggleMoons() {
    const show = document.getElementById('showMoons').checked;
    Object.values(moons).forEach(moon => {
        moon.mesh.visible = show;
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Create asteroid belt as particle system
function createAsteroidBelt() {
    const asteroidCount = 1000;
    const asteroidGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(asteroidCount * 3);
    const colors = new Float32Array(asteroidCount * 3);
    const sizes = new Float32Array(asteroidCount);

    for (let i = 0; i < asteroidCount; i++) {
        // Create ring between Mars and Jupiter (distance 35-55)
        const angle = Math.random() * Math.PI * 2;
        const radius = 40 + Math.random() * 10; // Between Mars and Jupiter
        const height = (Math.random() - 0.5) * 2; // Small vertical spread

        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * radius;

        // Rocky grey to reddish-brown
        colors[i * 3] = 0.4 + Math.random() * 0.3;     // Red
        colors[i * 3 + 1] = 0.3 + Math.random() * 0.2; // Green
        colors[i * 3 + 2] = 0.2 + Math.random() * 0.2; // Blue


        // Size variation
        sizes[i] = 0.1 + Math.random();
    }

    asteroidGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    asteroidGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    asteroidGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const asteroidMaterial = new THREE.PointsMaterial({
        size: 0.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    asteroidBelt = new THREE.Points(asteroidGeometry, asteroidMaterial);
    solarSystemGroup.add(asteroidBelt);
}

// Create Kuiper belt as particle system
function createKuiperBelt() {
    const kuiperCount = 20000;
    const kuiperGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(kuiperCount * 3);
    const colors = new Float32Array(kuiperCount * 3);
    const sizes = new Float32Array(kuiperCount);

    for (let i = 0; i < kuiperCount; i++) {
        // Create belt beyond Neptune (distance 150-400)
        const angle = Math.random() * Math.PI * 2;
        const radius = 150 + Math.random() * 250; // Beyond Neptune
        const height = (Math.random() - 0.5) * 8; // Slightly larger vertical spread

        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * radius;

        // Darker/bluish colors
        colors[i * 3] = 0.3 + Math.random() * 0.3;     // Red
        colors[i * 3 + 1] = 0.4 + Math.random() * 0.3; // Green
        colors[i * 3 + 2] = 0.7 + Math.random() * 0.3; // Blue

        // Size variation
        sizes[i] = 0.3 + Math.random() * 1.2;
    }

    kuiperGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    kuiperGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    kuiperGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const kuiperMaterial = new THREE.PointsMaterial({
        size: 0.6,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
    });

    kuiperBelt = new THREE.Points(kuiperGeometry, kuiperMaterial);
    solarSystemGroup.add(kuiperBelt);
}

// Create Oort Cloud as spherical particle system
// Function to create dwarf planets with elliptical orbits
function createDwarfPlanets() {
    Object.keys(dwarfPlanetData).forEach(planetName => {
        const data = dwarfPlanetData[planetName];

        // Create dwarf planet group
        const dwarfPlanetGroup = new THREE.Group();

        // Create dwarf planet mesh
        const geometry = new THREE.SphereGeometry(data.size, 32, 32);
        let material;

        if (loadedTextures[planetName]) {
            material = new THREE.MeshLambertMaterial({
                map: loadedTextures[planetName]
            });
        } else {
            material = new THREE.MeshLambertMaterial({ color: data.color });
        }

        const dwarfPlanet = new THREE.Mesh(geometry, material);
        dwarfPlanet.castShadow = true;
        dwarfPlanet.receiveShadow = true;

        dwarfPlanetGroup.add(dwarfPlanet);

        // Set initial position
        dwarfPlanetGroup.position.x = data.semiMajorAxis;

        solarSystemGroup.add(dwarfPlanetGroup);
        dwarfPlanets[planetName] = {
            mesh: dwarfPlanet,
            group: dwarfPlanetGroup,
            data: data,
            angle: Math.random() * Math.PI * 2 // Random starting angle
        };

        // Create elliptical orbit visualization
        createEllipticalOrbit(
            data.semiMajorAxis,
            data.eccentricity,
            data.inclination,
            data.longitudeOfAscendingNode || 0,
            data.argumentOfPeriapsis || 0
        );
    });
}

// Function to create elliptical orbit visualization
function createEllipticalOrbit(semiMajorAxis, eccentricity, inclination, longitudeOfAscendingNode = 0, argumentOfPeriapsis = 0) {
    const points = [];
    const segments = 128;

    for (let i = 0; i <= segments; i++) {
        const trueAnomaly = (i / segments) * Math.PI * 2;
        const radius = semiMajorAxis * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(trueAnomaly));

        // Calculate position in orbital plane
        const orbitalX = radius * Math.cos(trueAnomaly);
        const orbitalY = radius * Math.sin(trueAnomaly);

        // Apply orbital transformations
        const cosLongitude = Math.cos(longitudeOfAscendingNode);
        const sinLongitude = Math.sin(longitudeOfAscendingNode);
        const cosArgument = Math.cos(argumentOfPeriapsis);
        const sinArgument = Math.sin(argumentOfPeriapsis);
        const cosInclination = Math.cos(inclination);
        const sinInclination = Math.sin(inclination);

        const x = orbitalX * (cosLongitude * cosArgument - sinLongitude * sinArgument * cosInclination) +
            orbitalY * (-cosLongitude * sinArgument - sinLongitude * cosArgument * cosInclination);
        const y = orbitalX * (sinLongitude * cosArgument + cosLongitude * sinArgument * cosInclination) +
            orbitalY * (-sinLongitude * sinArgument + cosLongitude * cosArgument * cosInclination);
        const z = orbitalX * (sinArgument * sinInclination) +
            orbitalY * (cosArgument * sinInclination);

        points.push(new THREE.Vector3(x, y, z));
    }

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x666666,
        transparent: true,
        opacity: 0.4
    });

    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    solarSystemGroup.add(orbitLine);
    dwarfPlanetOrbits.push(orbitLine);
}

// Function to calculate elliptical orbit position
function calculateEllipticalPosition(semiMajorAxis, eccentricity, inclination, meanAnomaly, longitudeOfAscendingNode = 0, argumentOfPeriapsis = 0) {
    // Solve Kepler's equation
    const eccentricAnomaly = solveKepler(meanAnomaly, eccentricity);
    const trueAnomaly = 2 * Math.atan(Math.sqrt((1 + eccentricity) / (1 - eccentricity)) * Math.tan(eccentricAnomaly / 2));

    const radius = semiMajorAxis * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(trueAnomaly));

    // Calculate position in orbital plane
    const orbitalX = radius * Math.cos(trueAnomaly);
    const orbitalY = radius * Math.sin(trueAnomaly);

    // Apply orbital transformations
    const cosLongitude = Math.cos(longitudeOfAscendingNode);
    const sinLongitude = Math.sin(longitudeOfAscendingNode);
    const cosArgument = Math.cos(argumentOfPeriapsis);
    const sinArgument = Math.sin(argumentOfPeriapsis);
    const cosInclination = Math.cos(inclination);
    const sinInclination = Math.sin(inclination);

    const x = orbitalX * (cosLongitude * cosArgument - sinLongitude * sinArgument * cosInclination) +
        orbitalY * (-cosLongitude * sinArgument - sinLongitude * cosArgument * cosInclination);
    const y = orbitalX * (sinLongitude * cosArgument + cosLongitude * sinArgument * cosInclination) +
        orbitalY * (-sinLongitude * sinArgument + cosLongitude * cosArgument * cosInclination);
    const z = orbitalX * (sinArgument * sinInclination) +
        orbitalY * (cosArgument * sinInclination);

    return new THREE.Vector3(x, y, z);
}

// Kepler's equation solver (improved with better convergence)
function solveKepler(meanAnomaly, eccentricity) {
    let eccentricAnomaly = meanAnomaly;
    
    // Handle edge cases
    if (eccentricity === 0) return meanAnomaly; // Circular orbit
    if (eccentricity >= 1) return meanAnomaly; // Invalid eccentricity for elliptical orbit

    // Newton-Raphson iteration with better convergence
    for (let i = 0; i < 10; i++) { // Increased iterations for better accuracy
        const f = eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly;
        const fp = 1 - eccentricity * Math.cos(eccentricAnomaly);
        
        if (Math.abs(fp) < 1e-12) break; // Avoid division by zero
        
        const delta = f / fp;
        eccentricAnomaly -= delta;
        
        if (Math.abs(delta) < 1e-12) break; // Convergence achieved
    }

    return eccentricAnomaly;
}

// Create galactic structures
function createGalacticStructures() {
    galaxyGroup = new THREE.Group();

    // Create Milky Way background plane (if texture is available)
    createMilkyWayBackground();

    scene.add(galaxyGroup);
    galaxyGroup.visible = false; // Initially hidden
}

// Create Milky Way background plane with texture
function createMilkyWayBackground() {
    const milkyWayGeometry = new THREE.PlaneGeometry(20000, 20000);
    
    let milkyWayMaterial;
    if (loadedTextures.milkyWay) {
        milkyWayMaterial = new THREE.MeshBasicMaterial({
            map: loadedTextures.milkyWay,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
    } else {
        // Fallback gradient material
        milkyWayMaterial = new THREE.MeshBasicMaterial({
            color: 0x221122,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
    }
    
    const milkyWayPlane = new THREE.Mesh(milkyWayGeometry, milkyWayMaterial);
    milkyWayPlane.rotation.x = Math.PI / 2; // Lie flat
    milkyWayPlane.position.y = -50; // Slightly below the main galaxy
    
    galaxyGroup.add(milkyWayPlane);

    // Add our solar system as a single point of light in the galaxy edge
    const solarSystemGeometry = new THREE.SphereGeometry(15, 16, 16);
    const solarSystemMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.9
    });

    const solarSystemPoint = new THREE.Mesh(solarSystemGeometry, solarSystemMaterial);
    solarSystemPoint.position.set(8000, 0, 2000); // Position at galaxy edge
    
    galaxyGroup.add(solarSystemPoint);
}

// Create our solar system as a single point of light for galactic view
// Multi-scale zoom system functions
function changeScale(newScale) {
    if (newScale < 0 || newScale > 4) return;

    currentScale = newScale;
    scaleTransitionTime = 0;

    // Update UI
    const scaleInfo = scaleData[currentScale];
    document.getElementById('currentScale').textContent = `Scale: ${scaleInfo.name}`;

    // Update scale button states - Fix: Use correct selector for Scale View buttons
    document.querySelectorAll('.control-group:nth-child(4) .planet-controls button').forEach((btn, index) => {
        btn.classList.toggle('active', index === currentScale);
    });

    // Smooth camera transition
    const targetDistance = scaleInfo.cameraDistance;
    const currentDistance = camera.position.length();

    // Animate camera zoom
    const animateZoom = () => {
        scaleTransitionTime += 0.02;
        const progress = Math.min(scaleTransitionTime, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic

        const newDistance = currentDistance + (targetDistance - currentDistance) * easedProgress;
        camera.position.normalize().multiplyScalar(newDistance);

        // Update object visibility based on scale
        updateObjectVisibility();

        // Show scale-specific info
        updateScaleInfo();

        if (progress < 1) {
            requestAnimationFrame(animateZoom);
        }
    };

    animateZoom();
}

// Update object visibility based on current scale
function updateObjectVisibility() {
    const scaleInfo = scaleData[currentScale];

    // For scales 0-3: Always show everything (solar system objects)
    // For scale 4: Show only galactic view
    const showSolarSystem = !scaleInfo.showGalaxy;

    // Solar system objects (show everything in scales 0-3)
    solarSystemGroup.visible = showSolarSystem;

    // All planets are always visible in scales 0-3
    Object.values(planets).forEach(planet => {
        planet.group.visible = showSolarSystem;
    });

    // Asteroid belt always visible in scales 0-3
    if (asteroidBelt) {
        asteroidBelt.visible = showSolarSystem;
    }

    // Kuiper belt always visible in scales 0-3
    if (kuiperBelt) {
        kuiperBelt.visible = showSolarSystem;
    }

    // Dwarf planets always visible in scales 0-3
    Object.values(dwarfPlanets).forEach(dwarf => {
        dwarf.group.visible = showSolarSystem;
    });

    // Galaxy structures - only show in galactic view (scale 4)
    if (galaxyGroup) {
        galaxyGroup.visible = scaleInfo.showGalaxy;
    }

    // Scale solar system for distant views
    if (solarSystemGroup) {
        solarSystemGroup.scale.setScalar(scaleInfo.scale);
    }
}

// Update scale-specific information
function updateScaleInfo() {
    const scaleInfo = scaleData[currentScale];
    let info = `Current Scale: ${scaleInfo.name}`;

    switch (currentScale) {
        case 0:
            info += '\nQuick navigation to Inner Solar System view';
            break;
        case 1:
            info += '\nQuick navigation to Outer Solar System view';
            break;
        case 2:
            info += '\nQuick navigation to Kuiper Belt region';
            break;
        case 3:
            info += '\nQuick navigation to Oort Cloud region (using background stars)';
            break;
        case 4:
            info += '\nShowing: Milky Way galaxy background image';
            break;
    }

    console.log(info);
}

// Add animation to particle systems
function animateParticleSystems(time) {
    // Animate asteroid belt rotation (particle systems can rotate)
    if (asteroidBelt) {
        asteroidBelt.rotation.y += 0.001 * timeSpeed;
    }

    // Animate Kuiper belt rotation (particle systems can rotate)
    if (kuiperBelt) {
        kuiperBelt.rotation.y += 0.0005 * timeSpeed;
    }

    // Animate galaxy rotation
    if (galaxyGroup) {
        galaxyGroup.rotation.y += 0.0001 * timeSpeed;
    }

    // Animate dwarf planets in elliptical orbits
    Object.keys(dwarfPlanets).forEach(planetName => {
        const dwarfPlanet = dwarfPlanets[planetName];
        const data = dwarfPlanet.data;

        // Update mean anomaly for orbital motion
        dwarfPlanet.angle += data.speed * 0.01 * timeSpeed;

        // Calculate new position along the FIXED elliptical orbit
        const position = calculateEllipticalPosition(
            data.semiMajorAxis,
            data.eccentricity,
            data.inclination,
            dwarfPlanet.angle,
            data.longitudeOfAscendingNode || 0,
            data.argumentOfPeriapsis || 0
        );

        // Move the dwarf planet to the new position
        dwarfPlanet.group.position.copy(position);

        // Rotate the dwarf planet on its axis (not the orbit!)
        dwarfPlanet.mesh.rotation.y += data.rotationSpeed * 0.02 * timeSpeed;
    });
}

// Add toggle functions for asteroid and Kuiper belts
function toggleAsteroidBelt() {
    if (asteroidBelt) {
        asteroidBelt.visible = document.getElementById('showAsteroidBelt').checked;
    }
}

function toggleKuiperBelt() {
    if (kuiperBelt) {
        kuiperBelt.visible = document.getElementById('showKuiperBelt').checked;
    }
}