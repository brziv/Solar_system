# 3D Solar System Simulation

A realistic and interactive 3D solar system simulation built with Three.js, featuring accurate orbital mechanics, realistic proportions, and immersive navigation controls.

![Solar System Simulation](https://img.shields.io/badge/WebGL-Three.js-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)

## 🌟 Features

### **Realistic Astronomical Models**
- **Accurate planetary proportions** relative to Earth
- **Realistic orbital distances** and inclinations
- **Elliptical orbits** for dwarf planets with proper eccentricity
- **Orbital inclinations** showing true 3D orbital planes
- **Asteroid and Kuiper belts** with thousands of objects
- **Comets with advanced physics** and realistic tail behavior
- **Visible orbital paths** for all celestial bodies including highly eccentric comet orbits

### **Interactive Navigation**
- **Free-roam camera** with WASD movement controls
- **Object focus mode** with automatic tracking
- **Manual movement while focusing** - orbit around selected objects
- **Mouse controls** for rotation and zoom
- **Adjustable movement speed** with Shift boost

### **Visual Enhancements**
- **High-resolution textures** (2K-8K) for all celestial bodies
- **Animated 3D preview spheres** in info panels
- **Dynamic lighting** reaching all outer planets
- **Saturn's rings** with proper textures
- **Earth's cloud layer** with separate rotation
- **Starfield background** with 25,000+ stars
- **Realistic comet simulation** with dual tail systems (dust and gas)
- **Particle physics** modeling solar wind effects on comet tails
- **Orbital trail visualization** showing complete elliptical paths
- **Oort Cloud visualization** with 2M particles representing the solar system boundary

### **Educational Information**
- **Detailed object information** panels
- **Real astronomical data** (distances, sizes, orbital characteristics)
- **Orbital eccentricity descriptions** (circular, elliptical, highly elliptical)
- **Inclination data** with visual representation
- **Real-time 3D previews** showing planet textures and rotation

## 🚀 Getting Started

### **Prerequisites**
- Modern web browser with WebGL support
- Local web server (for texture loading)

### **Installation**
1. Clone or download the project
2. Set up a local web server (required for texture loading)
   - **Python**: `python -m http.server 8000`
   - **Node.js**: `npx http-server`
   - **VS Code**: Live Server extension
3. Navigate to `main/index.html` in your browser
4. Allow textures to load (may take a few moments)

### **Required Textures**
All texture files are included in the `main/textures/` directory:
```
main/textures/
├── 8k_sun.jpg
├── 8k_mercury.jpg
├── 4k_venus_atmosphere.jpg
├── 8k_venus_surface.jpg
├── 8k_earth_daymap.jpg
├── 8k_earth_nightmap.jpg
├── 8k_earth_clouds.jpg
├── 8k_mars.jpg
├── 8k_jupiter.jpg
├── 8k_saturn.jpg
├── 8k_saturn_ring.png
├── 8k_moon.jpg
├── 2k_uranus.jpg
├── 2k_neptune.jpg
├── 2k_pluto.jpg
├── 4k_ceres.jpg
├── 4k_eris.jpg
├── 4k_haumea.jpg
├── 4k_makemake.jpg
├── gonggong.jpg
├── orcus.jpg
├── quaoar.jpg
└── sedna.jpg
```

## 🎮 Controls

### **Navigation**
| Key | Action |
|-----|--------|
| `W` | Move forward |
| `S` | Move backward |
| `A` | Move left |
| `D` | Move right |
| `Space` | Move up |
| `Ctrl` | Move down |
| `Shift` | Speed boost (2x) |

### **Mouse Controls**
- **Drag** to rotate camera around center
- **Scroll** to zoom in/out
- **Limits**: Zoom range 300-20,000 units

### **Focus Mode**
- Click any planet button to focus on that object
- Camera automatically tracks the selected object
- Use WASD to manually orbit around focused object
- Auto-follow resumes when movement keys are released

## 🎛️ Interface Controls

### **Time Controls**
- **Time Speed Slider**: Adjust orbital motion speed (0-30x)
- **Pause Button**: Freeze all orbital motion
- **Real-time Updates**: Smooth interpolation for all speeds

### **Movement Controls**
- **Movement Speed Slider**: Adjust camera travel speed (1-10000)
- **Shift Modifier**: Hold for 2x speed boost
- **Adaptive Scaling**: Automatically adjusts for system scale

### **Focus Targets**
- **Sun**: Central star with enhanced lighting effects
- **Inner Planets**: Mercury, Venus, Earth, Mars
- **Outer Planets**: Jupiter, Saturn, Uranus, Neptune
- **Dwarf Planets**: Ceres, Pluto, Eris, Haumea, Makemake, Sedna, Quaoar, Orcus, Gonggong
- **Comets**: Halley, Hale-Bopp, Hyakutake, McNaught, NEOWISE, Bernardinelli–Bernstein

## 🔬 Scientific Accuracy

### **Scale Compromises**
- **Sun Size**: Compressed to 2x Jupiter radius (real: 109x Earth)
- **Planet Sizes**: Realistic relative proportions maintained
- **Distances**: Scaled proportionally for visibility
- **Orbital Speeds**: Reduced for observable motion

### **Astronomical Data**
| Object | Real Size (Earth=1) | Distance (AU) | Orbital Inclination | Eccentricity |
|--------|-------------------|---------------|-------------------|--------------|
| Mercury | 0.38 | 0.39 | 7.0° | ~0 |
| Venus | 0.95 | 0.72 | 3.4° | ~0 |
| Earth | 1.00 | 1.00 | 0.0° | ~0 |
| Mars | 0.53 | 1.52 | 1.9° | ~0 |
| Jupiter | 11.0 | 5.20 | 1.3° | ~0 |
| Saturn | 9.0 | 9.58 | 2.5° | ~0 |
| Uranus | 4.0 | 19.22 | 0.8° | ~0 |
| Neptune | 3.9 | 30.05 | 1.8° | ~0 |
| Ceres | 0.07 | 2.8 | 10.6° | 0.076 |
| Pluto | 0.18 | 39.5 | 17.2° | 0.244 |
| Eris | 0.19 | 67.7 | 44.2° | 0.436 |
| Haumea | 0.15 | 43.3 | 28.2° | 0.189 |
| Makemake | 0.11 | 45.8 | 29.0° | 0.159 |
| Sedna | 0.08 | 76.0 | 11.9° | 0.855 |
| Quaoar | 0.09 | 43.7 | 8.0° | 0.037 |
| Orcus | 0.07 | 39.4 | 20.6° | 0.226 |
| Gonggong | 0.10 | 67.3 | 30.8° | 0.500 |

### **Comet Features** ✨
| Comet | Perihelion (AU) | Aphelion (AU) | Eccentricity | Period (years) | Special Features |
|-------|----------------|---------------|--------------|----------------|------------------|
| Halley | 0.59 | 35.1 | 0.967 | 76 | Retrograde orbit (162.3°) |
| Hale-Bopp | 0.91 | 370 | 0.995 | 2533 | Extremely long period |
| Hyakutake | 0.23 | 3410 | 0.9998 | 72000 | Nearly parabolic orbit |
| McNaught | 0.17 | 3200 | 0.9999 | 92600 | Brightest comet in decades |
| NEOWISE | 0.29 | 715 | 0.9992 | 6800 | Discovered by WISE telescope |
| Bernardinelli–Bernstein | 10.9 | 40000 | 0.999 | 4000000 | Largest known comet nucleus |

**Advanced Comet Physics:**
- **Dual Tail System**: Separate dust and gas tails with different behaviors
- **Solar Wind Effects**: Particles accelerate away from Sun with realistic physics
- **Distance-Based Activity**: Tail brightness and length respond to solar proximity
- **Particle Lifecycle**: Individual particle aging and regeneration
- **Nucleus Rotation**: Realistic tumbling motion for comet cores
- **Elliptical Orbit Visualization**: Complete orbital paths with high eccentricity

### **Oort Cloud** 🌌
- **Spherical Shell**: 2,000,000 particles representing distant comet nuclei
- **Realistic Scale**: Inner radius ~2,000 AU, outer radius ~100,000 AU
- **Composition Colors**: Four types based on real observations
  - **Icy comets** (blue-white) - Fresh water ice
  - **Dirty ice** (brownish) - Mixed ice and dust
  - **Carbonaceous** (dark brown) - Carbon-rich composition
  - **Methane-rich** (yellowish) - Organic compounds
- **Scientific Accuracy**: Source region for long-period comets

### **Orbital Mechanics**
- **Elliptical Orbits**: Proper eccentricity calculations for dwarf planets
- **Inclination Effects**: 3D orbital planes with realistic tilts
- **Kepler's Laws**: Orbital speeds vary with distance
- **Orbital Periods**: Proportionally accurate relative timing

## 🛠️ Technical Details

### **Built With**
- **Three.js r150+**: 3D graphics library
- **WebGL**: Hardware-accelerated rendering
- **JavaScript ES6**: Modern web standards
- **HTML5/CSS3**: Responsive interface design
- **Modular Architecture**: Organized code structure

### **Code Architecture**
```
main/js/
├── main.js         # Application initialization and core loop
├── scene.js        # 3D scene setup and object creation
├── animation.js    # Orbital mechanics and movement
├── controls.js     # Input handling and camera controls
├── ui.js          # User interface and information panels
└── config.js      # Astronomical data and configuration
```

### **Performance Features**
- **LOD System**: Adaptive detail based on distance
- **Frustum Culling**: Automatic object culling
- **Texture Optimization**: Efficient memory usage
- **Point Cloud Rendering**: Optimized asteroid/Kuiper/Oort belt rendering
- **Particle Systems**: Efficient comet tail physics with lifecycle management

### **Rendering Pipeline**
- **Sphere Geometry**: Planets and celestial bodies (16-64 segments)
- **Line Geometry**: Orbital paths with transparency
- **Point Cloud**: Asteroid and Kuiper belt objects
- **Instanced Rendering**: Efficient belt object rendering
- **Texture Mapping**: High-resolution planetary surfaces
- **Dynamic Lighting**: Point light from Sun with ambient fill

### **Camera System**
- **Perspective Camera**: 75° FOV for realistic depth
- **Dynamic Range**: 0.1 to 500,000 units
- **Smooth Controls**: Interpolated movement with lerp
- **Focus Tracking**: Automatic object following with manual override
- **Zoom Limits**: Configurable min/max distances

## 📁 Project Structure

```
Solar_system/
├── main/
│   ├── index.html             # Main application entry point
│   ├── style.css             # Interface styling and layout
│   ├── js/
│   │   ├── main.js           # Core initialization and render loop
│   │   ├── scene.js          # 3D scene setup and objects
│   │   ├── animation.js      # Orbital mechanics and updates
│   │   ├── controls.js       # Input handling and camera
│   │   ├── ui.js            # User interface management
│   │   └── config.js        # Astronomical data and settings
│   └── textures/            # High-resolution planet textures
├── support/                 # Development and reference files
│   ├── babysolar.html      # Simplified test version
│   ├── maybe_use_later.js  # Additional features
│   └── notes.txt           # Development notes
├── README.md               # Project documentation
```

## 🎯 Educational Use

This simulation is ideal for:
- **Astronomy Education**: Visual learning of solar system mechanics and structure
- **Physics Demonstrations**: Orbital mechanics, gravity, and particle physics
- **Computer Graphics**: WebGL and Three.js implementation examples
- **Interactive Learning**: Hands-on exploration of space from inner planets to Oort Cloud

### **Learning Objectives**
- Understand relative sizes and distances of celestial bodies
- Visualize orbital inclinations, eccentricity, and 3D orbital mechanics
- Explore the difference between inner solar system, outer planets, and distant regions
- Learn about dwarf planets, comets, and their unique highly eccentric orbits
- Experience the vast scale from Earth (1 AU) to the Oort Cloud (100,000 AU)
- Observe realistic comet behavior with dual tail systems and solar wind effects

## 🔧 Customization

### **Key Configuration Variables**
All major settings can be modified in `main/js/config.js`:

```javascript
// Scaling constants
const DISTANCE_SCALE = 200;    // AU to pixels (solar system spread)
const SIZE_SCALE = 4;          // Planet size multiplier (visibility)

// Animation settings (main/js/animation.js)
let timeSpeed = 1;             // Orbital speed (0-10x)
let movementSpeed = 10;        // Camera movement speed
camera.position.lerp(target, 0.025);  // Focus zoom speed

// Individual planet properties (config.js)
mercury: { 
    size: 0.38,                // Relative to Earth
    distance: 0.39,            // AU from Sun
    speed: 0.008,              // Orbital speed
    inclination: 7.0           // Orbital tilt (degrees)
}
```

### **Performance Tuning**
```javascript
// Reduce for better performance (scene.js)
const starCount = 25000;        // Background stars
const asteroidCount = 2000;     // Asteroid belt objects  
const kuiperCount = 100000;     // Kuiper belt objects
const oortParticleCount = 2000000; // Oort cloud particles

// Geometry detail levels
new THREE.SphereGeometry(size, 32, 32);  // High detail
new THREE.SphereGeometry(size, 16, 16);  // Medium detail
```

## 🐛 Known Issues

- **Texture Loading**: Requires local web server (CORS restrictions)
- **Performance**: Large Oort Cloud (2M particles) may impact older devices/browsers
- **Mobile Support**: Touch controls not yet optimized
- **Zoom Extremes**: Some objects may appear very small at maximum zoom
- **Loading Time**: High-resolution textures may take time to load initially

## 🔮 Future Enhancements

### **Planned Features**
- [ ] **Major Moons**: Jupiter's Galilean moons, Saturn's major moons
- [ ] **Time Acceleration**: Fast-forward through orbital periods
- [ ] **Search Function**: Quick navigation to specific objects
- [ ] **Orbit History**: Show trails of past orbital positions
- [ ] **Mobile Optimization**: Touch-based navigation and controls

### **Advanced Features** 
- [ ] **Real-time Data**: Integration with live astronomical data
- [ ] **VR/AR Mode**: Immersive virtual reality exploration
- [ ] **Educational Modes**: Guided tours and learning modules
- [ ] **Custom Scenarios**: User-defined orbital configurations
- [ ] **Physics Accuracy**: More precise gravitational calculations
- [ ] **Exoplanet Systems**: Exploration of other star systems

## 📚 Documentation

This project includes comprehensive documentation:
- **README.md**: This overview and user guide
- **Report.md**: Detailed Vietnamese academic report
- **Report_English.md**: English version of academic report
- **Learning_Guide.md**: Complete technology learning guide
- **Mathematics_Guide.md**: All mathematical concepts explained

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **NASA**: Astronomical data and texture references
- **Three.js Community**: Amazing 3D web graphics library
- **Solar System Scope**: Inspiration for realistic visualization
- **Astronomy Community**: Accurate orbital data and measurements

## 📞 Support

For questions, suggestions, or issues:
- **Code Structure**: Check the modular JavaScript files in `main/js/`
- **Configuration**: Review `config.js` for all adjustable parameters
- **Console Errors**: Check browser developer tools for loading issues
- **Server Setup**: Ensure local web server is running for texture loading
- **Documentation**: Refer to included guides for detailed explanations

### **Troubleshooting**
1. **Textures not loading**: Verify web server is serving files from project root
2. **Performance issues**: Reduce object counts in `scene.js`
3. **Navigation problems**: Check that WebGL is supported in your browser
4. **Blank screen**: Open browser console to check for JavaScript errors

---

**Built with ❤️ for astronomy education and 3D web graphics demonstration**

*This project serves as both an educational tool and a showcase of modern web-based 3D graphics capabilities using Three.js and WebGL.*
