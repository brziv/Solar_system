// Animation and Updates Module
// Handles all animation loops, planetary movement, and camera updates

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

    // Update comets
    updateComets();
}

// Update comets with elliptical orbits and dynamic tails
function updateComets() {
    if (isPaused) return;

    for (let cometName in comets) {
        const comet = comets[cometName];
        const userData = comet.userData;

        // Update orbital position using elliptical orbit formula
        userData.angle += userData.speed * timeSpeed;
        
        // Calculate elliptical orbit with high eccentricity
        const eccentricity = userData.eccentricity;
        const semiMajorAxis = userData.semiMajorAxis * DISTANCE_SCALE;
        
        // Distance from sun using ellipse equation
        const r = (semiMajorAxis * (1 - eccentricity * eccentricity)) / 
                  (1 + eccentricity * Math.cos(userData.angle));

        // Position in 3D space
        const x = r * Math.cos(userData.angle);
        const z = r * Math.sin(userData.angle);
        
        // Apply orbital inclination
        let y = 0;
        if (userData.inclination) {
            const inclinationRad = userData.inclination * Math.PI / 180;
            y = Math.sin(userData.angle) * Math.sin(inclinationRad) * r * 0.5;
        }

        comet.position.set(x, y, z);

        // Calculate distance to sun for tail effects
        const distanceToSun = Math.sqrt(x * x + y * y + z * z);
        const sunDistance = distanceToSun / DISTANCE_SCALE; // Convert back to AU

        // Calculate tail visibility and intensity based on distance to sun
        // Comets are most active when close to sun (< 5 AU typically)
        const maxTailDistance = 8; // AU - increased for more visible tails
        const tailIntensity = Math.max(0, Math.min(1, (maxTailDistance - sunDistance) / maxTailDistance));
        
        // Update tail opacity with smooth falloff
        const tailOpacity = Math.pow(tailIntensity, 0.5) * userData.tailOpacity;
        userData.tailMaterial.opacity = tailOpacity;
        userData.particleMaterial.opacity = tailOpacity * 0.9;
        userData.gasMaterial.opacity = tailOpacity * 0.7;

        // Calculate direction away from sun for tail pointing
        const sunDirection = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), comet.position).normalize();
        
        // Point tail away from sun
        const tailDirection = comet.position.clone().sub(sunDirection.multiplyScalar(100));
        userData.tail.lookAt(tailDirection);
        userData.particles.lookAt(tailDirection);
        userData.gasParticles.lookAt(tailDirection);

        // Scale tail length based on solar distance and comet activity
        const baseTailScale = 0.3 + tailIntensity * 1.7;
        const velocityScale = Math.min(2, Math.abs(userData.speed) * 200 + 0.5); // Faster comets have longer tails
        const finalTailScale = baseTailScale * velocityScale;
        
        userData.tail.scale.setScalar(finalTailScale);
        userData.particles.scale.setScalar(finalTailScale);
        userData.gasParticles.scale.setScalar(finalTailScale * 1.2); // Gas tail is longer

        // Animate dust particles with realistic physics
        const dustPositions = userData.particles.geometry.attributes.position.array;
        const dustVelocities = userData.particles.geometry.userData.velocities;
        const dustAges = userData.particles.geometry.userData.ages;
        const maxAge = userData.particles.geometry.userData.maxAge;
        const dustColors = userData.particles.geometry.attributes.color.array;
        
        for (let i = 0; i < dustPositions.length; i += 3) {
            const particleIndex = i / 3;
            
            // Age the particle
            dustAges[particleIndex] += timeSpeed;
            
            // Reset old particles near the nucleus
            if (dustAges[particleIndex] > maxAge) {
                dustPositions[i] = (Math.random() - 0.5) * 2;
                dustPositions[i + 1] = (Math.random() - 0.5) * 2;
                dustPositions[i + 2] = Math.random() * 5;
                
                dustVelocities[i] = (Math.random() - 0.5) * 0.2;
                dustVelocities[i + 1] = (Math.random() - 0.5) * 0.2;
                dustVelocities[i + 2] = -Math.random() * 0.5 - 0.1;
                
                dustAges[particleIndex] = 0;
            } else {
                // Apply solar wind pressure (radiation pressure)
                const solarPressure = tailIntensity * 0.05;
                dustVelocities[i + 2] -= solarPressure * timeSpeed;
                
                // Apply some random turbulence
                dustVelocities[i] += (Math.random() - 0.5) * 0.02 * timeSpeed;
                dustVelocities[i + 1] += (Math.random() - 0.5) * 0.02 * timeSpeed;
                
                // Move particles
                dustPositions[i] += dustVelocities[i] * timeSpeed;
                dustPositions[i + 1] += dustVelocities[i + 1] * timeSpeed;
                dustPositions[i + 2] += dustVelocities[i + 2] * timeSpeed;
                
                // Fade particles as they age and get farther away
                const age = dustAges[particleIndex] / maxAge;
                const distance = Math.abs(dustPositions[i + 2]);
                const fadeFactor = Math.max(0, 1 - age) * Math.max(0, 1 - distance / (userData.tailLength * 15));
                
                // Update particle color alpha based on fade
                const baseColor = new THREE.Color(userData.color);
                dustColors[i] = baseColor.r * fadeFactor;
                dustColors[i + 1] = baseColor.g * fadeFactor;
                dustColors[i + 2] = baseColor.b * fadeFactor;
            }
        }
        
        // Animate gas particles (faster, straighter)
        const gasPositions = userData.gasParticles.geometry.attributes.position.array;
        const gasVelocities = userData.gasParticles.geometry.userData.velocities;
        const gasColors = userData.gasParticles.geometry.attributes.color.array;
        
        for (let i = 0; i < gasPositions.length; i += 3) {
            // Apply stronger solar wind to gas
            const solarPressure = tailIntensity * 0.1;
            gasVelocities[i + 2] -= solarPressure * timeSpeed;
            
            // Move gas particles
            gasPositions[i] += gasVelocities[i] * timeSpeed;
            gasPositions[i + 1] += gasVelocities[i + 1] * timeSpeed;
            gasPositions[i + 2] += gasVelocities[i + 2] * timeSpeed;
            
            // Reset gas particles that drift too far
            if (gasPositions[i + 2] < -userData.tailLength * 20) {
                gasPositions[i] = (Math.random() - 0.5) * 1;
                gasPositions[i + 1] = (Math.random() - 0.5) * 1;
                gasPositions[i + 2] = Math.random() * 3;
                
                gasVelocities[i] = (Math.random() - 0.5) * 0.1;
                gasVelocities[i + 1] = (Math.random() - 0.5) * 0.1;
                gasVelocities[i + 2] = -Math.random() * 1.0 - 0.5;
            }
        }
        
        // Mark geometries for update
        userData.particles.geometry.attributes.position.needsUpdate = true;
        userData.particles.geometry.attributes.color.needsUpdate = true;
        userData.gasParticles.geometry.attributes.position.needsUpdate = true;

        // Rotate comet nucleus realistically using configured parameters
        if (userData.nucleus && userData.nucleus.rotation !== undefined) {
            userData.nucleus.rotation.y += userData.nucleus.rotation * timeSpeed;
            userData.nucleus.rotation.x += userData.nucleus.tumble * timeSpeed; // Tumbling motion
        } else {
            // Fallback to default rotation if not configured
            userData.nucleus.rotation.y += 0.02 * timeSpeed;
            userData.nucleus.rotation.x += 0.005 * timeSpeed;
        }
    }
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
        } else if (comets[currentFocus]) {
            target = comets[currentFocus];
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
        } else if (comets[currentFocus]) {
            target = comets[currentFocus];
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
                camera.position.lerp(cameraPos, 0.025);
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
