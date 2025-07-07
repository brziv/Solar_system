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

// Solar system data - Sun at 2x Jupiter for visibility
const sunData = {
    size: 22  // 2x Jupiter size (11 * 2 = 22)
};

// Planet data relative to Earth (Earth = 1 unit) - Realistic proportions
const planetData = {
    mercury: { size: 0.38, distance: 2.0, speed: 0.008, color: 0x8C7853, inclination: 7.0 },
    venus: { size: 0.95, distance: 3.5, speed: 0.006, color: 0xFFC649, inclination: 3.4 },
    earth: { size: 1, distance: 5.0, speed: 0.005, color: 0x6B93D6, hasAtmosphere: true, inclination: 0.0 },
    mars: { size: 0.53, distance: 7.5, speed: 0.004, color: 0xCD5C5C, inclination: 1.9 },
    jupiter: { size: 11, distance: 26.0, speed: 0.002, color: 0xD8CA9D, inclination: 1.3 },
    saturn: { size: 9, distance: 47.5, speed: 0.0015, color: 0xFAD5A5, hasRings: true, inclination: 2.5 },
    uranus: { size: 4, distance: 96.0, speed: 0.001, color: 0x4FD0E7, inclination: 0.8 },
    neptune: { size: 3.9, distance: 150.0, speed: 0.0008, color: 0x4B70DD, inclination: 1.8 }
};

// Dwarf planet data with orbital inclinations and eccentricity - Realistic proportions
const dwarfPlanetData = {
    ceres: { size: 0.15, distance: 14.0, speed: 0.003, color: 0x8C7853, type: 'asteroid belt', inclination: 10.6, eccentricity: 0.076 },
    pluto: { size: 0.18, distance: 197.5, speed: 0.0006, color: 0xD4A574, type: 'kuiper belt', inclination: 17.2, eccentricity: 0.244 },
    eris: { size: 0.19, distance: 338.5, speed: 0.0005, color: 0xCCCCCC, type: 'scattered disk', inclination: 44.2, eccentricity: 0.436 },
    haumea: { size: 0.12, distance: 216.5, speed: 0.0006, color: 0xFFFFFF, type: 'kuiper belt', inclination: 28.2, eccentricity: 0.189 },
    makemake: { size: 0.11, distance: 229.0, speed: 0.0005, color: 0xD4A574, type: 'kuiper belt', inclination: 29.0, eccentricity: 0.159 }
};

// Moon data - Realistic proportions
const moonData = {
    earth: [{ name: 'moon', size: 0.27, distance: 15, speed: 0.02, color: 0x969696 }]
};

// Initialize the solar system
function init() {
    // Create scene
    scene = new THREE.Scene();

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 300000);
    camera.position.set(0, 500, 1500); // Moved back further for larger system

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
        ring: 'textures/8k_saturn_ring.jpg',
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
        positions[i * 3] = (Math.random() - 0.5) * 200000;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200000;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200000;
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
    const geometry = new THREE.SphereGeometry(sunData.size * 8, 32, 32);
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
    const geometry = new THREE.SphereGeometry(data.size * 10, 32, 32);
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

    planet.position.x = Math.cos(angle) * data.distance * 200; // Increased from 30 to 200
    planet.position.z = Math.sin(angle) * data.distance * 200;
    planet.position.y = Math.sin(inclinationRad) * data.distance * 10; // Scaled proportionally

    planet.userData = {
        name,
        originalDistance: data.distance * 200, // Updated to match
        speed: data.speed,
        angle: angle,
        inclination: inclinationRad
    };

    planets[name] = planet;
    solarSystemGroup.add(planet);

    // Special handling for Earth (add clouds)
    if (name === 'earth' && loadedTextures.earthClouds) {
        const cloudGeometry = new THREE.SphereGeometry(data.size * 5, 32, 32);
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
        const ringGeometry = new THREE.RingGeometry(data.size * 20, data.size * 3.5, 32);
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
    const geometry = new THREE.SphereGeometry(moonInfo.size * 15, 16, 16);
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
    const geometry = new THREE.SphereGeometry(data.size * 50, 16, 16);
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

    dwarfPlanet.position.x = Math.cos(angle) * data.distance * 200; // Increased from 30 to 200
    dwarfPlanet.position.z = Math.sin(angle) * data.distance * 200;
    dwarfPlanet.position.y = Math.sin(inclinationRad) * data.distance * 50; // Increased from 15 to 50 for more visible inclination

    dwarfPlanet.userData = {
        name,
        originalDistance: data.distance * 200, // Updated to match
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
        const radius = data.distance * 200; // Increased from 30 to 200
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
        const semiMajorAxis = data.distance * 200;
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
    const asteroidCount = 3000; // Increased from 500
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(asteroidCount * 3);

    for (let i = 0; i < asteroidCount; i++) {
        const distance = 11.0 + Math.random() * 6.0; // Between Mars and Jupiter (scaled up)
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 20; // Increased height variation

        positions[i * 3] = Math.cos(angle) * distance * 200; // Increased from 30 to 200
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * distance * 200;
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
    const kuiperCount = 150000; // Increased from 100000
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(kuiperCount * 3);

    for (let i = 0; i < kuiperCount; i++) {
        const distance = 150 + Math.random() * 400; // Extended range beyond Neptune (scaled up)
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 30; // Increased height variation

        positions[i * 3] = Math.cos(angle) * distance * 200; // Increased from 30 to 200
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * distance * 200;
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
    const distance = camera.position.length();
    const factor = event.deltaY > 0 ? 1.1 : 0.9;
    const newDistance = Math.max(300, Math.min(20000, distance * factor)); // Increased limits for larger system

    camera.position.normalize().multiplyScalar(newDistance);
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
                moon.position.x = planetPos.x + Math.cos(moon.userData.angle) * moon.userData.distance * 5; // Scaled up moon distance
                moon.position.z = planetPos.z + Math.sin(moon.userData.angle) * moon.userData.distance * 5;
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
            // Only apply automatic following if no keys are pressed
            const isMoving = keys.w || keys.s || keys.a || keys.d || keys.space || keys.ctrl;
            
            if (!isMoving) {
                // Auto-follow behavior when not manually moving
                const distance = target === sun ? 500 : 150;
                const targetPos = target.position.clone();
                const cameraPos = targetPos.clone().add(new THREE.Vector3(distance, distance * 0.5, distance));
                
                camera.position.lerp(cameraPos, 0.05);
            }
            
            // Always look at the target
            camera.lookAt(target.position);

            // Update planet info display
            updatePlanetInfoDisplay(currentFocus, target);
        }
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
    currentFocus = planetName;
    document.getElementById('currentFocus').textContent = `Focus: ${planetName.charAt(0).toUpperCase() + planetName.slice(1)}`;
}

function resetCamera() {
    currentFocus = null;
    camera.position.set(0, 500, 1500); // Updated for larger system
    camera.lookAt(0, 0, 0);
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

// Initialize when page loads
window.addEventListener('load', init);