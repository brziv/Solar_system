// Main Solar System Application
// Global variables and initialization

// Global variables
let scene, camera, renderer;
let sun, planets = {}, moons = {}, dwarfPlanets = {};
let orbits = [], dwarfOrbits = [];
let asteroidBelt, kuiperBelt;
let timeSpeed = 1;
let movementSpeed = 10;
let currentFocus = null;
let solarSystemGroup;
let loadedTextures = {};
let loadingManager;
let isPaused = false;

// Preview sphere variables
let previewScene, previewCamera, previewRenderer;
let previewSphere = null;
let previewContainer = null;

// Camera movement variables
let keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    ctrl: false,
    shift: false
};

// Mouse controls
let mouseDown = false;
let mouseX = 0;
let mouseY = 0;

// Focus target distance
let focusTargetDistance = null;

// Initialize the solar system
function init() {
    // Create scene
    scene = new THREE.Scene();

    // Create camera with position that matches default zoom slider value (1000)
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500000);
    // Position camera at distance 1000 from origin (matching default slider value)
    camera.position.set(0, 500, 1000); // Simple position at distance 1000
    camera.lookAt(0, 0, 0);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000011);
    document.getElementById('container').appendChild(renderer.domElement);

    // Create solar system group
    solarSystemGroup = new THREE.Group();
    scene.add(solarSystemGroup);

    // Set up loading manager
    loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (url, loaded, total) => {
        const progress = (loaded / total) * 100;
        document.getElementById('loading').textContent = `Loading textures... ${Math.round(progress)}%`;
    };
    loadingManager.onLoad = () => {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('controls').style.display = 'block';
        document.getElementById('info').style.display = 'block';

        createSolarSystem();
        createPreviewSphere(); // Initialize preview sphere system
        animate();
    };

    // Load textures
    loadTextures();

    // Set up event listeners
    setupEventListeners();
    
    // Initialize zoom slider after DOM is ready
    setTimeout(() => {
        syncZoomSlider();
    }, 100);
}

// Initialize when page loads
window.addEventListener('load', init);
