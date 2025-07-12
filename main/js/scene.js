// Scene Creation Module
// Handles creation of all celestial bodies, orbits, and belts

// Load all textures
function loadTextures() {
    const textureLoader = new THREE.TextureLoader(loadingManager);

    for (let key in texturePaths) {
        textureLoader.load(texturePaths[key], (texture) => {
            loadedTextures[key] = texture;
        });
    }
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
