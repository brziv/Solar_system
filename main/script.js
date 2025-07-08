// Global variables
let scene, camera, renderer;
let sun, planets = {}, moons = {}, dwarfPlanets = {};
let orbits = [], dwarfOrbits = [];
let asteroidBelt, kuiperBelt;
let timeSpeed = 1;
let movementSpeed = 10;
let currentFocus = null;
let solarSystemGroup;
let loadedTextures = {};
let loadingManager;
let isPaused = false;

// Preview sphere variables
let previewScene, previewCamera, previewRenderer;
let previewSphere = null;
let previewContainer = null;

// Meteor shower variables
let meteorShowers = [];
let activeMeteorShowers = [];
let meteors = [];
let meteorShowerInterval = null;
let autoMeteorShowers = true;
let meteorShowerActive = false;
let meteorShowerTimer = 0;
let meteorShowerDuration = 45000; // 45 seconds - more realistic duration
let meteorShowerCooldown = 180000; // 3 minutes between showers - more realistic timing

// Supernova variables
let supernovas = [];
let activeSupernovas = [];
let supernovaInterval = null;
let autoSupernovas = true;
let supernovaTimer = 0;
let supernovaCooldown = 600000; // 10 minutes between supernovas - much more realistic

// Auto effects control
let autoEffectsEnabled = true;

// Camera movement variables
let keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    ctrl: false,
    shift: false
};

// Mouse controls
let mouseDown = false;
let mouseX = 0;
let mouseY = 0;

// Scaling constants
const DISTANCE_SCALE = 200;  // AU to pixels (1 AU = 200 pixels)
const SIZE_SCALE = 4;       // Planet size scaling for visibility

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

// Thêm biến toàn cục để lưu khoảng cách mong muốn khi focus
let focusTargetDistance = null;

// Zoom slider constants - simplified approach
const ZOOM_MIN = 10;   // Closest zoom
const ZOOM_MAX = 2000; // Farthest zoom

// Initialize the solar system
function init() {
    // Create scene
    scene = new THREE.Scene();

    // Create camera with position that matches default zoom slider value (1000)
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500000);
    // Position camera at distance 1000 from origin (matching default slider value)
    camera.position.set(0, 500, 1000); // Simple position at distance 1000
    camera.lookAt(0, 0, 0);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000011);
    document.getElementById('container').appendChild(renderer.domElement);

    // Create solar system group
    solarSystemGroup = new THREE.Group();
    scene.add(solarSystemGroup);

    // Set up loading manager
    loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (url, loaded, total) => {
        const progress = (loaded / total) * 100;
        document.getElementById('loading').textContent = `Loading textures... ${Math.round(progress)}%`;
    };
    loadingManager.onLoad = () => {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('controls').style.display = 'block';
        document.getElementById('info').style.display = 'block';

        createSolarSystem();
        createPreviewSphere(); // Initialize preview sphere system
        animate();
    };

    // Load textures
    loadTextures();

    // Set up event listeners
    setupEventListeners();
    
    // Initialize zoom slider after DOM is ready
    setTimeout(() => {
        syncZoomSlider();
    }, 100);
}

// Load all textures
function loadTextures() {
    const textureLoader = new THREE.TextureLoader(loadingManager);
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

    for (let key in texturePaths) {
        textureLoader.load(texturePaths[key], (texture) => {
            loadedTextures[key] = texture;
        });
    }
}

// Create the solar system
function createSolarSystem() {
    // Create starfield background
    createStarfield();

    // Create sun
    createSun();

    // Create planets
    for (let planetName in planetData) {
        createPlanet(planetName, planetData[planetName]);
    }

    // Create dwarf planets
    for (let dwarfName in dwarfPlanetData) {
        createDwarfPlanet(dwarfName, dwarfPlanetData[dwarfName]);
    }

    // Create moons
    for (let planetName in moonData) {
        if (planets[planetName]) {
            moonData[planetName].forEach(moonInfo => {
                createMoon(planetName, moonInfo);
            });
        }
    }

    // Create orbits
    createOrbits();

    // Create asteroid belt
    createAsteroidBelt();

    // Create kuiper belt
    createKuiperBelt();
    
    // Create meteor showers and supernovas
    createMeteorShowers();
    createSupernovas();
}

// Create starfield background
function createStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 25000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 300000;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 300000;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 300000;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 1,
        sizeAttenuation: false
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

// Create the sun
function createSun() {
    const geometry = new THREE.SphereGeometry(sunData.size * 8, 32, 32); // Custom scaling for sun visibility
    let material;

    if (loadedTextures.sun) {
        material = new THREE.MeshBasicMaterial({
            map: loadedTextures.sun,
            emissive: 0x664400
        });
    } else {
        material = new THREE.MeshBasicMaterial({
            color: 0xFFAA00,
            emissive: 0x664400
        });
    }

    sun = new THREE.Mesh(geometry, material);
    solarSystemGroup.add(sun);

    // Add sun light that reaches all planets
    const sunLight = new THREE.PointLight(0xFFFFAA, 1.5, 200000); // Increased range to reach outer planets
    sunLight.position.copy(sun.position);
    scene.add(sunLight);

    // Add ambient light for better visibility
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
}

// Create a planet
function createPlanet(name, data) {
    const geometry = new THREE.SphereGeometry(data.size * SIZE_SCALE, 32, 32);
    let material;

    if (loadedTextures[name]) {
        material = new THREE.MeshLambertMaterial({ map: loadedTextures[name] });
    } else {
        material = new THREE.MeshLambertMaterial({ color: data.color });
    }

    const planet = new THREE.Mesh(geometry, material);

    // Apply orbital inclination if present
    const inclinationRad = (data.inclination || 0) * Math.PI / 180;
    const angle = Math.random() * Math.PI * 2;

    planet.position.x = Math.cos(angle) * data.distance * DISTANCE_SCALE;
    planet.position.z = Math.sin(angle) * data.distance * DISTANCE_SCALE;
    planet.position.y = Math.sin(inclinationRad) * data.distance * 10; // Scaled proportionally

    planet.userData = {
        name,
        originalDistance: data.distance * DISTANCE_SCALE,
        speed: data.speed,
        angle: angle,
        inclination: inclinationRad
    };

    planets[name] = planet;
    solarSystemGroup.add(planet);

    // Special handling for Earth (add clouds)
    if (name === 'earth' && loadedTextures.earthClouds) {
        const cloudGeometry = new THREE.SphereGeometry(data.size * (SIZE_SCALE - 0.5), 32, 32);
        const cloudMaterial = new THREE.MeshLambertMaterial({
            map: loadedTextures.earthClouds,
            transparent: true,
            opacity: 0.3
        });
        const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        planet.add(clouds);
        planet.userData.clouds = clouds;
    }

    // Special handling for Saturn (add rings)
    if (name === 'saturn') {
        const ringGeometry = new THREE.RingGeometry(data.size * (SIZE_SCALE * 2), data.size * (SIZE_SCALE - 6.5), 32);
        const ringMaterial = new THREE.MeshLambertMaterial({
            map: loadedTextures.ring,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;
        planet.add(rings);
    }
}

// Create a moon
function createMoon(planetName, moonInfo) {
    const geometry = new THREE.SphereGeometry(moonInfo.size * (SIZE_SCALE + 2), 16, 16); // Extra scaling for moon visibility
    let material;

    if (loadedTextures[moonInfo.name]) {
        material = new THREE.MeshLambertMaterial({ map: loadedTextures[moonInfo.name] });
    } else {
        material = new THREE.MeshLambertMaterial({ color: moonInfo.color });
    }

    const moon = new THREE.Mesh(geometry, material);
    moon.userData = {
        name: moonInfo.name,
        distance: moonInfo.distance,
        speed: moonInfo.speed,
        angle: Math.random() * Math.PI * 2,
        parent: planetName
    };

    if (!moons[planetName]) {
        moons[planetName] = [];
    }
    moons[planetName].push(moon);
    solarSystemGroup.add(moon);
}

// Create a dwarf planet
function createDwarfPlanet(name, data) {
    const geometry = new THREE.SphereGeometry(data.size * (SIZE_SCALE * 5), 16, 16); // Extra scaling for dwarf planet visibility
    let material;

    if (loadedTextures[name]) {
        material = new THREE.MeshLambertMaterial({ map: loadedTextures[name] });
    } else {
        material = new THREE.MeshLambertMaterial({ color: data.color });
    }

    const dwarfPlanet = new THREE.Mesh(geometry, material);

    // Apply orbital inclination
    const inclinationRad = (data.inclination || 0) * Math.PI / 180;
    const angle = Math.random() * Math.PI * 2;

    dwarfPlanet.position.x = Math.cos(angle) * data.distance * DISTANCE_SCALE;
    dwarfPlanet.position.z = Math.sin(angle) * data.distance * DISTANCE_SCALE;
    dwarfPlanet.position.y = Math.sin(inclinationRad) * data.distance * 50; // Increased from 15 to 50 for more visible inclination

    dwarfPlanet.userData = {
        name,
        originalDistance: data.distance * DISTANCE_SCALE,
        speed: data.speed,
        angle: angle,
        type: data.type,
        inclination: inclinationRad,
        eccentricity: data.eccentricity || 0
    };

    dwarfPlanets[name] = dwarfPlanet;
    solarSystemGroup.add(dwarfPlanet);
}

// Create orbital paths
function createOrbits() {
    // Planet orbits (with inclinations)
    for (let planetName in planetData) {
        const data = planetData[planetName];
        const points = [];
        const radius = data.distance * DISTANCE_SCALE;
        const inclinationRad = (data.inclination || 0) * Math.PI / 180;

        for (let i = 0; i <= 128; i++) {
            const angle = (i / 128) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = Math.sin(angle) * Math.sin(inclinationRad) * radius * 0.05; // Smaller height factor for planets

            points.push(new THREE.Vector3(x, y, z));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x888888,
            transparent: true,
            opacity: 0.6,
            linewidth: 5
        });

        const orbit = new THREE.Line(geometry, material);
        orbits.push(orbit);
        solarSystemGroup.add(orbit);
    }

    // Dwarf planet orbits (elliptical with high inclinations)
    for (let dwarfName in dwarfPlanetData) {
        const data = dwarfPlanetData[dwarfName];
        const points = [];
        const semiMajorAxis = data.distance * DISTANCE_SCALE;
        const eccentricity = data.eccentricity || 0;
        const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity);
        const inclinationRad = (data.inclination || 0) * Math.PI / 180;

        for (let i = 0; i <= 128; i++) {
            const angle = (i / 128) * Math.PI * 2;
            
            // Calculate elliptical orbit
            const r = (semiMajorAxis * (1 - eccentricity * eccentricity)) / 
                      (1 + eccentricity * Math.cos(angle));
            
            const x = r * Math.cos(angle);
            const z = r * Math.sin(angle);
            
            // Apply significant inclination
            const y = Math.sin(angle) * Math.sin(inclinationRad) * semiMajorAxis * 0.3; // Increased from 0.1 to 0.3

            points.push(new THREE.Vector3(x, y, z));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x888888,
            transparent: true,
            opacity: 0.6,
            linewidth: 5
        });

        const orbit = new THREE.Line(geometry, material);
        dwarfOrbits.push(orbit);
        solarSystemGroup.add(orbit);
    }
}

// Create asteroid belt
function createAsteroidBelt() {
    const asteroidCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(asteroidCount * 3);

    for (let i = 0; i < asteroidCount; i++) {
        const distance = 2.2 + Math.random() * 1.2; // Real asteroid belt range: 2.2-3.4 AU
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 20; // Increased height variation

        positions[i * 3] = Math.cos(angle) * distance * DISTANCE_SCALE;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * distance * DISTANCE_SCALE;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0x888888,
        size: 2.5,
        sizeAttenuation: false
    });

    asteroidBelt = new THREE.Points(geometry, material);
    solarSystemGroup.add(asteroidBelt);
}

// Create kuiper belt
function createKuiperBelt() {
    const kuiperCount = 50000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(kuiperCount * 3);

    for (let i = 0; i < kuiperCount; i++) {
        const distance = 30 + Math.random() * 20; // Real Kuiper belt range: 30-50 AU
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 30; // Increased height variation

        positions[i * 3] = Math.cos(angle) * distance * DISTANCE_SCALE;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * distance * DISTANCE_SCALE;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0x444466,
        size: 2.0,
        sizeAttenuation: false
    });

    kuiperBelt = new THREE.Points(geometry, material);
    solarSystemGroup.add(kuiperBelt);
}

// Create 3D preview sphere for info panel
function createPreviewSphere() {
    // Create preview scene
    previewScene = new THREE.Scene();
    
    // Create preview camera
    previewCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    previewCamera.position.set(0, 0, 3);
    
    // Create preview renderer
    previewRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    previewRenderer.setSize(150, 150);
    previewRenderer.setClearColor(0x000000, 0);
    
    // Create container for preview
    previewContainer = document.createElement('div');
    previewContainer.id = 'preview-container';
    previewContainer.style.cssText = `
        width: 150px;
        height: 150px;
        margin: 10px auto;
        border: 2px solid #444;
        border-radius: 75px;
        overflow: hidden;
        background: radial-gradient(circle, #111 0%, #000 100%);
    `;
    previewContainer.appendChild(previewRenderer.domElement);
    
    // Add lighting to preview scene
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    previewScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    previewScene.add(directionalLight);
}

// Update preview sphere with object data
function updatePreviewSphere(objectName, objectData) {
    if (!previewScene) createPreviewSphere();
    
    // Remove existing sphere
    if (previewSphere) {
        previewScene.remove(previewSphere);
        previewSphere = null;
    }
    
    // Create new sphere based on object type
    let geometry, material;
    let size = 1; // Standard size for preview
    
    if (objectName === 'sun') {
        geometry = new THREE.SphereGeometry(size, 32, 32);
        if (loadedTextures.sun) {
            material = new THREE.MeshBasicMaterial({
                map: loadedTextures.sun,
                emissive: 0x332200
            });
        } else {
            material = new THREE.MeshBasicMaterial({
                color: 0xFFAA00,
                emissive: 0x332200
            });
        }
    } else if (planets[objectName]) {
        geometry = new THREE.SphereGeometry(size, 32, 32);
        if (loadedTextures[objectName]) {
            material = new THREE.MeshLambertMaterial({ map: loadedTextures[objectName] });
        } else {
            material = new THREE.MeshLambertMaterial({ color: objectData.color });
        }
        
        // Special handling for Saturn rings in preview
        if (objectName === 'saturn') {
            const ringGeometry = new THREE.RingGeometry(size * 1.2, size * 1.8, 32);
            const ringMaterial = new THREE.MeshLambertMaterial({
                map: loadedTextures.ring,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide
            });
            const rings = new THREE.Mesh(ringGeometry, ringMaterial);
            rings.rotation.x = Math.PI / 2;
            previewSphere = new THREE.Group();
            const planet = new THREE.Mesh(geometry, material);
            previewSphere.add(planet);
            previewSphere.add(rings);
        }
    } else if (dwarfPlanets[objectName]) {
        geometry = new THREE.SphereGeometry(size, 24, 24);
        if (loadedTextures[objectName]) {
            material = new THREE.MeshLambertMaterial({ map: loadedTextures[objectName] });
        } else {
            material = new THREE.MeshLambertMaterial({ color: objectData.color });
        }
    }
    
    // Create sphere if not already created (for Saturn)
    if (!previewSphere) {
        previewSphere = new THREE.Mesh(geometry, material);
    }
    
    previewScene.add(previewSphere);
}

// Animate preview sphere
function animatePreviewSphere() {
    if (previewSphere && previewRenderer) {
        // Rotate sphere slowly
        if (previewSphere.rotation !== undefined) {
            previewSphere.rotation.y += 0.01;
        }
        
        // Render preview
        previewRenderer.render(previewScene, previewCamera);
    }
}

// Create meteor shower system
function createMeteorShowers() {
    // Create meteor particles with more realistic count
    const meteorCount = 800; // Increased for better performance with trails
    const meteorGeometry = new THREE.BufferGeometry();
    const meteorPositions = new Float32Array(meteorCount * 3);
    const meteorVelocities = new Float32Array(meteorCount * 3);
    const meteorColors = new Float32Array(meteorCount * 3);
    const meteorSizes = new Float32Array(meteorCount);
    
    // Initialize meteors off-screen
    for (let i = 0; i < meteorCount; i++) {
        const index = i * 3;
        // Start meteors far away
        meteorPositions[index] = -50000;
        meteorPositions[index + 1] = -50000;
        meteorPositions[index + 2] = -50000;
        
        // More realistic meteor velocities (11-72 km/s in space)
        const baseSpeed = 50 + Math.random() * 200; // Scaled for our system
        meteorVelocities[index] = (Math.random() - 0.5) * baseSpeed;
        meteorVelocities[index + 1] = (Math.random() - 0.5) * baseSpeed;
        meteorVelocities[index + 2] = (Math.random() - 0.5) * baseSpeed;
        
        // Realistic meteor colors based on composition
        const meteorType = Math.random();
        if (meteorType < 0.85) {
            // Most meteors are stony (white/yellow)
            meteorColors[index] = 0.9 + Math.random() * 0.1;     // r
            meteorColors[index + 1] = 0.8 + Math.random() * 0.2; // g
            meteorColors[index + 2] = 0.6 + Math.random() * 0.3; // b
        } else if (meteorType < 0.95) {
            // Iron meteors (orange/red)
            meteorColors[index] = 1;                             // r
            meteorColors[index + 1] = 0.3 + Math.random() * 0.4; // g
            meteorColors[index + 2] = 0.1 + Math.random() * 0.2; // b
        } else {
            // Rare carbonaceous meteors (green/blue)
            meteorColors[index] = 0.2 + Math.random() * 0.3;     // r
            meteorColors[index + 1] = 0.7 + Math.random() * 0.3; // g
            meteorColors[index + 2] = 0.8 + Math.random() * 0.2; // b
        }
        
        // Variable sizes based on meteor brightness
        meteorSizes[i] = 2 + Math.random() * 8; // Size 2-10
    }
    
    meteorGeometry.setAttribute('position', new THREE.BufferAttribute(meteorPositions, 3));
    meteorGeometry.setAttribute('color', new THREE.BufferAttribute(meteorColors, 3));
    meteorGeometry.setAttribute('size', new THREE.BufferAttribute(meteorSizes, 1));
    
    const meteorMaterial = new THREE.PointsMaterial({
        size: 80,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    
    const meteorSystem = new THREE.Points(meteorGeometry, meteorMaterial);
    meteorSystem.visible = false;
    scene.add(meteorSystem);
    
    meteors.push({
        system: meteorSystem,
        positions: meteorPositions,
        velocities: meteorVelocities,
        sizes: meteorSizes,
        geometry: meteorGeometry,
        active: false,
        timer: 0
    });
}

// Start a meteor shower
function startMeteorShower() {
    if (meteorShowerActive || meteors.length === 0) return;
    
    meteorShowerActive = true;
    meteorShowerTimer = 0;
    
    const meteor = meteors[0];
    meteor.active = true;
    meteor.system.visible = true;
    
    // Realistic meteor shower - meteors come from a radiant point
    const cameraPos = camera.position;
    const meteorCount = meteor.positions.length / 3;
    
    // Create a radiant point (where meteors appear to come from)
    const radiantDistance = 100000;
    const radiantTheta = Math.random() * Math.PI * 2;
    const radiantPhi = Math.random() * Math.PI * 0.5 + Math.PI * 0.25; // Keep in visible range
    
    const radiantPoint = new THREE.Vector3(
        cameraPos.x + radiantDistance * Math.sin(radiantPhi) * Math.cos(radiantTheta),
        cameraPos.y + radiantDistance * Math.cos(radiantPhi),
        cameraPos.z + radiantDistance * Math.sin(radiantPhi) * Math.sin(radiantTheta)
    );
    
    for (let i = 0; i < meteorCount; i++) {
        const index = i * 3;
        
        // Meteors start near the radiant point with some spread
        const spread = 5000;
        meteor.positions[index] = radiantPoint.x + (Math.random() - 0.5) * spread;
        meteor.positions[index + 1] = radiantPoint.y + (Math.random() - 0.5) * spread;
        meteor.positions[index + 2] = radiantPoint.z + (Math.random() - 0.5) * spread;
        
        // Meteors move away from radiant point with realistic physics
        const directionToCamera = new THREE.Vector3(
            cameraPos.x - meteor.positions[index],
            cameraPos.y - meteor.positions[index + 1],
            cameraPos.z - meteor.positions[index + 2]
        ).normalize();
        
        // Add some randomness but maintain general direction
        const baseSpeed = 150 + Math.random() * 10000;
        const randomFactor = 0.3;
        
        meteor.velocities[index] = directionToCamera.x * baseSpeed + (Math.random() - 0.5) * baseSpeed * randomFactor;
        meteor.velocities[index + 1] = directionToCamera.y * baseSpeed + (Math.random() - 0.5) * baseSpeed * randomFactor;
        meteor.velocities[index + 2] = directionToCamera.z * baseSpeed + (Math.random() - 0.5) * baseSpeed * randomFactor;
    }
    
    meteor.geometry.attributes.position.needsUpdate = true;
    
    console.log("🌠 Realistic meteor shower started from radiant point!");
}

// Update meteor shower
function updateMeteorShower(deltaTime) {
    meteorShowerTimer += deltaTime;
    
    if (meteorShowerActive) {
        const meteor = meteors[0];
        const meteorCount = meteor.positions.length / 3;
        
        // Update meteor positions
        for (let i = 0; i < meteorCount; i++) {
            const index = i * 3;
            
            meteor.positions[index] += meteor.velocities[index] * deltaTime * 0.001;
            meteor.positions[index + 1] += meteor.velocities[index + 1] * deltaTime * 0.001;
            meteor.positions[index + 2] += meteor.velocities[index + 2] * deltaTime * 0.001;
            
            // Reset meteors that have gone too far
            const distance = Math.sqrt(
                meteor.positions[index] * meteor.positions[index] +
                meteor.positions[index + 1] * meteor.positions[index + 1] +
                meteor.positions[index + 2] * meteor.positions[index + 2]
            );
            
            if (distance > 100000) {
                // Reset to starting position
                const cameraPos = camera.position;
                const radius = 20000 + Math.random() * 10000;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                
                meteor.positions[index] = cameraPos.x + radius * Math.sin(phi) * Math.cos(theta);
                meteor.positions[index + 1] = cameraPos.y + radius * Math.cos(phi);
                meteor.positions[index + 2] = cameraPos.z + radius * Math.sin(phi) * Math.sin(theta);
            }
        }
        
        meteor.geometry.attributes.position.needsUpdate = true;
        
        // End meteor shower after duration
        if (meteorShowerTimer > meteorShowerDuration) {
            meteorShowerActive = false;
            meteor.active = false;
            meteor.system.visible = false;
            meteorShowerTimer = 0;
            console.log("Meteor shower ended");
        }
    } else {
        // Check if it's time for a new meteor shower
        if (meteorShowerTimer > meteorShowerCooldown) {
            startMeteorShower();
        }
    }
}

// Create supernova effects
function createSupernovas() {
    // Supernovas will be created dynamically when needed
}

// Create a supernova explosion
function createSupernova() {
    // Supernovas occur much farther away - thousands of light years
    const distance = 200000 + Math.random() * 500000; // Much farther
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    const position = new THREE.Vector3(
        distance * Math.sin(phi) * Math.cos(theta),
        distance * Math.cos(phi),
        distance * Math.sin(phi) * Math.sin(theta)
    );
    
    // Determine supernova type for realistic colors and behavior
    const supernovaType = Math.random();
    let coreColor, emissiveColor, ringColor, maxScale, duration;
    
    if (supernovaType < 0.7) {
        // Type Ia - Thermonuclear explosion (white/blue)
        coreColor = 0xffffff;
        emissiveColor = 0xaaccff;
        ringColor = 0x6699ff;
        maxScale = 150;
        duration = 45000; // 45 seconds
    } else if (supernovaType < 0.9) {
        // Type II - Core collapse (red/orange)
        coreColor = 0xffaaaa;
        emissiveColor = 0xff6600;
        ringColor = 0xff3300;
        maxScale = 200;
        duration = 60000; // 60 seconds - longer for core collapse
    } else {
        // Hypernova - Very energetic (blue/white/purple)
        coreColor = 0xccccff;
        emissiveColor = 0x9966ff;
        ringColor = 0x6633ff;
        maxScale = 300;
        duration = 75000; // 75 seconds - longest
    }
    
    // Create expanding sphere for supernova core
    const supernovaGeometry = new THREE.SphereGeometry(800, 16, 16); // Larger initial size
    const supernovaMaterial = new THREE.MeshBasicMaterial({
        color: coreColor,
        transparent: true,
        opacity: 1.0,
        emissive: emissiveColor,
        emissiveIntensity: 2
    });
    
    const supernovaSphere = new THREE.Mesh(supernovaGeometry, supernovaMaterial);
    supernovaSphere.position.copy(position);
    scene.add(supernovaSphere);
    
    // Create multiple expanding shockwave rings for realism
    const rings = [];
    for (let i = 0; i < 3; i++) {
        const ringInnerRadius = 1500 + i * 800;
        const ringOuterRadius = ringInnerRadius + 600;
        const ringGeometry = new THREE.RingGeometry(ringInnerRadius, ringOuterRadius, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: ringColor,
            transparent: true,
            opacity: 0.4 - i * 0.1,
            emissive: ringColor,
            emissiveIntensity: 0.5,
            side: THREE.DoubleSide
        });
        
        const shockwaveRing = new THREE.Mesh(ringGeometry, ringMaterial);
        shockwaveRing.position.copy(position);
        shockwaveRing.lookAt(camera.position);
        scene.add(shockwaveRing);
        rings.push({ ring: shockwaveRing, material: ringMaterial, delay: i * 0.2 });
    }
    
    // Create realistic particle explosion
    const particleCount = 1200; // More particles for realism
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
        const index = i * 3;
        
        // Start all particles at supernova center
        particlePositions[index] = position.x;
        particlePositions[index + 1] = position.y;
        particlePositions[index + 2] = position.z;
        
        // Realistic explosion velocities - some particles faster than others
        let velocity;
        if (i < particleCount * 0.1) {
            // 10% are high-energy particles (cosmic rays)
            velocity = 2000 + Math.random() * 3000;
        } else if (i < particleCount * 0.3) {
            // 20% are medium-energy ejecta
            velocity = 1000 + Math.random() * 1500;
        } else {
            // 70% are slower material
            velocity = 300 + Math.random() * 800;
        }
        
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        particleVelocities[index] = velocity * Math.sin(phi) * Math.cos(theta);
        particleVelocities[index + 1] = velocity * Math.cos(phi);
        particleVelocities[index + 2] = velocity * Math.sin(phi) * Math.sin(theta);
        
        // Realistic supernova colors based on elements produced
        const elementType = Math.random();
        if (elementType < 0.4) {
            // Hydrogen/Helium (blue/white)
            particleColors[index] = 0.8 + Math.random() * 0.2;     // r
            particleColors[index + 1] = 0.9 + Math.random() * 0.1; // g
            particleColors[index + 2] = 1;                         // b
        } else if (elementType < 0.7) {
            // Heavy elements (red/orange)
            particleColors[index] = 1;                             // r
            particleColors[index + 1] = 0.3 + Math.random() * 0.5; // g
            particleColors[index + 2] = 0.1 + Math.random() * 0.3; // b
        } else if (elementType < 0.9) {
            // Iron/Nickel (yellow/orange)
            particleColors[index] = 1;                             // r
            particleColors[index + 1] = 0.7 + Math.random() * 0.3; // g
            particleColors[index + 2] = 0.2 + Math.random() * 0.3; // b
        } else {
            // Exotic matter (purple/violet)
            particleColors[index] = 0.7 + Math.random() * 0.3;     // r
            particleColors[index + 1] = 0.3 + Math.random() * 0.4; // g
            particleColors[index + 2] = 1;                         // b
        }
        
        // Variable particle sizes
        particleSizes[i] = 3 + Math.random() * 12;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 60,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    
    // Add to supernova list for tracking
    const supernova = {
        sphere: supernovaSphere,
        rings: rings,
        particles: particleSystem,
        particlePositions,
        particleVelocities,
        particleSizes,
        geometry: particleGeometry,
        material: supernovaMaterial,
        particleMaterial,
        timer: 0,
        maxScale: maxScale,
        duration: duration,
        type: supernovaType < 0.7 ? 'Type Ia' : (supernovaType < 0.9 ? 'Type II' : 'Hypernova')
    };
    
    supernovas.push(supernova);
    
    console.log(`💥 ${supernova.type} supernova created at distance ${Math.round(distance/1000)}k units!`);
}

// Update supernovas
function updateSupernovas(deltaTime) {
    supernovaTimer += deltaTime;
    
    // Update existing supernovas
    for (let i = supernovas.length - 1; i >= 0; i--) {
        const supernova = supernovas[i];
        supernova.timer += deltaTime;
        
        const progress = supernova.timer / supernova.duration;
        
        if (progress < 1) {
            // Expand the supernova sphere
            const scale = progress * supernova.maxScale;
            supernova.sphere.scale.setScalar(scale);
            
            // Fade out over time
            const opacity = Math.max(0, 1 - progress);
            supernova.material.opacity = opacity;
            supernova.material.emissiveIntensity = opacity * 3;
            supernova.particleMaterial.opacity = opacity;
            
            // Update particle positions
            const particleCount = supernova.particlePositions.length / 3;
            for (let j = 0; j < particleCount; j++) {
                const index = j * 3;
                
                supernova.particlePositions[index] += supernova.particleVelocities[index] * deltaTime * 0.001;
                supernova.particlePositions[index + 1] += supernova.particleVelocities[index + 1] * deltaTime * 0.001;
                supernova.particlePositions[index + 2] += supernova.particleVelocities[index + 2] * deltaTime * 0.001;
            }
            
            supernova.geometry.attributes.position.needsUpdate = true;
        } else {
            // Remove expired supernova
            scene.remove(supernova.sphere);
            scene.remove(supernova.particles);
            supernova.sphere.geometry.dispose();
            supernova.sphere.material.dispose();
            supernova.particles.geometry.dispose();
            supernova.particles.material.dispose();
            supernovas.splice(i, 1);
            console.log("Supernova removed");
        }
    }
    
    // Create new supernova if cooldown is over
    if (supernovaTimer > supernovaCooldown) {
        createSupernova();
        supernovaTimer = 0;
    }
}

// Set up event listeners
function setupEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Mouse events
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onMouseWheel);

    // Window resize
    window.addEventListener('resize', onWindowResize);
}

// Keyboard event handlers
function onKeyDown(event) {
    switch (event.code) {
        case 'KeyW': keys.w = true; break;
        case 'KeyA': keys.a = true; break;
        case 'KeyS': keys.s = true; break;
        case 'KeyD': keys.d = true; break;
        case 'Space': keys.space = true; event.preventDefault(); break;
        case 'ControlLeft': keys.ctrl = true; break;
        case 'ShiftLeft': keys.shift = true; break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'KeyW': keys.w = false; break;
        case 'KeyA': keys.a = false; break;
        case 'KeyS': keys.s = false; break;
        case 'KeyD': keys.d = false; break;
        case 'Space': keys.space = false; break;
        case 'ControlLeft': keys.ctrl = false; break;
        case 'ShiftLeft': keys.shift = false; break;
    }
}

// Mouse event handlers
function onMouseDown(event) {
    mouseDown = true;
    mouseX = event.clientX;
    mouseY = event.clientY;
}

function onMouseMove(event) {
    if (!mouseDown) return;

    const deltaX = event.clientX - mouseX;
    const deltaY = event.clientY - mouseY;

    // Rotate camera around target
    const spherical = new THREE.Spherical();
    spherical.setFromVector3(camera.position);

    spherical.theta -= deltaX * 0.01;
    spherical.phi += deltaY * 0.01;
    spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

    camera.position.setFromSpherical(spherical);
    camera.lookAt(0, 0, 0);

    mouseX = event.clientX;
    mouseY = event.clientY;
}

function onMouseUp() {
    mouseDown = false;
}

function onMouseWheel(event) {
    if (currentFocus) {
        let target;
        if (currentFocus === 'sun') {
            target = sun;
        } else if (planets[currentFocus]) {
            target = planets[currentFocus];
        } else if (dwarfPlanets[currentFocus]) {
            target = dwarfPlanets[currentFocus];
        }
        if (target) {
            const currentDistance = camera.position.distanceTo(target.position);
            const factor = event.deltaY > 0 ? 3 : 0.25;
            
            // Set reasonable minimum distances based on object type
            let minDistance;
            if (target === sun) {
                minDistance = 100; // Sun minimum distance
            } else if (currentFocus === 'jupiter' || currentFocus === 'saturn') {
                minDistance = 80; // Large planets
            } else if (currentFocus === 'uranus' || currentFocus === 'neptune') {
                minDistance = 25; // Medium planets
            } else {
                minDistance = 15; // Small planets and dwarf planets
            }
            
            const maxDistance = ZOOM_MAX;
            let newDistance = Math.max(minDistance, Math.min(maxDistance, currentDistance * factor));
            focusTargetDistance = newDistance;
            syncZoomSlider();
        }
    } else {
        const distance = camera.position.length();
        const factor = event.deltaY > 0 ? 3 : 0.25;
        const newDistance = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, distance * factor));
        camera.position.normalize().multiplyScalar(newDistance);
        syncZoomSlider();
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle camera movement
function handleCameraMovement() {
    // Apply speed boost if shift is held
    const baseSpeed = movementSpeed;
    const speed = keys.shift ? baseSpeed * 2 : baseSpeed;

    const direction = new THREE.Vector3();

    if (currentFocus) {
        // When focusing, move relative to the focused object
        let target;
        if (currentFocus === 'sun') {
            target = sun;
        } else if (planets[currentFocus]) {
            target = planets[currentFocus];
        } else if (dwarfPlanets[currentFocus]) {
            target = dwarfPlanets[currentFocus];
        }

        if (target) {
            // Calculate movement direction based on camera orientation
            camera.getWorldDirection(direction);
            const right = new THREE.Vector3().crossVectors(direction, camera.up).normalize();
            const up = camera.up.clone();

            // Store the current offset from target
            const currentOffset = camera.position.clone().sub(target.position);

            // Apply movement to the offset
            if (keys.w) currentOffset.add(direction.multiplyScalar(speed));
            if (keys.s) currentOffset.add(direction.multiplyScalar(-speed));
            if (keys.a) currentOffset.add(right.multiplyScalar(-speed));
            if (keys.d) currentOffset.add(right.multiplyScalar(speed));
            if (keys.space) currentOffset.add(up.multiplyScalar(speed));
            if (keys.ctrl) currentOffset.add(up.multiplyScalar(-speed));

            // Update camera position to maintain the new offset
            camera.position.copy(target.position).add(currentOffset);
            camera.lookAt(target.position);
        }
    } else {
        // Free camera movement (existing code)
        camera.getWorldDirection(direction);
        const right = new THREE.Vector3().crossVectors(direction, camera.up).normalize();
        const up = camera.up.clone();

        if (keys.w) camera.position.add(direction.multiplyScalar(speed));
        if (keys.s) camera.position.add(direction.multiplyScalar(-speed));
        if (keys.a) camera.position.add(right.multiplyScalar(-speed));
        if (keys.d) camera.position.add(right.multiplyScalar(speed));
        if (keys.space) camera.position.add(up.multiplyScalar(speed));
        if (keys.ctrl) camera.position.add(up.multiplyScalar(-speed));
    }
}

// Update planetary positions
function updatePlanets() {
    if (isPaused) return; // Don't update if paused

    // Update planets
    for (let planetName in planets) {
        const planet = planets[planetName];
        const userData = planet.userData;

        // Update orbital position with inclination
        userData.angle += userData.speed * timeSpeed;
        planet.position.x = Math.cos(userData.angle) * userData.originalDistance;
        planet.position.z = Math.sin(userData.angle) * userData.originalDistance;

        // Apply orbital inclination for planets
        if (userData.inclination) {
            planet.position.y = Math.sin(userData.angle) * Math.sin(userData.inclination) * userData.originalDistance * 0.05;
        }

        // Rotate planet (slower rotation)
        planet.rotation.y += 0.005 * timeSpeed;

        // Special handling for Earth clouds
        if (userData.clouds) {
            userData.clouds.rotation.y += 0.003 * timeSpeed;
        }
    }

    // Update dwarf planets (with elliptical orbits)
    for (let dwarfName in dwarfPlanets) {
        const dwarf = dwarfPlanets[dwarfName];
        const userData = dwarf.userData;
        const data = dwarfPlanetData[dwarfName];

        // Update orbital position
        userData.angle += userData.speed * timeSpeed;
        
        // Calculate elliptical orbit
        const eccentricity = userData.eccentricity || 0;
        const semiMajorAxis = userData.originalDistance;
        const r = (semiMajorAxis * (1 - eccentricity * eccentricity)) / 
                  (1 + eccentricity * Math.cos(userData.angle));

        dwarf.position.x = r * Math.cos(userData.angle);
        dwarf.position.z = r * Math.sin(userData.angle);

        // Apply significant orbital inclination
        if (userData.inclination) {
            dwarf.position.y = Math.sin(userData.angle) * Math.sin(userData.inclination) * semiMajorAxis * 0.3;
        }

        // Rotate dwarf planet (slower rotation)
        dwarf.rotation.y += 0.005 * timeSpeed;
    }

    // Update moons
    for (let planetName in moons) {
        if (planets[planetName]) {
            const planetPos = planets[planetName].position;
            moons[planetName].forEach(moon => {
                moon.userData.angle += moon.userData.speed * timeSpeed;
                moon.position.x = planetPos.x + Math.cos(moon.userData.angle) * moon.userData.distance * 2; // Reduced from 5 to 2
                moon.position.z = planetPos.z + Math.sin(moon.userData.angle) * moon.userData.distance * 2;
                moon.rotation.y += 0.005 * timeSpeed;
            });
        }
    }
}

// Update camera focus
function updateCameraFocus() {
    if (currentFocus) {
        let target;
        if (currentFocus === 'sun') {
            target = sun;
        } else if (planets[currentFocus]) {
            target = planets[currentFocus];
        } else if (dwarfPlanets[currentFocus]) {
            target = dwarfPlanets[currentFocus];
        }
        if (target) {
            const isMoving = keys.w || keys.s || keys.a || keys.d || keys.space || keys.ctrl;
            let defaultDistance;
            if (target === sun) {
                defaultDistance = 500;
            } else if (currentFocus === 'jupiter' || currentFocus === 'saturn') {
                defaultDistance = 150; // Larger planets need more distance
            } else if (currentFocus === 'uranus' || currentFocus === 'neptune') {
                defaultDistance = 120; // Outer planets
            } else {
                defaultDistance = 45; // Inner planets and dwarf planets
            }
            if (focusTargetDistance === null) focusTargetDistance = defaultDistance;
            if (!isMoving) {
                let direction;
                if (camera.position.equals(target.position)) {
                    direction = new THREE.Vector3(1, 0.5, 1).normalize();
                } else {
                    direction = camera.position.clone().sub(target.position).normalize();
                }
                const cameraPos = target.position.clone().add(direction.multiplyScalar(focusTargetDistance));
                camera.position.lerp(cameraPos, 0.1);
            }
            camera.lookAt(target.position);
            updatePlanetInfoDisplay(currentFocus, target);
            syncZoomSlider();
        }
    } else {
        focusTargetDistance = null;
        syncZoomSlider();
    }
}

// Update planet info display
function updatePlanetInfoDisplay(objectName, object) {
    const infoElement = document.getElementById('planet-info');
    if (!infoElement) return;

    let info = '';
    let objectData = null;
    
    if (objectName === 'sun') {
        objectData = sunData;
        info = `
            <h3>Sun</h3>
            <div id="preview-placeholder"></div>
            <p><strong>Type:</strong> G-type main-sequence star</p>
            <p><strong>Temperature:</strong> 5,778 K</p>
            <p><strong>Radius:</strong> ${sunData.size} Earth radii (compressed)</p>
            <p><strong>Real:</strong> Actually 109x Earth radii</p>
        `;
    } else if (planets[objectName]) {
        objectData = planetData[objectName];
        info = `
            <h3>${objectName.charAt(0).toUpperCase() + objectName.slice(1)}</h3>
            <div id="preview-placeholder"></div>
            <p><strong>Type:</strong> Planet</p>
            <p><strong>Distance:</strong> ${objectData.distance} AU</p>
            <p><strong>Radius:</strong> ${objectData.size} Earth radii</p>
            <p><strong>Inclination:</strong> ${objectData.inclination}°</p>
            <p><strong>Orbital Speed:</strong> ${(objectData.speed * 100).toFixed(1)}% relative</p>
            <p><strong>Orbit:</strong> Nearly circular</p>
        `;
    } else if (dwarfPlanets[objectName]) {
        objectData = dwarfPlanetData[objectName];
        const eccentricityDesc = objectData.eccentricity > 0.3 ? 'Highly elliptical' : 
                                objectData.eccentricity > 0.1 ? 'Moderately elliptical' : 'Mildly elliptical';
        info = `
            <h3>${objectName.charAt(0).toUpperCase() + objectName.slice(1)}</h3>
            <div id="preview-placeholder"></div>
            <p><strong>Type:</strong> Dwarf Planet</p>
            <p><strong>Location:</strong> ${objectData.type}</p>
            <p><strong>Distance:</strong> ${objectData.distance} AU</p>
            <p><strong>Radius:</strong> ${objectData.size} Earth radii</p>
            <p><strong>Inclination:</strong> ${objectData.inclination}° ${objectData.inclination > 20 ? '(Highly inclined)' : ''}</p>
            <p><strong>Eccentricity:</strong> ${objectData.eccentricity} (${eccentricityDesc})</p>
            <p><strong>Orbit:</strong> ${objectData.eccentricity > 0.2 ? 'Highly elliptical and tilted' : 'Elliptical'}</p>
        `;
    }

    infoElement.innerHTML = info;
    infoElement.style.display = 'block';
    
    // Add preview sphere
    const placeholder = document.getElementById('preview-placeholder');
    if (placeholder && previewContainer) {
        placeholder.appendChild(previewContainer);
        updatePreviewSphere(objectName, objectData);
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    handleCameraMovement();
    updatePlanets();
    updateCameraFocus();
    
    // Animate preview sphere
    animatePreviewSphere();

    // Update meteor shower
    updateMeteorShowerWithAutoCheck(16.67); // Approx. 60 FPS

    // Update supernovas
    updateSupernovasWithAutoCheck(16.67); // Approx. 60 FPS

    renderer.render(scene, camera);
}

// UI Control Functions
function setTimeSpeed(speed) {
    timeSpeed = speed;
    document.getElementById('timeSpeedValue').textContent = `${speed.toFixed(1)}x`;
}

function togglePause() {
    isPaused = !isPaused;
    const button = document.getElementById('pauseButton');
    button.textContent = isPaused ? '▶ Play' : '⏸ Pause';
    button.classList.toggle('active', isPaused);
}

function setMovementSpeed(speed) {
    movementSpeed = speed;
    document.getElementById('movementSpeedValue').textContent = `${speed.toFixed(0)}`;
}

function focusPlanet(planetName) {
    if (currentFocus === planetName) {
        resetCamera();
        return;
    }
    currentFocus = planetName;
    document.getElementById('currentFocus').textContent = `Focus: ${planetName.charAt(0).toUpperCase() + planetName.slice(1)}`;
    focusTargetDistance = null;
    updateFocusButtonStates(planetName);
    syncZoomSlider();
}

function resetCamera() {
    currentFocus = null;
    camera.position.set(0, 500, 1000); // Match the init position
    camera.lookAt(0, 0, 0);
    focusTargetDistance = null;
    document.getElementById('currentFocus').textContent = 'Focus: Free Camera';

    // Hide planet info and preview
    const infoElement = document.getElementById('planet-info');
    if (infoElement) {
        infoElement.style.display = 'none';
    }
    
    // Remove preview sphere from scene
    if (previewSphere && previewScene) {
        previewScene.remove(previewSphere);
        previewSphere = null;
    }
    
    // Clear button states
    updateFocusButtonStates(null);
    syncZoomSlider();
}

function toggleOrbits() {
    const show = document.getElementById('showOrbits').checked;
    orbits.forEach(orbit => {
        orbit.visible = show;
    });
    dwarfOrbits.forEach(orbit => {
        orbit.visible = show;
    });
}

function toggleMoons() {
    const show = document.getElementById('showMoons').checked;
    for (let planetName in moons) {
        moons[planetName].forEach(moon => {
            moon.visible = show;
        });
    }
}

function toggleAsteroidBelt() {
    const show = document.getElementById('showAsteroidBelt').checked;
    if (asteroidBelt) {
        asteroidBelt.visible = show;
    }
}

function toggleKuiperBelt() {
    const show = document.getElementById('showKuiperBelt').checked;
    if (kuiperBelt) {
        kuiperBelt.visible = show;
    }
}

function toggleDwarfPlanets() {
    const show = document.getElementById('showDwarfPlanets').checked;
    for (let dwarfName in dwarfPlanets) {
        dwarfPlanets[dwarfName].visible = show;
    }
}

// Trigger meteor shower manually
function triggerMeteorShower() {
    if (!meteorShowerActive) {
        startMeteorShower();
    }
}

// Trigger supernova manually
function triggerSupernova() {
    createSupernova();
}

// Toggle automatic effects
function toggleAutoEffects() {
    autoEffectsEnabled = document.getElementById('autoEffects').checked;
    console.log("Auto effects:", autoEffectsEnabled ? "enabled" : "disabled");
}

// Modified update functions to respect auto effects setting
function updateMeteorShowerWithAutoCheck(deltaTime) {
    meteorShowerTimer += deltaTime;
    
    if (meteorShowerActive) {
        const meteor = meteors[0];
        const meteorCount = meteor.positions.length / 3;
        
        // Update meteor positions with realistic physics
        for (let i = 0; i < meteorCount; i++) {
            const index = i * 3;
            
            // Calculate current velocity (meteors can accelerate or decelerate)
            const currentSpeed = Math.sqrt(
                meteor.velocities[index] * meteor.velocities[index] +
                meteor.velocities[index + 1] * meteor.velocities[index + 1] +
                meteor.velocities[index + 2] * meteor.velocities[index + 2]
            );
            
            // Simulate atmospheric entry effects for meteors near planets
            let atmosphericDrag = 1.0;
            let brightnessMultiplier = 1.0;
            
            // Check if meteor is near any planet (simplified check)
            for (let planetName in planets) {
                const planet = planets[planetName];
                const distanceToPlanet = Math.sqrt(
                    (meteor.positions[index] - planet.position.x) * (meteor.positions[index] - planet.position.x) +
                    (meteor.positions[index + 1] - planet.position.y) * (meteor.positions[index + 1] - planet.position.y) +
                    (meteor.positions[index + 2] - planet.position.z) * (meteor.positions[index + 2] - planet.position.z)
                );
                
                // If within atmospheric range
                const planetSize = planetData[planetName]?.size * SIZE_SCALE || 1;
                const atmosphereRange = planetSize * 20; // Simplified atmosphere
                
                if (distanceToPlanet < atmosphereRange) {
                    atmosphericDrag = 0.98; // Slight deceleration
                    brightnessMultiplier = 2.0; // Brighter when burning up
                    break;
                }
            }
            
            // Update positions with drag
            meteor.positions[index] += meteor.velocities[index] * deltaTime * 0.001 * atmosphericDrag;
            meteor.positions[index + 1] += meteor.velocities[index + 1] * deltaTime * 0.001 * atmosphericDrag;
            meteor.positions[index + 2] += meteor.velocities[index + 2] * deltaTime * 0.001 * atmosphericDrag;
            
            // Apply slight gravitational effects (very simplified)
            if (sun) {
                const distanceToSun = Math.sqrt(
                    (meteor.positions[index] - sun.position.x) * (meteor.positions[index] - sun.position.x) +
                    (meteor.positions[index + 1] - sun.position.y) * (meteor.positions[index + 1] - sun.position.y) +
                    (meteor.positions[index + 2] - sun.position.z) * (meteor.positions[index + 2] - sun.position.z)
                );
                
                if (distanceToSun > 100) { // Avoid division by very small numbers
                    const gravityStrength = 0.1;
                    const gravityX = (sun.position.x - meteor.positions[index]) / distanceToSun * gravityStrength;
                    const gravityY = (sun.position.y - meteor.positions[index + 1]) / distanceToSun * gravityStrength;
                    const gravityZ = (sun.position.z - meteor.positions[index + 2]) / distanceToSun * gravityStrength;
                    
                    meteor.velocities[index] += gravityX * deltaTime * 0.001;
                    meteor.velocities[index + 1] += gravityY * deltaTime * 0.001;
                    meteor.velocities[index + 2] += gravityZ * deltaTime * 0.001;
                }
            }
            
            // Update meteor brightness based on atmospheric effects
            meteor.sizes[i] = meteor.sizes[i] * brightnessMultiplier;
            
            // Reset meteors that have gone too far or become too dim
            const distance = Math.sqrt(
                meteor.positions[index] * meteor.positions[index] +
                meteor.positions[index + 1] * meteor.positions[index + 1] +
                meteor.positions[index + 2] * meteor.positions[index + 2]
            );
            
            if (distance > 150000 || meteor.sizes[i] < 0.5) {
                // Reset to starting position with new trajectory
                const cameraPos = camera.position;
                const radius = 80000 + Math.random() * 30000;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                
                meteor.positions[index] = cameraPos.x + radius * Math.sin(phi) * Math.cos(theta);
                meteor.positions[index + 1] = cameraPos.y + radius * Math.cos(phi);
                meteor.positions[index + 2] = cameraPos.z + radius * Math.sin(phi) * Math.sin(theta);
                
                // Reset size
                meteor.sizes[i] = 2 + Math.random() * 8;
            }
        }
        
        meteor.geometry.attributes.position.needsUpdate = true;
        meteor.geometry.attributes.size.needsUpdate = true;
        
        // End meteor shower after duration with gradual fade
        const fadeProgress = meteorShowerTimer / meteorShowerDuration;
        if (fadeProgress > 0.8) {
            // Start fading in last 20% of duration
            const fadeOpacity = Math.max(0, 1 - (fadeProgress - 0.8) * 5);
            meteor.system.material.opacity = fadeOpacity * 0.8;
        }
        
        if (meteorShowerTimer > meteorShowerDuration) {
            meteorShowerActive = false;
            meteor.active = false;
            meteor.system.visible = false;
            meteor.system.material.opacity = 0.8; // Reset opacity
            meteorShowerTimer = 0;
            console.log("🌠 Meteor shower ended - particles dispersed");
        }
    } else {
        // Check if it's time for a new meteor shower (only if auto effects enabled)
        if (autoEffectsEnabled && meteorShowerTimer > meteorShowerCooldown) {
            startMeteorShower();
        }
    }
}

function updateSupernovasWithAutoCheck(deltaTime) {
    if (autoEffectsEnabled) {
        supernovaTimer += deltaTime;
    }
    
    // Update existing supernovas
    for (let i = supernovas.length - 1; i >= 0; i--) {
        const supernova = supernovas[i];
        supernova.timer += deltaTime;
        
        const progress = supernova.timer / supernova.duration;
        
        if (progress < 1) {
            // Realistic supernova expansion phases
            let scale, opacity;
            
            if (progress < 0.1) {
                // Initial explosion phase - rapid expansion
                scale = progress * 10 * supernova.maxScale * 0.3;
                opacity = 1;
            } else if (progress < 0.4) {
                // Peak brightness phase
                scale = (0.3 + (progress - 0.1) * 2.3) * supernova.maxScale;
                opacity = 1 - (progress - 0.1) * 0.3;
                       } else {
                // Fade phase - slower expansion, rapid dimming
                scale = (1 + (progress - 0.4) * 0.8) * supernova.maxScale;
                opacity = Math.max(0, 0.7 - (progress - 0.4) * 1.2);
            }
            
            // Update core sphere
            supernova.sphere.scale.setScalar(scale * 0.01); // Core stays smaller
            supernova.material.opacity = opacity;
            supernova.material.emissiveIntensity = opacity * 2;
            
            // Update multiple shockwave rings with delays
            supernova.rings.forEach((ringData, index) => {
                const ringProgress = Math.max(0, progress - ringData.delay);
                if (ringProgress > 0) {
                    const ringScale = 1 + ringProgress * (15 + index * 5);
                    ringData.ring.scale.setScalar(ringScale);
                    ringData.ring.lookAt(camera.position);
                    ringData.material.opacity = Math.max(0, (0.4 - index * 0.1) * (1 - ringProgress));
                }
            });
            
            // Update particle system with realistic physics
            supernova.particleMaterial.opacity = opacity * 0.8;
            
            const particleCount = supernova.particlePositions.length / 3;
            for (let j = 0; j < particleCount; j++) {
                const index = j * 3;
                
                // Apply realistic deceleration due to interstellar medium
                const decelerationFactor = 1 - (progress * 0.1);
                
                supernova.particlePositions[index] += supernova.particleVelocities[index] * deltaTime * 0.001 * decelerationFactor;
                supernova.particlePositions[index + 1] += supernova.particleVelocities[index + 1] * deltaTime * 0.001 * decelerationFactor;
                supernova.particlePositions[index + 2] += supernova.particleVelocities[index + 2] * deltaTime * 0.001 * decelerationFactor;
                
                // Some particles fade faster than others (realistic light curve)
                const particleIndex = Math.floor(j);
                if (particleIndex < particleCount * 0.3) {
                    // High-energy particles fade slower
                    supernova.particleSizes[particleIndex] = Math.max(1, supernova.particleSizes[particleIndex] * (1 - progress * 0.3));
                } else {
                    // Low-energy particles fade faster
                    supernova.particleSizes[particleIndex] = Math.max(1, supernova.particleSizes[particleIndex] * (1 - progress * 0.8));
                }
            }
            
            supernova.geometry.attributes.position.needsUpdate = true;
            supernova.geometry.attributes.size.needsUpdate = true;
        } else {
            // Remove expired supernova
            scene.remove(supernova.sphere);
            scene.remove(supernova.particles);
            
            // Remove all rings
            supernova.rings.forEach(ringData => {
                scene.remove(ringData.ring);
                ringData.ring.geometry.dispose();
                ringData.material.dispose();
            });
            
            // Dispose of resources
            supernova.sphere.geometry.dispose();
            supernova.sphere.material.dispose();
            supernova.particles.geometry.dispose();
            supernova.particles.material.dispose();
            
            supernovas.splice(i, 1);
            console.log(`${supernova.type} supernova remnant dispersed into space`);
        }
    }
    
    // Create new supernova if cooldown is over (only if auto effects enabled)
    if (autoEffectsEnabled && supernovaTimer > supernovaCooldown) {
        createSupernova();
        supernovaTimer = 0;
    }
}

// Update focus button states for visual feedback
function updateFocusButtonStates(activePlanet) {
    // Remove active class from all focus buttons
    const buttons = document.querySelectorAll('.planet-controls button');
    buttons.forEach(button => {
        button.classList.remove('active-focus');
    });
    
    // Add active class to the currently focused button
    if (activePlanet) {
        const activeButton = Array.from(buttons).find(button => 
            button.textContent.toLowerCase() === activePlanet.toLowerCase()
        );
        if (activeButton) {
            activeButton.classList.add('active-focus');
        }
    }
}

// Zoom slider control flag to prevent circular updates
let isUpdatingZoomSlider = false;

// Zoom slider control function - simplified logic
function setZoomSlider(sliderValue) {
    if (isUpdatingZoomSlider) return; // Prevent circular updates
    
    const slider = document.getElementById('zoomSlider');
    const label = document.getElementById('zoomSliderValue');
    
    // Direct mapping: slider value = distance
    const distance = sliderValue;
    
    if (label) label.textContent = Math.round(distance);
    
    if (currentFocus) {
        // Update focus target distance
        focusTargetDistance = distance;
    } else {
        // Update free camera distance
        const currentDirection = camera.position.clone().normalize();
        camera.position.copy(currentDirection.multiplyScalar(distance));
    }
}

// Sync slider with current camera distance
function syncZoomSlider() {
    const slider = document.getElementById('zoomSlider');
    const label = document.getElementById('zoomSliderValue');
    
    let currentDistance = 1000; // Default
    
    if (currentFocus && focusTargetDistance !== null) {
        // Use stored focus distance
        currentDistance = focusTargetDistance;
    } else if (currentFocus) {
        // Calculate current distance to focused object
        let target;
        if (currentFocus === 'sun') target = sun;
        else if (planets[currentFocus]) target = planets[currentFocus];
        else if (dwarfPlanets[currentFocus]) target = dwarfPlanets[currentFocus];
        
        if (target) {
            currentDistance = camera.position.distanceTo(target.position);
        }
    } else {
        // Free camera mode - distance from origin
        currentDistance = camera.position.length();
    }
    
    // Clamp to slider range
    currentDistance = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, currentDistance));
    
    // Prevent circular updates
    isUpdatingZoomSlider = true;
    if (slider) slider.value = currentDistance;
    if (label) label.textContent = Math.round(currentDistance);
    isUpdatingZoomSlider = false;
}

// Initialize when page loads
window.addEventListener('load', init);