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
        
        // Zoom shortcuts
        case 'KeyZ':
            if (currentFocus) {
                zoomToLevel('close');
            }
            break;
        case 'KeyX':
            if (currentFocus) {
                zoomToLevel('optimal');
            }
            break;
        case 'KeyC':
            if (currentFocus) {
                zoomToLevel('far');
            }
            break;
        case 'KeyF':
            fixCameraStuck();
            break;
        case 'KeyD':
            debugManualMovement();
            break;
        case 'KeyR':
            disableAutoUpdate();
            console.log('Auto-update disabled for 10 seconds');
            break;
        case 'KeyE':
            enableAutoUpdate();
            console.log('Auto-update enabled');
            break;
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
    
    // Track manual camera movement NGAY LẬP TỨC
    if (currentFocus) {
        manualCameraMovement = true;
        lastManualPosition = camera.position.clone();
        
        // Reset manual movement flag after a delay
        setTimeout(() => {
            manualCameraMovement = false;
        }, 5000); // Tăng lên 5 giây để đảm bảo không bị reset sớm
    }

    mouseX = event.clientX;
    mouseY = event.clientY;
}

function onMouseUp() {
    mouseDown = false;
}

function onMouseWheel(event) {
    // Debounce mouse wheel để tránh zoom quá nhanh
    wheelDelta += event.deltaY;
    
    if (wheelTimeout) {
        clearTimeout(wheelTimeout);
    }
    
    wheelTimeout = setTimeout(() => {
        if (Math.abs(wheelDelta) < 10) return; // Bỏ qua scroll nhỏ
        
        // Ngăn chặn zoom quá nhanh
        if (isZooming) return;
        
        isZooming = true;
        
        // Clear timeout cũ nếu có
        if (zoomTimeout) {
            clearTimeout(zoomTimeout);
        }
        
        // Reset flag sau 150ms
        zoomTimeout = setTimeout(() => {
            isZooming = false;
            // Reset manual movement khi zoom xong
            manualCameraMovement = false;
        }, 150);
        
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
                const currentDistance = camera.position.distanceTo(target.position);
                const zoomFactor = wheelDelta > 0 ? 1.15 : 0.85;
                
                // Sử dụng function getOptimalZoomLevel để lấy zoom levels
                const zoomLevels = getOptimalZoomLevel(target, currentFocus);
                
                // Tính toán khoảng cách mới với smooth transition
                let newDistance = currentDistance * zoomFactor;
                
                // Áp dụng giới hạn từ zoom levels
                if (newDistance < zoomLevels.minDistance) {
                    newDistance = zoomLevels.minDistance;
                } else if (newDistance > zoomLevels.maxDistance) {
                    newDistance = zoomLevels.maxDistance;
                }
                
                // Nếu zoom quá gần, tự động điều chỉnh về khoảng cách tối ưu
                if (newDistance < zoomLevels.minDistance * 1.5) {
                    newDistance = zoomLevels.optimalDistance;
                }
                
                focusTargetDistance = newDistance;
                
                // Smooth transition đến vị trí mới với tốc độ chậm hơn
                const direction = camera.position.clone().sub(target.position).normalize();
                const targetPosition = target.position.clone().add(direction.multiplyScalar(newDistance));
                
                // Sử dụng lerp để tạo smooth transition với tốc độ chậm hơn
                camera.position.lerp(targetPosition, 0.05);
                
                syncZoomSlider();
            }
        } else {
            // Free camera zoom với logic cải thiện
            const currentDistance = camera.position.length();
            const zoomFactor = wheelDelta > 0 ? 1.2 : 0.8;
            
            // Tính toán khoảng cách mới
            let newDistance = currentDistance * zoomFactor;
            
            // Giới hạn zoom cho free camera
            const minFreeDistance = 500;
            const maxFreeDistance = 50000;
            
            if (newDistance < minFreeDistance) {
                newDistance = minFreeDistance;
            } else if (newDistance > maxFreeDistance) {
                newDistance = maxFreeDistance;
            }
            
            // Smooth transition cho free camera
            const direction = camera.position.clone().normalize();
            const targetPosition = direction.multiplyScalar(newDistance);
            camera.position.lerp(targetPosition, 0.1);
            
            syncZoomSlider();
        }
        
        // Reset wheel delta
        wheelDelta = 0;
    }, 50); // Debounce 50ms
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
    
    // Set flag để tránh xung đột
    isZooming = true;
    
    // Reset manual movement khi focus mới
    manualCameraMovement = false;
    
    currentFocus = planetName;
    
    // Handle different object types for display name
    let displayName = planetName;
    if (cometData[planetName]) {
        displayName = cometData[planetName].name;
    } else {
        displayName = planetName.charAt(0).toUpperCase() + planetName.slice(1);
    }
    
    document.getElementById('currentFocus').textContent = `Focus: ${displayName}`;
    
    // Tự động zoom đến mức tối ưu khi focus với delay
    setTimeout(() => {
        zoomToLevel('optimal');
        // Reset flag sau khi zoom xong
        setTimeout(() => {
            isZooming = false;
        }, 500);
    }, 200);
    
    updateFocusButtonStates(planetName);
    syncZoomSlider();
}

function resetCamera() {
    currentFocus = null;
    camera.position.set(1000, 25000, 10000); // Match the init position
    camera.lookAt(0, 0, 0);
    focusTargetDistance = null;
    // Reset manual movement
    manualCameraMovement = false;
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

function viewOortCloud() {
    currentFocus = null;
    // Position camera outside the Oort Cloud (100,000 AU)
    camera.position.set(20000000, 20000000, 20000000);
    camera.lookAt(0, 0, 0);
    focusTargetDistance = null;
    document.getElementById('currentFocus').textContent = 'Focus: Oort Cloud View (100,000 AU scale)';

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
// Flag để tránh xung đột giữa mouse wheel zoom và updateCameraFocus
let isZooming = false;
let zoomTimeout = null;
// Debounce cho mouse wheel
let wheelTimeout = null;
let wheelDelta = 0;
// Flag để track manual camera movement
let manualCameraMovement = false;
let lastManualPosition = null;

// Function để force disable auto-update
function disableAutoUpdate() {
    manualCameraMovement = true;
    setTimeout(() => {
        manualCameraMovement = false;
    }, 10000); // 10 giây để đảm bảo không bị reset
}

// Function để enable auto-update
function enableAutoUpdate() {
    manualCameraMovement = false;
}

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

// Function để tính toán zoom levels tối ưu cho từng loại thiên thể
function getOptimalZoomLevel(target, currentFocus) {
    let zoomLevels = {
        minDistance: 0,
        maxDistance: 0,
        optimalDistance: 0,
        closeDistance: 0,
        farDistance: 0
    };
    
    if (target === sun) {
        zoomLevels = {
            minDistance: 50, // Giảm từ 80 xuống 50
            maxDistance: 2000,
            optimalDistance: 200, // Giảm từ 300 xuống 200
            closeDistance: 100, // Giảm từ 150 xuống 100
            farDistance: 800
        };
    } else if (currentFocus === 'jupiter' || currentFocus === 'saturn') {
        zoomLevels = {
            minDistance: 25, // Giảm từ 40 xuống 25
            maxDistance: 800,
            optimalDistance: 80, // Giảm từ 120 xuống 80
            closeDistance: 40, // Giảm từ 60 xuống 40
            farDistance: 400
        };
    } else if (currentFocus === 'uranus' || currentFocus === 'neptune') {
        zoomLevels = {
            minDistance: 20, // Giảm từ 30 xuống 20
            maxDistance: 600,
            optimalDistance: 60, // Giảm từ 100 xuống 60
            closeDistance: 30, // Giảm từ 50 xuống 30
            farDistance: 300
        };
    } else if (planets[currentFocus]) {
        zoomLevels = {
            minDistance: 15, // Giảm từ 20 xuống 15
            maxDistance: 400,
            optimalDistance: 40, // Giảm từ 60 xuống 40
            closeDistance: 20, // Giảm từ 30 xuống 20
            farDistance: 200
        };
    } else if (dwarfPlanets[currentFocus]) {
        zoomLevels = {
            minDistance: 10, // Giảm từ 15 xuống 10
            maxDistance: 300,
            optimalDistance: 30, // Giảm từ 50 xuống 30
            closeDistance: 15, // Giảm từ 25 xuống 15
            farDistance: 150
        };
    } else if (comets[currentFocus]) {
        zoomLevels = {
            minDistance: 8, // Giảm từ 10 xuống 8
            maxDistance: 200,
            optimalDistance: 20, // Giảm từ 30 xuống 20
            closeDistance: 10, // Giảm từ 15 xuống 10
            farDistance: 100
        };
    }
    
    return zoomLevels;
}

// Function để zoom đến mức độ cụ thể
function zoomToLevel(level) {
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
        const zoomLevels = getOptimalZoomLevel(target, currentFocus);
        let targetDistance;
        
        switch (level) {
            case 'close':
                targetDistance = zoomLevels.closeDistance;
                break;
            case 'optimal':
                targetDistance = zoomLevels.optimalDistance;
                break;
            case 'far':
                targetDistance = zoomLevels.farDistance;
                break;
            default:
                targetDistance = zoomLevels.optimalDistance;
        }
        
        focusTargetDistance = targetDistance;
        
        // Smooth transition đến vị trí mới với tốc độ chậm hơn
        const direction = camera.position.clone().sub(target.position).normalize();
        const targetPosition = target.position.clone().add(direction.multiplyScalar(targetDistance));
        
        // Sử dụng lerp với tốc độ chậm hơn để tránh "nhảy"
        camera.position.lerp(targetPosition, 0.03);
        
        syncZoomSlider();
    }
}

// Function để kiểm tra và sửa lỗi camera bị stuck
function fixCameraStuck() {
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
        const zoomLevels = getOptimalZoomLevel(target, currentFocus);
        
        // Kiểm tra nếu camera quá gần hoặc quá xa
        if (currentDistance < zoomLevels.minDistance || currentDistance > zoomLevels.maxDistance) {
            // Reset về khoảng cách tối ưu
            focusTargetDistance = zoomLevels.optimalDistance;
            
            const direction = camera.position.clone().sub(target.position).normalize();
            const targetPosition = target.position.clone().add(direction.multiplyScalar(zoomLevels.optimalDistance));
            camera.position.copy(targetPosition);
            
            syncZoomSlider();
        }
    }
}

// Function để kiểm tra xem camera có đang ở vị trí tốt không
function isCameraInGoodPosition() {
    if (!currentFocus) return true;
    
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
    
    if (target && focusTargetDistance !== null) {
        const currentDistance = camera.position.distanceTo(target.position);
        const zoomLevels = getOptimalZoomLevel(target, currentFocus);
        
        // Camera được coi là ở vị trí tốt nếu:
        // 1. Khoảng cách hiện tại gần với focusTargetDistance
        // 2. Không quá gần hoặc quá xa
        const distanceDiff = Math.abs(currentDistance - focusTargetDistance);
        const tolerance = focusTargetDistance * 0.3; // 30% tolerance
        
        return distanceDiff < tolerance && 
               currentDistance >= zoomLevels.minDistance && 
               currentDistance <= zoomLevels.maxDistance;
    }
    
    return true;
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
            // Track manual movement khi sử dụng keyboard NGAY LẬP TỨC
            const isMoving = keys.w || keys.s || keys.a || keys.d || keys.space || keys.ctrl;
            if (isMoving) {
                manualCameraMovement = true;
                lastManualPosition = camera.position.clone();
                
                // Reset manual movement flag after a delay
                setTimeout(() => {
                    manualCameraMovement = false;
                }, 5000); // Tăng lên 5 giây để đảm bảo không bị reset sớm
            }
            
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

// Function để debug manual movement status
function debugManualMovement() {
    console.log('Manual Movement Status:', {
        manualCameraMovement: manualCameraMovement,
        mouseDown: mouseDown,
        isMoving: keys.w || keys.s || keys.a || keys.d || keys.space || keys.ctrl,
        currentFocus: currentFocus
    });
}
