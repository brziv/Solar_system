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

// Create the sun
function createSun() {
    const geometry = new THREE.SphereGeometry(sunData.size * 8, 32, 32);

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

    // Create comet orbits (highly elliptical)
    for (let cometName in cometData) {
        const data = cometData[cometName];
        const points = [];
        const semiMajorAxis = (data.perihelion + data.aphelion) / 2 * DISTANCE_SCALE;
        const eccentricity = data.eccentricity;
        const inclinationRad = (data.inclination || 0) * Math.PI / 180;

        for (let i = 0; i <= 256; i++) { // Higher resolution for comet orbits
            const angle = (i / 256) * Math.PI * 2;
            
            // Calculate elliptical orbit with high eccentricity
            const r = (semiMajorAxis * (1 - eccentricity * eccentricity)) / 
                      (1 + eccentricity * Math.cos(angle));
            
            const x = r * Math.cos(angle);
            const z = r * Math.sin(angle);
            
            // Apply orbital inclination
            const y = Math.sin(angle) * Math.sin(inclinationRad) * r * 0.5;

            points.push(new THREE.Vector3(x, y, z));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: data.color,
            transparent: true,
            opacity: 0.3,
            linewidth: 2
        });

        const orbit = new THREE.Line(geometry, material);
        orbit.userData = { cometName, visible: true };
        cometOrbits.push(orbit);
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
    const kuiperGeometry = new THREE.BufferGeometry();
    const kuiperCount = 100000; // Very large number for dense belt
    const positions = new Float32Array(kuiperCount * 3);
    const colors = new Float32Array(kuiperCount * 3);

    for (let i = 0; i < kuiperCount; i++) {
        let distance, height;
        const rand = Math.random();

        // Different regions of the Kuiper Belt
        if (rand < 0.7) {
            // Classical Kuiper Belt (39-48 AU)
            distance = 39 + Math.random() * 9;
            height = (Math.random() - 0.5) * 60; // Thicker than asteroid belt
        } else if (rand < 0.9) {
            // Scattered Disk (inner) (30-50 AU)
            distance = 30 + Math.random() * 20;
            height = (Math.random() - 0.5) * 100; // Even thicker
        } else {
            // Scattered Disk (outer) (50-100 AU)
            distance = 50 + Math.random() * 50;
            height = (Math.random() - 0.5) * 150; // Very thick
        }

        distance *= DISTANCE_SCALE;

        const angle = Math.random() * Math.PI * 2;
        positions[i * 3] = Math.cos(angle) * distance;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * distance;

        // Color variation for icy objects based on real observations
        const rand2 = Math.random();
        let brightness, redTint, grayTint, blueTint;
        
        if (rand2 < 0.4) {
            // Neutral/gray objects (like Pluto's moon Charon)
            brightness = 0.6 + Math.random() * 0.3;
            redTint = brightness * 0.9;
            grayTint = brightness * 0.9;
            blueTint = brightness * 0.95;
        } else if (rand2 < 0.7) {
            // Reddish objects (like Pluto, Makemake) - tholins from radiation
            brightness = 0.5 + Math.random() * 0.4;
            redTint = brightness;
            grayTint = brightness * 0.7;
            blueTint = brightness * 0.6;
        } else if (rand2 < 0.85) {
            // Very red objects (like Sedna, some classical KBOs)
            brightness = 0.4 + Math.random() * 0.3;
            redTint = brightness * 1.1;
            grayTint = brightness * 0.6;
            blueTint = brightness * 0.5;
        } else {
            // Bright icy objects (like Haumea, fresh ice surfaces)
            brightness = 0.7 + Math.random() * 0.3;
            redTint = brightness * 0.95;
            grayTint = brightness * 0.98;
            blueTint = brightness * 1.0; // Slightly blue for fresh ice
        }
        
        colors[i * 3] = Math.min(1.0, redTint);      // R
        colors[i * 3 + 1] = Math.min(1.0, grayTint); // G
        colors[i * 3 + 2] = Math.min(1.0, blueTint); // B
    }

    kuiperGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    kuiperGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const kuiperMaterial = new THREE.PointsMaterial({
        size: 0.8,
        vertexColors: true,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.8
    });

    kuiperBelt = new THREE.Points(kuiperGeometry, kuiperMaterial);
    solarSystemGroup.add(kuiperBelt);
}

// Create Oort Cloud - spherical shell of distant comets
function createOortCloud() {
    const oortGeometry = new THREE.BufferGeometry();
    const particleCount = oortCloudData.particleCount;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        // Generate random point on spherical shell
        const phi = Math.random() * Math.PI * 2; // Azimuthal angle
        const cosTheta = Math.random() * 2 - 1;   // Polar angle (uniform distribution)
        const theta = Math.acos(cosTheta);
        
        // Random radius within the Oort Cloud shell
        const minRadius = oortCloudData.innerRadius * DISTANCE_SCALE;
        const maxRadius = oortCloudData.outerRadius * DISTANCE_SCALE;
        const radius = minRadius + Math.random() * (maxRadius - minRadius);
        
        // Convert spherical to cartesian coordinates
        const x = radius * Math.sin(theta) * Math.cos(phi);
        const y = radius * Math.sin(theta) * Math.sin(phi);
        const z = radius * Math.cos(theta);
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        // Assign colors based on comet composition
        const rand = Math.random();
        let color;
        if (rand < 0.4) {
            // Icy comets (most common)
            color = new THREE.Color(oortCloudData.colors.icy);
        } else if (rand < 0.7) {
            // Dirty ice comets
            color = new THREE.Color(oortCloudData.colors.dirty);
        } else if (rand < 0.9) {
            // Carbonaceous comets
            color = new THREE.Color(oortCloudData.colors.carbonaceous);
        } else {
            // Methane-rich comets
            color = new THREE.Color(oortCloudData.colors.methane);
        }
        
        // Add some brightness variation
        const brightness = 0.3 + Math.random() * 0.7;
        colors[i * 3] = color.r * brightness;
        colors[i * 3 + 1] = color.g * brightness;
        colors[i * 3 + 2] = color.b * brightness;
        
        // Vary particle sizes slightly
        sizes[i] = oortCloudData.size * (0.5 + Math.random() * 0.5);
    }

    oortGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    oortGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    oortGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const oortMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        transparent: true,
        opacity: oortCloudData.opacity,
        size: oortCloudData.size,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    oortCloud = new THREE.Points(oortGeometry, oortMaterial);
    scene.add(oortCloud); // Add directly to scene, not solar system group
}

// Create comets with stunning visual components (ESA reference style)
function createComets() {
    comets = {};
    
    for (let cometName in cometData) {
        const data = cometData[cometName];
        
        // 1. NUCLEUS - Small dark rocky-icy core
        const nucleusGeometry = new THREE.SphereGeometry(data.size * SIZE_SCALE, 12, 12);
        const nucleusMaterial = new THREE.MeshLambertMaterial({
            color: 0x444444,
            emissive: 0x222222,
            emissiveIntensity: 0.3
        });
        const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
        
        // 2. COMA - Bright spherical cloud (main visual feature)
        const comaGeometry = new THREE.SphereGeometry(data.size * SIZE_SCALE * 10, 24, 24);
        const comaMaterial = new THREE.MeshBasicMaterial({
            color: 0xCCEEFF,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        });
        const coma = new THREE.Mesh(comaGeometry, comaMaterial);
        
        // Coma outer glow
        const comaGlowGeometry = new THREE.SphereGeometry(data.size * SIZE_SCALE * 12, 24, 24);
        const comaGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0x88CCFF,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        });
        const comaGlow = new THREE.Mesh(comaGlowGeometry, comaGlowMaterial);
        
        // 3. PLASMA TAIL - Straight, narrow, blue (using cylinder instead of cone)
        const plasmaTailGeometry = new THREE.CylinderGeometry(0.1, 0.05, data.tailLength * 20, 8, 1, true);
        const plasmaMaterial = new THREE.MeshBasicMaterial({
            color: 0x4499FF,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        const plasmaTail = new THREE.Mesh(plasmaTailGeometry, plasmaMaterial);
        
        // Rotate the plasma tail so it initially points in the negative Z direction
        plasmaTail.rotation.x = Math.PI / 2;
        
        // 4. DUST TAIL - Broader, curved, yellowish-white (more prominent than ion tail)
        const dustTailGeometry = new THREE.CylinderGeometry(0.8, 0.2, data.tailLength * 30, 12, 1, true);
        const dustMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFDD88,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        const dustTail = new THREE.Mesh(dustTailGeometry, dustMaterial);
        
        // Rotate the dust tail so it initially points in the negative Z direction
        dustTail.rotation.x = Math.PI / 2;
        
        // Plasma tail particles
        const plasmaParticleCount = 200;
        const plasmaGeometry = new THREE.BufferGeometry();
        const plasmaPositions = new Float32Array(plasmaParticleCount * 3);
        const plasmaColors = new Float32Array(plasmaParticleCount * 3);
        
        for (let i = 0; i < plasmaParticleCount; i++) {
            const distance = Math.random() * data.tailLength * 20;
            const spread = distance * 0.02; // Very narrow
            
            plasmaPositions[i * 3] = (Math.random() - 0.5) * spread;
            plasmaPositions[i * 3 + 1] = (Math.random() - 0.5) * spread;
            plasmaPositions[i * 3 + 2] = -distance;
            
            // Blue plasma color
            const brightness = 0.5 + Math.random() * 0.5;
            plasmaColors[i * 3] = brightness * 0.3;     // R
            plasmaColors[i * 3 + 1] = brightness * 0.6; // G
            plasmaColors[i * 3 + 2] = brightness * 1.0; // B (blue)
        }
        
        plasmaGeometry.setAttribute('position', new THREE.BufferAttribute(plasmaPositions, 3));
        plasmaGeometry.setAttribute('color', new THREE.BufferAttribute(plasmaColors, 3));
        
        const plasmaParticleMaterial = new THREE.PointsMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0,
            size: 2,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const plasmaParticles = new THREE.Points(plasmaGeometry, plasmaParticleMaterial);
        
        // Dust tail particles - broader, curved tail following radiation pressure
        const dustParticleCount = 200; // More particles for better visibility
        const dustGeometry = new THREE.BufferGeometry();
        const dustPositions = new Float32Array(dustParticleCount * 3);
        const dustColors = new Float32Array(dustParticleCount * 3);
        const dustSizes = new Float32Array(dustParticleCount);
        
        for (let i = 0; i < dustParticleCount; i++) {
            const distance = Math.random() * data.tailLength * 25; // Longer tail
            const spread = distance * 0.15; // Much broader spread
            
            dustPositions[i * 3] = (Math.random() - 0.5) * spread;
            dustPositions[i * 3 + 1] = (Math.random() - 0.5) * spread;
            dustPositions[i * 3 + 2] = -distance;
            
            // Yellowish-white dust color (more realistic)
            const brightness = 0.5 + Math.random() * 0.5;
            dustColors[i * 3] = brightness * 1.0;     // R
            dustColors[i * 3 + 1] = brightness * 0.9; // G  
            dustColors[i * 3 + 2] = brightness * 0.6; // B (warm yellow-white)
            
            // Varying particle sizes
            dustSizes[i] = 2 + Math.random() * 4; // Larger particles
        }
        
        dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
        dustGeometry.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));
        dustGeometry.setAttribute('size', new THREE.BufferAttribute(dustSizes, 1));
        
        const dustParticleMaterial = new THREE.PointsMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0,
            size: 4, // Larger base size
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const dustParticles = new THREE.Points(dustGeometry, dustParticleMaterial);
        
        // Group all comet components
        const cometGroup = new THREE.Group();
        cometGroup.add(nucleus);
        cometGroup.add(coma);
        cometGroup.add(comaGlow);
        cometGroup.add(plasmaTail);
        cometGroup.add(plasmaParticles);
        cometGroup.add(dustParticles);
        
        // Set initial position
        const initialDistance = data.perihelion * DISTANCE_SCALE;
        cometGroup.position.set(initialDistance, 0, 0);
        
        // Store all references and data
        cometGroup.userData = {
            ...data,
            name: cometName,
            angle: 0,
            nucleus: nucleus,
            coma: coma,
            comaGlow: comaGlow,
            plasmaTail: plasmaTail,
            plasmaParticles: plasmaParticles,
            dustParticles: dustParticles,
            comaMaterial: comaMaterial,
            comaGlowMaterial: comaGlowMaterial,
            plasmaMaterial: plasmaMaterial,
            plasmaParticleMaterial: plasmaParticleMaterial,
            dustParticleMaterial: dustParticleMaterial,
            semiMajorAxis: (data.perihelion + data.aphelion) / 2,
            originalDistance: (data.perihelion + data.aphelion) / 2
        };
        
        comets[cometName] = cometGroup;
        solarSystemGroup.add(cometGroup);
    }
}

// Create Heliospheric Boundary Glow - ENA emissions at heliopause
function createHeliosphericGlow() {
    const glowGeometry = new THREE.BufferGeometry();
    const particleCount = heliosphericGlowData.particleCount;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        // Generate random point on spherical shell at heliopause
        const phi = Math.random() * Math.PI * 2; // Azimuthal angle
        const cosTheta = Math.random() * 2 - 1;   // Polar angle (uniform distribution)
        const theta = Math.acos(cosTheta);
        
        // Random radius around heliopause distance
        const baseRadius = heliosphericGlowData.heliopauseDistance * DISTANCE_SCALE;
        const variation = baseRadius * 0.3; // 30% variation
        const radius = baseRadius + (Math.random() - 0.5) * variation;
        
        // Convert spherical to cartesian coordinates
        const x = radius * Math.sin(theta) * Math.cos(phi);
        const y = radius * Math.sin(theta) * Math.sin(phi);
        const z = radius * Math.cos(theta);
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        // Assign colors based on ENA emission type
        const rand = Math.random();
        let color;
        if (rand < 0.3) {
            // ENA ribbon flux - most prominent feature
            color = new THREE.Color(heliosphericGlowData.colors.ribbon);
        } else if (rand < 0.6) {
            // Energetic Neutral Atoms
            color = new THREE.Color(heliosphericGlowData.colors.ena);
        } else if (rand < 0.8) {
            // UV emissions
            color = new THREE.Color(heliosphericGlowData.colors.uv);
        } else {
            // Soft X-ray emissions
            color = new THREE.Color(heliosphericGlowData.colors.softXray);
        }
        
        // Add brightness variation for dynamic appearance
        const brightness = 0.4 + Math.random() * 0.6;
        colors[i * 3] = color.r * brightness;
        colors[i * 3 + 1] = color.g * brightness;
        colors[i * 3 + 2] = color.b * brightness;
        
        // Vary particle sizes
        sizes[i] = heliosphericGlowData.size * (0.5 + Math.random() * 1.5);
    }

    glowGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    glowGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    glowGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const glowMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        transparent: true,
        opacity: heliosphericGlowData.opacity,
        size: heliosphericGlowData.size,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    heliosphericGlow = new THREE.Points(glowGeometry, glowMaterial);
    heliosphericGlow.visible = true; // Always visible by default
    scene.add(heliosphericGlow); // Add directly to scene, not solar system group
}


// Create solar storm particle effects
function createSolarStorm() {
    const particleCount = solarStormData.particleCount;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        // Start particles near the sun surface
        const startRadius = sunData.size * 8 + 5; // Just outside sun surface
        const phi = Math.random() * Math.PI * 2;
        const cosTheta = Math.random() * 2 - 1;
        const theta = Math.acos(cosTheta);

        // Initial position near sun
        positions[i * 3] = startRadius * Math.sin(theta) * Math.cos(phi);
        positions[i * 3 + 1] = startRadius * Math.sin(theta) * Math.sin(phi);
        positions[i * 3 + 2] = startRadius * Math.cos(theta);

        // Velocity direction (radial outward from sun)
        const speed = solarStormData.baseSpeed + Math.random() * solarStormData.speedVariation;
        velocities[i * 3] = (positions[i * 3] / startRadius) * speed;
        velocities[i * 3 + 1] = (positions[i * 3 + 1] / startRadius) * speed;
        velocities[i * 3 + 2] = (positions[i * 3 + 2] / startRadius) * speed;

        // Particle colors - mix of plasma types
        const rand = Math.random();
        let color;
        if (rand < 0.4) {
            color = new THREE.Color(solarStormData.colors.plasma); // Orange-red plasma
        } else if (rand < 0.7) {
            color = new THREE.Color(solarStormData.colors.proton); // Yellow protons
        } else {
            color = new THREE.Color(solarStormData.colors.electron); // Blue electrons
        }

        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        // Particle size with some variation
        sizes[i] = solarStormData.size * (0.5 + Math.random() * 0.5);
    }

    // Create geometry and material
    const stormGeometry = new THREE.BufferGeometry();
    stormGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    stormGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    stormGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Store velocities as custom attribute for animation
    stormGeometry.userData = { velocities: velocities };

    const stormMaterial = new THREE.PointsMaterial({
        size: solarStormData.size,
        vertexColors: true,
        transparent: true,
        opacity: solarStormData.opacity,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    solarStorm = new THREE.Points(stormGeometry, stormMaterial);
    scene.add(solarStorm);
}

function createSolarSystem() {
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

    // Create Oort Cloud
    createOortCloud();

    // Create comets
    createComets();

    // Create heliospheric boundary glow
    createHeliosphericGlow();

    // Create solar storm effects
    createSolarStorm();
    
    // Initialize solar flare system
    initializeSolarFlares();
}

// Create solar flare effects - Dramatic bursts of energy from the Sun
function createSolarFlare() {
    const flareGroup = new THREE.Group();
    const flareData = {
        createdAt: Date.now(),
        lifetime: solarFlareData.flareLifetime,
        intensity: Math.random() * 0.7 + 0.3, // 0.3 to 1.0
        angle: Math.random() * Math.PI * 2,
        height: (20 + Math.random() * 100) * (sunData.size * 8), // Flare height in pixels
        particles: null,
        magneticLoops: [],
        glowEffect: null
    };
    
    // Determine flare class based on intensity
    let flareClass, baseColor, particleCount;
    if (flareData.intensity < 0.5) {
        flareClass = 'C'; // C-class flare
        baseColor = solarFlareData.colors.corona;
        particleCount = solarFlareData.particleCount * 0.6;
    } else if (flareData.intensity < 0.8) {
        flareClass = 'M'; // M-class flare  
        baseColor = solarFlareData.colors.plasma;
        particleCount = solarFlareData.particleCount * 0.8;
    } else {
        flareClass = 'X'; // X-class flare (most powerful)
        baseColor = solarFlareData.colors.core;
        particleCount = solarFlareData.particleCount;
    }
    
    // Create main flare particle stream
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);
    
    const sunRadius = sunData.size * 8;
    const color = new THREE.Color(baseColor);
    
    for (let i = 0; i < particleCount; i++) {
        // Start particles at sun surface in flare direction
        const phi = flareData.angle + (Math.random() - 0.5) * 0.3; // Small spread
        const theta = Math.PI * 0.5 + (Math.random() - 0.5) * 0.2; // Near equator mostly
        
        const startRadius = sunRadius + Math.random() * 10;
        positions[i * 3] = startRadius * Math.sin(theta) * Math.cos(phi);
        positions[i * 3 + 1] = startRadius * Math.cos(theta);
        positions[i * 3 + 2] = startRadius * Math.sin(theta) * Math.sin(phi);
        
        // Create initial velocity - particles follow magnetic field lines
        const height = Math.random() * flareData.height;
        const arcProgress = height / flareData.height;
        
        // Parabolic trajectory for magnetic loop
        const loopRadius = solarFlareData.baseWidth + arcProgress * (solarFlareData.peakWidth - solarFlareData.baseWidth);
        const loopHeight = height * Math.sin(arcProgress * Math.PI);
        
        const speed = solarFlareData.burstSpeed * (0.5 + Math.random() * 1.5);
        velocities[i * 3] = Math.cos(phi) * speed * (0.3 + arcProgress * 0.7);
        velocities[i * 3 + 1] = speed * (1.0 + arcProgress * 2.0); // Upward burst
        velocities[i * 3 + 2] = Math.sin(phi) * speed * (0.3 + arcProgress * 0.7);
        
        // Color variation - hotter core, cooler edges
        const intensity = 0.7 + Math.random() * 0.3;
        const coreProximity = 1.0 - Math.min(arcProgress, 0.8);
        
        if (coreProximity > 0.7) {
            // White hot core
            colors[i * 3] = 1.0;
            colors[i * 3 + 1] = 1.0;
            colors[i * 3 + 2] = 1.0;
        } else if (coreProximity > 0.4) {
            // Orange plasma
            colors[i * 3] = 1.0;
            colors[i * 3 + 1] = 0.4 + coreProximity * 0.6;
            colors[i * 3 + 2] = 0.0;
        } else {
            // Red corona
            colors[i * 3] = 1.0;
            colors[i * 3 + 1] = 0.0;
            colors[i * 3 + 2] = 0.0;
        }
        
        // Apply intensity
        colors[i * 3] *= intensity;
        colors[i * 3 + 1] *= intensity;
        colors[i * 3 + 2] *= intensity;
        
        sizes[i] = 2 + Math.random() * 4 + flareData.intensity * 3;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.userData = { velocities: velocities };
    
    const material = new THREE.PointsMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        size: 3,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    flareData.particles = new THREE.Points(geometry, material);
    flareGroup.add(flareData.particles);
    
    // Create magnetic field loops
    for (let loop = 0; loop < solarFlareData.magneticLoops; loop++) {
        const loopPoints = [];
        const loopRadius = solarFlareData.baseWidth + loop * 8;
        const loopHeight = flareData.height * (0.6 + loop * 0.1);
        
        // Create arch-shaped magnetic field line
        for (let j = 0; j <= 32; j++) {
            const t = j / 32;
            const archAngle = t * Math.PI;
            
            const x = (sunRadius + loopRadius * Math.sin(archAngle)) * Math.cos(flareData.angle);
            const y = loopHeight * Math.sin(archAngle);
            const z = (sunRadius + loopRadius * Math.sin(archAngle)) * Math.sin(flareData.angle);
            
            loopPoints.push(new THREE.Vector3(x, y, z));
        }
        
        const curve = new THREE.CatmullRomCurve3(loopPoints);
        const tubeGeometry = new THREE.TubeGeometry(curve, 32, 0.8, 6, false);
        
        const loopMaterial = new THREE.MeshBasicMaterial({
            color: solarFlareData.colors.magnetic,
            transparent: true,
            opacity: 0.3 * flareData.intensity,
            blending: THREE.AdditiveBlending
        });
        
        const magneticLoop = new THREE.Mesh(tubeGeometry, loopMaterial);
        flareData.magneticLoops.push(magneticLoop);
        flareGroup.add(magneticLoop);
    }
    
    // Create intense glow effect around flare base
    const glowGeometry = new THREE.SphereGeometry(sunRadius * 1.2, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: 0.2 * flareData.intensity,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });
    
    flareData.glowEffect = new THREE.Mesh(glowGeometry, glowMaterial);
    flareGroup.add(flareData.glowEffect);
    
    // Position the entire flare group
    flareGroup.userData = flareData;
    flareGroup.name = `solarFlare_${Date.now()}`;
    
    return flareGroup;
}

// Initialize solar flare system
function initializeSolarFlares() {
    solarFlares = [];
    
    // Create initial flares randomly
    const initialFlares = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < initialFlares; i++) {
        setTimeout(() => {
            triggerSolarFlare();
        }, Math.random() * 2000);
    }
}

// Trigger a new solar flare
function triggerSolarFlare() {
    if (solarFlares.length >= solarFlareData.maxFlares) return;
    
    const flare = createSolarFlare();
    solarFlares.push(flare);
    scene.add(flare);
    
    console.log(`Solar flare triggered! Class: ${flare.userData.intensity > 0.8 ? 'X' : flare.userData.intensity > 0.5 ? 'M' : 'C'}`);
}
