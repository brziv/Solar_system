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
                // Dust tail: broader, curved sweep following radiation pressure
                const positions = userData.dustParticles.geometry.attributes.position.array;
                const particleCount = positions.length / 3;
                
                for (let i = 0; i < particleCount; i++) {
                    const distance = Math.random() * userData.tailLength * 25; // Longer than ion tail
                    const curveFactor = distance * 0.001; // Slight curve due to orbital motion
                    
                    // Base direction away from sun
                    const baseDirection = awayFromSun.clone().multiplyScalar(distance);
                    
                    // Add orbital motion curve (perpendicular to radial direction)
                    const orbitalTangent = new THREE.Vector3(-awayFromSun.z, 0, awayFromSun.x).normalize();
                    const curveOffset = orbitalTangent.multiplyScalar(curveFactor * distance);
                    
                    // Much broader spread than ion tail
                    const spread = distance * 0.15; // Almost double the spread
                    const sideways = new THREE.Vector3(
                        (Math.random() - 0.5) * spread,
                        (Math.random() - 0.5) * spread,
                        (Math.random() - 0.5) * spread * 0.5
                    );
                    
                    const finalPosition = baseDirection.add(curveOffset).add(sideways);
                    
                    positions[i * 3] = finalPosition.x;
                    positions[i * 3 + 1] = finalPosition.y;
                    positions[i * 3 + 2] = finalPosition.z;
                }
                
                userData.dustParticles.geometry.attributes.position.needsUpdate = true;
                userData.dustParticleMaterial.opacity = activity * 0.7; // More visible than before
            }
        } else {
            // Hide tails when comet is far from sun
            if (userData.plasmaTail) userData.plasmaMaterial.opacity = 0;
            if (userData.plasmaParticles) userData.plasmaParticleMaterial.opacity = 0;
            if (userData.dustParticles) userData.dustParticleMaterial.opacity = 0;
        }
    }
}

// Update heliospheric boundary glow animation
function updateHeliosphericGlow() {
    if (!heliosphericGlow) return;

    const time = Date.now() * heliosphericGlowData.animationSpeed;
    
    // Animate ENA ribbon pulsing
    const pulse = Math.sin(time * heliosphericGlowData.pulseFrequency) * 0.3 + 0.7;
    heliosphericGlow.material.opacity = heliosphericGlowData.opacity * pulse;
    
    // Rotate the glow slightly to simulate solar wind interaction
    heliosphericGlow.rotation.y += 0.0001 * timeSpeed;
    heliosphericGlow.rotation.z += 0.00005 * timeSpeed;
    
    // Animate particle colors for charge exchange effects
    const colors = heliosphericGlow.geometry.attributes.color.array;
    const particleCount = colors.length / 3;
    
    for (let i = 0; i < particleCount; i += 100) { // Update every 100th particle for performance
        const offset = time + i * 0.01;
        const brightness = Math.sin(offset) * 0.3 + 0.7;
        
        colors[i * 3] *= brightness;
        colors[i * 3 + 1] *= brightness;
        colors[i * 3 + 2] *= brightness;
    }
    
    heliosphericGlow.geometry.attributes.color.needsUpdate = true;
}

// Update solar storm particles
function updateSolarStorm() {
    if (!solarStorm) return;

    const positions = solarStorm.geometry.attributes.position.array;
    const velocities = solarStorm.geometry.userData.velocities;
    const particleCount = positions.length / 3;
    
    // Storm intensity varies over time
    const time = Date.now() * solarStormData.stormFrequency;
    const stormPulse = Math.sin(time) * 0.5 + 1.5; // 1.0 to 2.0 intensity
    const currentIntensity = solarStormData.stormIntensity * stormPulse;

    for (let i = 0; i < particleCount; i++) {
        // Update particle positions
        positions[i * 3] += velocities[i * 3] * timeSpeed * currentIntensity;
        positions[i * 3 + 1] += velocities[i * 3 + 1] * timeSpeed * currentIntensity;
        positions[i * 3 + 2] += velocities[i * 3 + 2] * timeSpeed * currentIntensity;

        // Calculate distance from sun
        const distance = Math.sqrt(
            positions[i * 3] * positions[i * 3] +
            positions[i * 3 + 1] * positions[i * 3 + 1] +
            positions[i * 3 + 2] * positions[i * 3 + 2]
        );

        // Reset particle if it goes too far
        if (distance > solarStormData.maxDistance) {
            // Reset to sun surface
            const startRadius = sunData.size * 8 + 5;
            const phi = Math.random() * Math.PI * 2;
            const cosTheta = Math.random() * 2 - 1;
            const theta = Math.acos(cosTheta);

            positions[i * 3] = startRadius * Math.sin(theta) * Math.cos(phi);
            positions[i * 3 + 1] = startRadius * Math.sin(theta) * Math.sin(phi);
            positions[i * 3 + 2] = startRadius * Math.cos(theta);

            // Reset velocity
            const speed = solarStormData.baseSpeed + Math.random() * solarStormData.speedVariation;
            velocities[i * 3] = (positions[i * 3] / startRadius) * speed;
            velocities[i * 3 + 1] = (positions[i * 3 + 1] / startRadius) * speed;
            velocities[i * 3 + 2] = (positions[i * 3 + 2] / startRadius) * speed;
        }
    }

    solarStorm.geometry.attributes.position.needsUpdate = true;
    
    // Vary storm opacity based on intensity
    solarStorm.material.opacity = solarStormData.opacity * (0.5 + currentIntensity * 0.5);
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
                
                // Calculate distance-based lerp factor to reflect true scale
                const currentDistance = camera.position.length();
                let lerpFactor;
                
                if (currentDistance > 30000) {
                    // Kuiper Belt scale - slow transition
                    lerpFactor = 0.005;
                } else {
                    // Inner solar system - normal speed
                    lerpFactor = 0.02;
                }
                
                camera.position.lerp(cameraPos, lerpFactor);
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
    updateHeliosphericGlow();
    updateSolarStorm();
    updateSolarFlares();
    
    // Animate preview sphere
    animatePreviewSphere();

    renderer.render(scene, camera);
}

// Update solar flares animation
function updateSolarFlares() {
    if (!solarFlares || solarFlares.length === 0) return;
    
    const currentTime = Date.now();
    
    // Update existing flares and remove expired ones
    for (let i = solarFlares.length - 1; i >= 0; i--) {
        const flare = solarFlares[i];
        const flareData = flare.userData;
        const age = currentTime - flareData.createdAt;
        const lifeProgress = age / flareData.lifetime;
        
        if (lifeProgress >= 1.0) {
            // Remove expired flare
            scene.remove(flare);
            solarFlares.splice(i, 1);
            continue;
        }
        
        // Animate flare particles
        if (flareData.particles) {
            const positions = flareData.particles.geometry.attributes.position.array;
            const velocities = flareData.particles.geometry.userData.velocities;
            const colors = flareData.particles.geometry.attributes.color.array;
            const particleCount = positions.length / 3;
            
            for (let j = 0; j < particleCount; j++) {
                // Update particle positions with gravity and magnetic field effects
                const x = positions[j * 3];
                const y = positions[j * 3 + 1];
                const z = positions[j * 3 + 2];
                
                // Calculate distance from sun center
                const distanceFromSun = Math.sqrt(x * x + y * y + z * z);
                const sunRadius = sunData.size * 8;
                
                // Apply magnetic field constraints (particles follow field lines)
                const magneticForce = Math.exp(-distanceFromSun / (sunRadius * 3));
                const gravityForce = (sunRadius * sunRadius) / (distanceFromSun * distanceFromSun) * 0.1;
                
                // Update velocities with physics
                velocities[j * 3] *= (1.0 - gravityForce * timeSpeed);
                velocities[j * 3 + 1] -= gravityForce * timeSpeed * 2; // Gravity pulls down
                velocities[j * 3 + 2] *= (1.0 - gravityForce * timeSpeed);
                
                // Update positions
                positions[j * 3] += velocities[j * 3] * timeSpeed;
                positions[j * 3 + 1] += velocities[j * 3 + 1] * timeSpeed;
                positions[j * 3 + 2] += velocities[j * 3 + 2] * timeSpeed;
                
                // Fade particles over time
                const fadeProgress = Math.min(lifeProgress * 2, 1.0);
                const fadeFactor = 1.0 - fadeProgress;
                
                colors[j * 3] *= (0.99 + fadeFactor * 0.01);
                colors[j * 3 + 1] *= (0.99 + fadeFactor * 0.01);
                colors[j * 3 + 2] *= (0.99 + fadeFactor * 0.01);
            }
            
            flareData.particles.geometry.attributes.position.needsUpdate = true;
            flareData.particles.geometry.attributes.color.needsUpdate = true;
            
            // Fade overall opacity
            const fadeOpacity = 1.0 - Math.pow(lifeProgress, 2);
            flareData.particles.material.opacity = 0.8 * fadeOpacity;
        }
        
        // Animate magnetic field loops
        flareData.magneticLoops.forEach((loop, loopIndex) => {
            const pulseFactor = Math.sin(currentTime * 0.005 + loopIndex) * 0.3 + 0.7;
            const fadeOpacity = 1.0 - Math.pow(lifeProgress, 1.5);
            loop.material.opacity = 0.3 * flareData.intensity * pulseFactor * fadeOpacity;
        });
        
        // Animate glow effect
        if (flareData.glowEffect) {
            const glowPulse = Math.sin(currentTime * 0.008) * 0.5 + 1.0;
            const glowFade = 1.0 - Math.pow(lifeProgress, 1.2);
            flareData.glowEffect.material.opacity = 0.2 * flareData.intensity * glowPulse * glowFade;
            
            // Scale glow slightly
            const glowScale = 1.0 + Math.sin(currentTime * 0.003) * 0.1;
            flareData.glowEffect.scale.setScalar(glowScale);
        }
    }
    
    // Randomly trigger new flares
    if (Math.random() < solarFlareData.frequency && solarFlares.length < solarFlareData.maxFlares) {
        triggerSolarFlare();
    }
}
