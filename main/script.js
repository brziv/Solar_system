import { languages } from './lang/index.js';

let currentLang = localStorage.getItem('lang') || 'vi';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    const dict = languages[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
    });
    // Đặt lại value cho select nếu cần
    const sel = document.getElementById('lang-select');
    if (sel && sel.value !== lang) sel.value = lang;
}

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
        renderSidebarContent();
        createSolarSystem();
        createPreviewSphere();
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
            const factor = event.deltaY > 0 ? 1.1 : 0.9;
            
            // Set reasonable minimum distances based on object type
            let minDistance;
            if (target === sun) {
                minDistance = 50; // Sun minimum distance
            } else if (currentFocus === 'jupiter' || currentFocus === 'saturn') {
                minDistance = 25; // Large planets
            } else if (currentFocus === 'uranus' || currentFocus === 'neptune') {
                minDistance = 20; // Medium planets
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
        const factor = event.deltaY > 0 ? 1.1 : 0.9;
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
function getI18n(key, params = {}) {
    if (!languages[currentLang] || typeof languages[currentLang] !== 'object') {
        console.error('Ngôn ngữ không tồn tại hoặc không đúng object:', currentLang, languages);
        return key;
    }
    if (!languages[currentLang][key]) {
        console.warn('Không tìm thấy bản dịch cho key:', key, 'ở ngôn ngữ', currentLang);
    }
    let str = languages[currentLang][key] || key;
    Object.keys(params).forEach(k => {
        str = str.replace(`{${k}}`, params[k]);
    });
    return str;
}

function updatePlanetInfoDisplay(objectName, object) {
    const infoElement = document.getElementById('sidebar-planet-info');
    if (!infoElement) return;

    let info = '';
    let objectData = null;
    
    if (objectName === 'sun') {
        objectData = sunData;
        info = `
            <h3>${getI18n('planet_sun')}</h3>
            <div id="preview-placeholder"></div>
            <p>${getI18n('planet_sun_desc')}</p>
            <p><strong>${getI18n('type') || 'Type'}:</strong> ${getI18n('planet_sun_type')}</p>
            <p><strong>${getI18n('temperature') || 'Temperature'}:</strong> ${getI18n('planet_sun_temp')}</p>
            <p><strong>${getI18n('radius') || 'Radius'}:</strong> ${getI18n('planet_sun_radius')}</p>
            <p><em>${getI18n('planet_sun_fact')}</em></p>
        `;
    } else if (planets[objectName]) {
        objectData = planetData[objectName];
        info = `
            <h3>${getI18n('planet_' + objectName)}</h3>
            <div id="preview-placeholder"></div>
            <p>${getI18n('planet_' + objectName + '_desc')}</p>
            <p><strong>${getI18n('type') || 'Type'}:</strong> ${getI18n('planet_' + objectName + '_type')}</p>
            <p><strong>${getI18n('distance') || 'Distance'}:</strong> ${getI18n('planet_' + objectName + '_distance')}</p>
            <p><strong>${getI18n('radius') || 'Radius'}:</strong> ${getI18n('planet_' + objectName + '_radius')}</p>
            <p><strong>${getI18n('inclination') || 'Inclination'}:</strong> ${getI18n('planet_' + objectName + '_inclination')}</p>
            <p><strong>${getI18n('speed') || 'Orbital Speed'}:</strong> ${getI18n('planet_' + objectName + '_speed')}</p>
            <p><strong>${getI18n('orbit') || 'Orbit'}:</strong> ${getI18n('planet_' + objectName + '_orbit')}</p>
            <p><em>${getI18n('planet_' + objectName + '_fact')}</em></p>
        `;
    } else if (dwarfPlanets[objectName]) {
        objectData = dwarfPlanetData[objectName];
        info = `
            <h3>${getI18n('planet_' + objectName)}</h3>
            <div id="preview-placeholder"></div>
            <p>${getI18n('planet_' + objectName + '_desc')}</p>
            <p><strong>${getI18n('type') || 'Type'}:</strong> ${getI18n('planet_' + objectName + '_type')}</p>
            <p><strong>${getI18n('distance') || 'Distance'}:</strong> ${getI18n('planet_' + objectName + '_distance')}</p>
            <p><strong>${getI18n('radius') || 'Radius'}:</strong> ${getI18n('planet_' + objectName + '_radius')}</p>
            <p><strong>${getI18n('inclination') || 'Inclination'}:</strong> ${getI18n('planet_' + objectName + '_inclination')}</p>
            <p><strong>${getI18n('speed') || 'Orbital Speed'}:</strong> ${getI18n('planet_' + objectName + '_speed')}</p>
            <p><strong>${getI18n('orbit') || 'Orbit'}:</strong> ${getI18n('planet_' + objectName + '_orbit')}</p>
            <p><em>${getI18n('planet_' + objectName + '_fact')}</em></p>
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
    lastFocusedPlanet = planetName;
    sidebarTab = 'info';
    updateFocusButtonStates(planetName);
    syncZoomSlider();
    renderSidebarContent();
}

function resetCamera() {
    currentFocus = null;
    camera.position.set(0, 500, 1000); // Match the init position
    camera.lookAt(0, 0, 0);
    focusTargetDistance = null;
    sidebarTab = 'controls';
    lastFocusedPlanet = null;
    renderSidebarContent();
    // ... các logic cũ khác ...
    if (previewSphere && previewScene) {
        previewScene.remove(previewSphere);
        previewSphere = null;
    }
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

window.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('close-sidebar');
    if (closeBtn) {
        closeBtn.style.display = '';
        closeBtn.onclick = hideSidebar;
    }
    const openBtn = document.getElementById('open-sidebar');
    if (openBtn) {
        openBtn.onclick = showSidebar;
    }
    // Khi click vào bất kỳ nút focus planet, show lại sidebar
    document.getElementById('sidebar').addEventListener('click', (e) => {
        if (e.target.closest('.planet-controls button')) {
            showSidebar();
        }
    });
});

// Initialize when page loads
window.addEventListener('load', init);

// Render lại controls, info, planet-info vào sidebar khi loading xong
function renderSidebarContent() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    sidebar.innerHTML = `
        <div id="sidebar-header">
            <button id="close-sidebar" style="position:absolute;top:12px;right:16px;z-index:10;">×</button>
            <div id="sidebar-tabs">
                <button id="tab-controls" class="${sidebarTab === 'controls' ? 'active' : ''}" ${sidebarTab === 'controls' ? 'disabled' : ''}>Điều khiển</button>
                <button id="tab-info" class="${sidebarTab === 'info' ? 'active' : ''}" ${lastFocusedPlanet ? '' : 'disabled'}>Thông tin</button>
            </div>
        </div>
        <div id="sidebar-scroll-content"></div>
    `;
    attachSidebarTabEvents();
    renderSidebarTabContent();
    setLanguage(currentLang);
}

function renderSidebarTabContent() {
    const content = document.getElementById('sidebar-scroll-content');
    if (!content) return;
    if (sidebarTab === 'controls') {
        // Render nút hành tinh bằng i18n
        const planetButtons = [
            'sun','mercury','venus','earth','mars','jupiter','saturn','uranus','neptune'
        ].map(p => `<button data-planet="${p}" data-i18n="planet_${p}">${getI18n('planet_' + p)}</button>`).join('');
        const dwarfButtons = [
            'ceres','pluto','eris','haumea','makemake'
        ].map(p => `<button data-planet="${p}" data-i18n="planet_${p}">${getI18n('planet_' + p)}</button>`).join('');
        content.innerHTML = `
            <select id="lang-select" style="margin: 10px 0; width: 100%;">
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
            </select>
            <div class="control-group">
                <h3 data-i18n="time_speed">${getI18n('time_speed')}</h3>
                <div class="slider-container">
                    <input type="range" id="timeSpeedSlider" min="0" max="10" step="0.1" value="1">
                    <span id="timeSpeedValue">1.0x</span>
                </div>
                <button id="pauseButton" data-i18n="pause">${getI18n('pause')}</button>
            </div>
            <div class="control-group">
                <h3 data-i18n="movement_speed">${getI18n('movement_speed')}</h3>
                <div class="slider-container">
                    <input type="range" id="movementSpeedSlider" min="1" max="50" step="1" value="10">
                    <span id="movementSpeedValue">5</span>
                </div>
            </div>
            <div class="control-group">
                <h3 data-i18n="zoom">${getI18n('zoom')}</h3>
                <div class="slider-container">
                    <input type="range" id="zoomSlider" min="10" max="2000" step="1" value="1000">
                    <span id="zoomSliderValue">1000</span>
                </div>
            </div>
            <div class="control-group">
                <h3 data-i18n="focus_planet">${getI18n('focus_planet')}</h3>
                <p style="font-size: 11px; color: #ccc; margin: 0 0 5px 0;" data-i18n="click_again_unfocus">${getI18n('click_again_unfocus')}</p>
                <div class="planet-controls">${planetButtons}</div>
            </div>
            <div class="control-group">
                <h3 data-i18n="focus_dwarf_planet">${getI18n('focus_dwarf_planet')}</h3>
                <p style="font-size: 11px; color: #ccc; margin: 0 0 5px 0;" data-i18n="click_again_unfocus">${getI18n('click_again_unfocus')}</p>
                <div class="planet-controls">${dwarfButtons}</div>
            </div>
            <div class="control-group">
                <h3 data-i18n="view_options">${getI18n('view_options')}</h3>
                <div class="checkbox-group">
                    <input type="checkbox" id="showOrbits" checked>
                    <label for="showOrbits" data-i18n="show_orbits">${getI18n('show_orbits')}</label>
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="showMoons" checked>
                    <label for="showMoons" data-i18n="show_moons">${getI18n('show_moons')}</label>
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="showDwarfPlanets" checked>
                    <label for="showDwarfPlanets" data-i18n="show_dwarf_planets">${getI18n('show_dwarf_planets')}</label>
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="showAsteroidBelt" checked>
                    <label for="showAsteroidBelt" data-i18n="show_asteroid_belt">${getI18n('show_asteroid_belt')}</label>
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="showKuiperBelt" checked>
                    <label for="showKuiperBelt" data-i18n="show_kuiper_belt">${getI18n('show_kuiper_belt')}</label>
                </div>
                <button id="resetCameraBtn" data-i18n="reset_camera">${getI18n('reset_camera')}</button>
            </div>
            <div class="control-group" id="sidebar-info">
                <div data-i18n="camera_free_roam">${getI18n('camera_free_roam')}</div>
                <div data-i18n="controls">${getI18n('controls')}</div>
                <div id="currentFocus">Focus: Free camera</div>
            </div>
        `;
        attachSidebarEvents();
    } else if (sidebarTab === 'info') {
        content.innerHTML = `<div class="control-group" id="sidebar-planet-info"></div>`;
        attachSidebarEvents();
        // Render planet info nếu đang focus
        if (lastFocusedPlanet) {
            updatePlanetInfoDisplay(lastFocusedPlanet, planets[lastFocusedPlanet] || dwarfPlanets[lastFocusedPlanet] || sun);
        }
    }
    setLanguage(currentLang);
}

function attachSidebarTabEvents() {
    // Tab chuyển đổi
    const tabControls = document.getElementById('tab-controls');
    const tabInfo = document.getElementById('tab-info');
    if (tabControls) tabControls.onclick = () => { sidebarTab = 'controls'; renderSidebarContent(); };
    if (tabInfo && lastFocusedPlanet) tabInfo.onclick = () => { sidebarTab = 'info'; renderSidebarContent(); };
    // Đóng sidebar, luôn gán lại event
    const closeBtn = document.getElementById('close-sidebar');
    if (closeBtn) closeBtn.onclick = hideSidebar;
    // Mở sidebar, đổi ngôn ngữ, controls...
    attachSidebarEvents();
}

function attachSidebarEvents() {
    // Đóng sidebar
    const closeBtn = document.getElementById('close-sidebar');
    if (closeBtn) closeBtn.onclick = hideSidebar;
    // Mở sidebar
    const openBtn = document.getElementById('open-sidebar');
    if (openBtn) openBtn.onclick = showSidebar;
    // Đổi ngôn ngữ
    const langSel = document.getElementById('lang-select');
    if (langSel) langSel.onchange = (e) => setLanguage(e.target.value);
    // Focus planet
    document.querySelectorAll('.planet-controls button').forEach(btn => {
        btn.onclick = function() {
            focusPlanet(this.getAttribute('data-planet'));
        };
    });
    // Reset camera
    const resetBtn = document.getElementById('resetCameraBtn');
    if (resetBtn) resetBtn.onclick = resetCamera;
    // Pause
    const pauseBtn = document.getElementById('pauseButton');
    if (pauseBtn) pauseBtn.onclick = togglePause;
    // Time speed
    const timeSlider = document.getElementById('timeSpeedSlider');
    if (timeSlider) timeSlider.oninput = function() { setTimeSpeed(parseFloat(this.value)); };
    // Movement speed
    const moveSlider = document.getElementById('movementSpeedSlider');
    if (moveSlider) moveSlider.oninput = function() { setMovementSpeed(parseFloat(this.value)); };
    // Zoom
    const zoomSlider = document.getElementById('zoomSlider');
    if (zoomSlider) zoomSlider.oninput = function() { setZoomSlider(parseFloat(this.value)); };
    // Checkbox toggles
    const orbits = document.getElementById('showOrbits');
    if (orbits) orbits.onchange = toggleOrbits;
    const moons = document.getElementById('showMoons');
    if (moons) moons.onchange = toggleMoons;
    const dwarfs = document.getElementById('showDwarfPlanets');
    if (dwarfs) dwarfs.onchange = toggleDwarfPlanets;
    const asteroids = document.getElementById('showAsteroidBelt');
    if (asteroids) asteroids.onchange = toggleAsteroidBelt;
    const kuiper = document.getElementById('showKuiperBelt');
    if (kuiper) kuiper.onchange = toggleKuiperBelt;
}