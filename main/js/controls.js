// Controls and UI Module
// Handles all user interface controls, event listeners, and UI updates

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
    camera.position.set(1000, 25000, 10000); // Match the init position
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
