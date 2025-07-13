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

// Update comets with stunning visual effects (based on ESA reference image)
function updateComets() {
    if (isPaused) return;

    for (let cometName in comets) {
        const comet = comets[cometName];
        const userData = comet.userData;

        // Update orbital position using elliptical orbit
        userData.angle += userData.speed * timeSpeed;
        
        // Calculate elliptical orbit
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

        // Calculate distance to sun for activity levels
        const distanceToSun = Math.sqrt(x * x + y * y + z * z);
        const sunDistanceAU = distanceToSun / DISTANCE_SCALE;

        // NUCLEUS - Small, dark, slowly rotating
        if (userData.nucleus) {
            userData.nucleus.rotation.y += 0.01 * timeSpeed;
            userData.nucleus.rotation.x += 0.005 * timeSpeed;
        }

        // Calculate solar activity (stronger when closer to sun)
        const maxActivityDistance = 10; // AU - effects visible up to this distance
        const activity = Math.max(0, Math.min(1, (maxActivityDistance - sunDistanceAU) / maxActivityDistance));
        
        // Simple direction away from sun (for tails)
        const sunDirection = new THREE.Vector3(0, 0, 0);
        const awayFromSun = new THREE.Vector3().subVectors(comet.position, sunDirection).normalize();

        // 1. COMA - Bright spherical cloud around nucleus (appears at ~3-5 AU)
        if (userData.coma && activity > 0.3) {
            const comaSize = 2 + activity * 8; // Large, dramatic size
            userData.coma.scale.setScalar(comaSize);
            
            // Bright, pulsing glow
            const pulse = Math.sin(Date.now() * 0.001) * 0.2 + 1;
            userData.comaMaterial.opacity = activity * 0.6 * pulse;
            userData.comaGlowMaterial.opacity = activity * 0.3 * pulse;
            
            // Blue-white color
            userData.comaMaterial.color.setHex(0xCCEEFF);
            userData.comaGlowMaterial.color.setHex(0x88CCFF);
        } else if (userData.coma) {
            userData.comaMaterial.opacity = 0;
            userData.comaGlowMaterial.opacity = 0;
        }

        // Only show tails when comet is active
        if (activity > 0.1) {
            // 3. PLASMA TAIL (ION TAIL) - Straight, blue, points directly away from sun
            if (userData.plasmaTail) {
                const plasmaLength = activity * 20; // Very long
                userData.plasmaTail.scale.set(0.3, plasmaLength, 0.3); // Scale Y for length
                
                // Position the tail at the nucleus and orient it away from sun
                userData.plasmaTail.position.copy(comet.position);
                
                // Create rotation to point away from sun
                const tailDirection = awayFromSun.clone();
                
                // The cylinder geometry points along Y axis, so we need to align it with the tail direction
                const quaternion = new THREE.Quaternion();
                quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tailDirection);
                userData.plasmaTail.setRotationFromQuaternion(quaternion);
                
                // Move the tail so it starts from the nucleus and extends outward
                userData.plasmaTail.position.add(tailDirection.clone().multiplyScalar(plasmaLength * 0.5));
                
                // Bright blue with flickering
                const flicker = Math.sin(Date.now() * 0.005) * 0.3 + 1;
                userData.plasmaMaterial.opacity = activity * 0.6 * flicker;
                userData.plasmaMaterial.color.setHex(0x4499FF); // Bright blue
            }

            // Animate particles for plasma tail
            if (userData.plasmaParticles) {
                // Update particle positions to follow the tail direction
                const positions = userData.plasmaParticles.geometry.attributes.position.array;
                const particleCount = positions.length / 3;
                
                for (let i = 0; i < particleCount; i++) {
                    const distance = Math.random() * userData.tailLength * 20;
                    const spread = distance * 0.02; // Very narrow
                    
                    // Create particle position relative to comet, pointing away from sun
                    const particleDirection = awayFromSun.clone().multiplyScalar(distance);
                    const sideways = new THREE.Vector3(
                        (Math.random() - 0.5) * spread,
                        (Math.random() - 0.5) * spread,
                        0
                    );
                    
                    const finalPosition = particleDirection.add(sideways);
                    
                    positions[i * 3] = finalPosition.x;
                    positions[i * 3 + 1] = finalPosition.y;
                    positions[i * 3 + 2] = finalPosition.z;
                }
                
                userData.plasmaParticles.geometry.attributes.position.needsUpdate = true;
                userData.plasmaParticleMaterial.opacity = activity * 0.6;
            }
            
            if (userData.dustParticles) {
                // Update dust particle positions similarly
                const positions = userData.dustParticles.geometry.attributes.position.array;
                const particleCount = positions.length / 3;
                
                for (let i = 0; i < particleCount; i++) {
                    const distance = Math.random() * userData.tailLength * 15;
                    const spread = distance * 0.08; // Broader spread
                    
                    // Create particle position relative to comet, pointing away from sun
                    const particleDirection = awayFromSun.clone().multiplyScalar(distance);
                    const sideways = new THREE.Vector3(
                        (Math.random() - 0.5) * spread,
                        (Math.random() - 0.5) * spread,
                        0
                    );
                    
                    const finalPosition = particleDirection.add(sideways);
                    
                    positions[i * 3] = finalPosition.x;
                    positions[i * 3 + 1] = finalPosition.y;
                    positions[i * 3 + 2] = finalPosition.z;
                }
                
                userData.dustParticles.geometry.attributes.position.needsUpdate = true;
                userData.dustParticleMaterial.opacity = activity * 0.5;
            }
        } else {
            // Hide tails when comet is far from sun
            if (userData.plasmaTail) userData.plasmaMaterial.opacity = 0;
            if (userData.plasmaParticles) userData.plasmaParticleMaterial.opacity = 0;
            if (userData.dustParticles) userData.dustParticleMaterial.opacity = 0;
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
