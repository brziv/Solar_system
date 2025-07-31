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

// Update camera focus
function updateCameraFocus() {
    // Không update camera focus khi đang zoom
    if (isZooming) return;
    
    // HOÀN TOÀN TẮT AUTO-UPDATE KHI CÓ MANUAL MOVEMENT
    if (manualCameraMovement) return;
    
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
            
            // Tính toán khoảng cách mặc định dựa trên loại thiên thể
            let defaultDistance;
            if (target === sun) {
                defaultDistance = 200;
            } else if (currentFocus === 'jupiter' || currentFocus === 'saturn') {
                defaultDistance = 80;
            } else if (currentFocus === 'uranus' || currentFocus === 'neptune') {
                defaultDistance = 60;
            } else if (planets[currentFocus]) {
                defaultDistance = 40;
            } else if (dwarfPlanets[currentFocus]) {
                defaultDistance = 30;
            } else if (comets[currentFocus]) {
                defaultDistance = 20;
            }
            
            if (focusTargetDistance === null) {
                focusTargetDistance = defaultDistance;
            }
            
            // Chỉ update camera khi:
            // 1. Không đang di chuyển bằng keyboard
            // 2. Không đang kéo chuột
            // 3. Không có manual movement (đã check ở đầu function)
            if (!isMoving && !mouseDown) {
                const currentDistance = camera.position.distanceTo(target.position);
                
                // Chỉ update nếu camera đang ở xa hơn khoảng cách mục tiêu
                // Điều này ngăn camera bị kéo ra xa khi người dùng đã zoom gần
                if (currentDistance > focusTargetDistance * 1.2) {
                    // Tính toán hướng camera tối ưu
                    let direction;
                    if (camera.position.equals(target.position)) {
                        direction = new THREE.Vector3(1, 0.3, 1).normalize();
                    } else {
                        direction = camera.position.clone().sub(target.position).normalize();
                    }
                    
                    // Tính toán vị trí camera mục tiêu
                    const targetCameraPos = target.position.clone().add(direction.multiplyScalar(focusTargetDistance));
                    
                    // Tính toán lerp factor dựa trên khoảng cách hiện tại
                    let lerpFactor;
                    
                    if (currentDistance > 10000) {
                        lerpFactor = 0.003;
                    } else if (currentDistance > 1000) {
                        lerpFactor = 0.008;
                    } else if (currentDistance > 100) {
                        lerpFactor = 0.02;
                    } else {
                        lerpFactor = 0.05;
                    }
                    
                    // Áp dụng smooth transition
                    camera.position.lerp(targetCameraPos, lerpFactor);
                    
                    // Smooth rotation để camera luôn nhìn vào target
                    const lookAtTarget = target.position.clone();
                    camera.lookAt(lookAtTarget);
                }
            }
            
            updatePlanetInfoDisplay(currentFocus, target);
            syncZoomSlider();
        }
    } else {
        focusTargetDistance = null;
        syncZoomSlider();
    }
}

// Function để kiểm tra camera health
function checkCameraHealth() {
    if (!currentFocus) return;
    
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
        const currentDistance = camera.position.distanceTo(target.position);
        
        // Kiểm tra nếu camera quá xa hoặc quá gần
        if (currentDistance > 100000 || currentDistance < 1) {
            // Auto fix camera
            const zoomLevels = getOptimalZoomLevel(target, currentFocus);
            focusTargetDistance = zoomLevels.optimalDistance;
            
            const direction = camera.position.clone().sub(target.position).normalize();
            const targetPosition = target.position.clone().add(direction.multiplyScalar(zoomLevels.optimalDistance));
            camera.position.copy(targetPosition);
            
            syncZoomSlider();
        }
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    handleCameraMovement();
    updatePlanets();
    updateCameraFocus();
    updateHeliosphericGlow();
    
    // Kiểm tra camera health
    checkCameraHealth();
    
    // Animate preview sphere
    animatePreviewSphere();

    renderer.render(scene, camera);
}
