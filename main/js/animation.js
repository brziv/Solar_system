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
