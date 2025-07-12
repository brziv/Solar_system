// UI and Preview Module
// Handles planet info display, preview sphere, and other UI elements

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
        geometry = new THREE.SphereGeometry(size, 16, 16);
        if (loadedTextures[objectName]) {
            material = new THREE.MeshLambertMaterial({ map: loadedTextures[objectName] });
        } else {
            material = new THREE.MeshLambertMaterial({ color: objectData.color });
        }
    } else if (comets[objectName]) {
        // Create comet nucleus for preview
        geometry = new THREE.SphereGeometry(size * 3, 8, 8); // Slightly larger for visibility
        material = new THREE.MeshLambertMaterial({ 
            color: objectData.color,
            emissive: objectData.color,
            emissiveIntensity: 0.3
        });
        
        // Add a simple tail effect for preview
        const tailGeometry = new THREE.ConeGeometry(size * 0.5, size * 8, 6);
        const tailMaterial = new THREE.MeshBasicMaterial({
            color: objectData.color,
            transparent: true,
            opacity: 0.4
        });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.rotation.x = Math.PI / 2;
        tail.position.z = -size * 4;
        
        previewSphere = new THREE.Group();
        const nucleus = new THREE.Mesh(geometry, material);
        previewSphere.add(nucleus);
        previewSphere.add(tail);
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
    } else if (comets[objectName]) {
        objectData = cometData[objectName];
        const eccentricityDesc = objectData.eccentricity > 0.9 ? 'Extremely elliptical' : 
                                objectData.eccentricity > 0.7 ? 'Highly elliptical' : 'Moderately elliptical';
        
        // Calculate current distance for display
        const currentDistance = Math.sqrt(
            object.position.x * object.position.x + 
            object.position.y * object.position.y + 
            object.position.z * object.position.z
        ) / DISTANCE_SCALE;
        
        info = `
            <h3>${objectData.name}</h3>
            <div id="preview-placeholder"></div>
            <p><strong>Type:</strong> Comet</p>
            <p><strong>Current Distance:</strong> ${currentDistance.toFixed(1)} AU</p>
            <p><strong>Perihelion:</strong> ${objectData.perihelion} AU (closest)</p>
            <p><strong>Aphelion:</strong> ${objectData.aphelion} AU (farthest)</p>
            <p><strong>Orbital Period:</strong> ${objectData.period} years</p>
            <p><strong>Inclination:</strong> ${objectData.inclination}° ${objectData.inclination > 90 ? '(Retrograde)' : ''}</p>
            <p><strong>Eccentricity:</strong> ${objectData.eccentricity} (${eccentricityDesc})</p>
            <p><strong>Tail Activity:</strong> ${currentDistance < 3 ? 'Very Active' : currentDistance < 5 ? 'Active' : 'Minimal'}</p>
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
