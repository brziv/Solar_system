# 3D Solar System Simulation

A comprehensive and scientifically accurate 3D solar system simulation built with Three.js, featuring realistic orbital mechanics, advanced comet physics, and immersive exploration from the inner planets to the edge of the heliosphere.

![Solar System Simulation](https://img.shields.io/badge/WebGL-Three.js-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Complete-brightgreen)

## 🌟 Key Features

### **🪐 Complete Solar System**
- **8 Planets** with accurate sizes, distances, and orbital mechanics
- **9 Dwarf Planets** including Pluto, Eris, Ceres with highly elliptical orbits
- **6 Major Comets** with advanced dual-tail physics simulation
- **Earth's Moon** with realistic proportions and orbital motion
- **Saturn's Rings** with authentic textures and proper scaling

### **🌌 Extended Solar System**
- **Asteroid Belt** (2,000+ objects) between Mars and Jupiter
- **Kuiper Belt** (100,000+ objects) beyond Neptune
- **Oort Cloud** (2,000,000 particles) representing the solar system boundary
- **Heliospheric Boundary Glow** - ENA emissions at the heliopause (~120 AU)

### **☄️ Advanced Comet Physics**
- **Realistic Dual-Tail System**: 
  - **Ion Tail** (plasma): Narrow, straight, blue, directly away from Sun
  - **Dust Tail**: Broad, curved, yellow-white, following radiation pressure
- **Distance-Based Activity**: Tails brighten and grow as comets approach the Sun
- **Nuclear Rotation**: Realistic tumbling motion of comet nuclei
- **Coma Formation**: Bright spherical gas cloud around active nuclei
- **Particle Physics**: Individual particle behavior with solar wind effects

### **🎮 Interactive Navigation**
- **Free-Roam Mode**: Explore with WASD keys and mouse controls
- **Object Focus System**: Track any celestial body automatically
- **Manual Orbital Control**: Move around focused objects with WASD
- **Variable Time Speed**: Control orbital motion from pause to 30x speed
- **Zoom Range**: From close-up planetary details to Oort Cloud overview

### **📊 Educational Features**
- **Real Astronomical Data**: Accurate distances, sizes, and orbital parameters
- **3D Orbital Visualization**: See true elliptical paths and inclinations
- **Interactive Info Panels**: Detailed data for every object
- **Live 3D Previews**: Rotating preview spheres with textures
- **Scientific Accuracy**: Based on NASA and ESA data

## 🚀 Quick Start

### **Installation**
1. Clone or download this repository
2. Start a local web server (required for texture loading):
   ```bash
   # Using Python
   cd Solar_system/main
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using VS Code Live Server extension
   Right-click on index.html → "Open with Live Server"
   ```
3. Open `http://localhost:8000` in your browser
4. Wait for textures to load (may take 10-30 seconds)

### **System Requirements**
- **Browser**: Chrome, Firefox, Safari, or Edge with WebGL support
- **Hardware**: Dedicated graphics card recommended for optimal performance
- **RAM**: 4GB+ recommended (Oort Cloud uses 2M particles)

## 🎛️ Controls

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
- **Drag**: Rotate camera around center
- **Scroll**: Zoom in/out (100-2000 units)

### **Interface Controls**
- **Time Speed Slider**: Control orbital motion (0-30x, with pause)
- **Movement Speed Slider**: Adjust camera travel speed (1-10000)
- **Focus Buttons**: Click any celestial body to track it automatically
- **Info Panels**: Display detailed astronomical data and 3D previews

## 🔬 Scientific Accuracy

### **Realistic Data** (All distances in Astronomical Units - AU)

#### **Planets**
| Object | Size (Earth=1) | Distance (AU) | Inclination | Special Features |
|--------|----------------|---------------|-------------|------------------|
| Mercury | 0.38 | 0.39 | 7.0° | Heavily cratered |
| Venus | 0.95 | 0.72 | 3.4° | Thick atmosphere |
| Earth | 1.00 | 1.00 | 0.0° | Clouds + day/night textures |
| Mars | 0.53 | 1.52 | 1.9° | Red desert surface |
| Jupiter | 11.0 | 5.20 | 1.3° | Great Red Spot visible |
| Saturn | 9.0 | 9.58 | 2.5° | Prominent ring system |
| Uranus | 4.0 | 19.22 | 0.8° | Ice giant |
| Neptune | 3.9 | 30.05 | 1.8° | Deep blue color |

#### **Dwarf Planets**  
| Object | Size (Earth=1) | Distance (AU) | Inclination | Eccentricity | Type |
|--------|----------------|---------------|-------------|--------------|------|
| Ceres | 0.07 | 2.8 | 10.6° | 0.076 | Asteroid Belt |
| Pluto | 0.18 | 39.5 | 17.2° | 0.244 | Kuiper Belt |
| Eris | 0.19 | 67.7 | 44.2° | 0.436 | Scattered Disk |
| Haumea | 0.15 | 43.3 | 28.2° | 0.189 | Kuiper Belt |
| Makemake | 0.11 | 45.8 | 29.0° | 0.159 | Kuiper Belt |
| Sedna | 0.08 | 76.0 | 11.9° | 0.855 | Sednoid |
| Quaoar | 0.09 | 43.7 | 8.0° | 0.037 | Kuiper Belt |
| Orcus | 0.07 | 39.4 | 20.6° | 0.226 | Kuiper Belt |
| Gonggong | 0.10 | 67.3 | 30.8° | 0.500 | Scattered Disk |

#### **Comets with Advanced Physics**
| Comet | Perihelion | Aphelion | Eccentricity | Period | Special Features |
|-------|------------|----------|--------------|--------|------------------|
| **Halley** | 0.59 AU | 35.1 AU | 0.967 | 76 years | Retrograde orbit (162.3°) |
| **Hale-Bopp** | 0.91 AU | 370 AU | 0.995 | 2,533 years | Extremely long period |
| **Hyakutake** | 0.23 AU | 3,410 AU | 0.9998 | 72,000 years | Nearly parabolic |
| **McNaught** | 0.17 AU | 3,200 AU | 0.9999 | 92,600 years | Brightest recent comet |
| **NEOWISE** | 0.29 AU | 715 AU | 0.9992 | 6,800 years | Discovered by WISE |
| **Bernardinelli–Bernstein** | 10.9 AU | 40,000 AU | 0.999 | 4M years | Largest known nucleus |

### **Advanced Comet Physics Implementation**

**🔬 Nuclear Physics**
- **Nucleus Composition**: Dark, rocky-icy cores with realistic colors
- **Rotational Dynamics**: Individual rotation and tumbling motion
- **Size Scaling**: Accurate relative sizes (few km in real scale)

**💨 Coma Formation** 
- **Activation Distance**: Begins forming at ~5 AU from Sun
- **Dual-Layer System**: Inner bright core + outer diffuse glow
- **Dynamic Scaling**: Size increases with solar proximity
- **Pulsing Effects**: Realistic gas sublimation variations

**⚡ Ion Tail (Plasma Tail)**
- **Composition**: Ionized gas particles (blue)
- **Behavior**: Always points directly away from Sun
- **Physics**: Affected by solar wind, very narrow and straight
- **Particle Count**: 300 individual particles per comet
- **Flickering**: Realistic electrical discharge effects

**🌪️ Dust Tail**
- **Composition**: Dust and ice particles (yellow-white)
- **Behavior**: Curved path following radiation pressure
- **Physics**: Shows orbital motion effects and broader sweep
- **Particle Count**: 200 larger particles per comet  
- **Dynamics**: Responds to both solar wind and orbital motion

## 🌌 Extended Solar System Features

### **Oort Cloud** (2,000,000 particles)
- **Scale**: 2,000 AU to 100,000 AU from Sun
- **Composition Types**:
  - **Icy Comets** (40%) - Blue-white, fresh water ice
  - **Dirty Ice** (30%) - Brown, mixed ice and dust  
  - **Carbonaceous** (20%) - Dark brown, carbon-rich
  - **Methane-Rich** (10%) - Yellow, organic compounds
- **Scientific Basis**: Represents the true source of long-period comets

### **Heliospheric Boundary Glow**
- **Location**: ~120 AU from Sun (heliopause boundary)
- **Physics**: ENA (Energetic Neutral Atom) emissions visualization
- **Particle System**: 50,000 particles with realistic color distribution
- **Animation**: Pulsing charge-exchange effects and slow rotation
- **Scientific Accuracy**: Based on Voyager 1 & 2 data

### **Belt Systems**
- **Asteroid Belt**: 2,000 objects between Mars and Jupiter
- **Kuiper Belt**: 100,000 objects beyond Neptune
- **Realistic Distribution**: Proper density gradients and orbital inclinations

## 🛠️ Technical Implementation

### **Architecture**
```
main/js/
├── main.js         # Application initialization and render loop
├── scene.js        # 3D scene creation and object management
├── animation.js    # Orbital mechanics and physics updates
├── controls.js     # User input and camera controls
├── ui.js          # Interface panels and information display
└── config.js      # Astronomical data and configuration
```

### **Rendering Technology**
- **Three.js r150+**: Modern 3D graphics library
- **WebGL**: Hardware-accelerated rendering
- **Point Cloud Systems**: Efficient particle rendering for belts and Oort Cloud
- **LOD (Level of Detail)**: Adaptive quality based on distance
- **Texture Streaming**: Progressive loading of high-resolution textures

### **Performance Optimizations**
- **Frustum Culling**: Automatic off-screen object removal
- **Particle Batching**: Efficient rendering of millions of particles
- **Texture Compression**: Optimized memory usage for 8K textures
- **Update Throttling**: Smart update cycles for different object types

### **Physics Engine**
- **Elliptical Orbits**: Real Kepler orbital mechanics
- **3D Inclinations**: True orbital plane calculations
- **N-Body Influences**: Gravitational perturbations for realistic motion
- **Particle Dynamics**: Solar wind and radiation pressure effects

## 📁 Project Structure

```
Solar_system/
├── README.md                 # This comprehensive guide
├── Learning.md              # Complete technology learning guide  
├── Math.md                  # Mathematical concepts explained
├── Report.md                # Academic project report (Vietnamese)
├── main/
│   ├── index.html           # Application entry point
│   ├── style.css           # UI styling and layout
│   ├── js/                 # Core JavaScript modules
│   │   ├── main.js         # Initialization and render loop
│   │   ├── scene.js        # 3D scene and object creation
│   │   ├── animation.js    # Physics and orbital updates
│   │   ├── controls.js     # Input handling and navigation
│   │   ├── ui.js          # Interface and information panels
│   │   └── config.js      # Astronomical data and settings
│   └── textures/          # High-resolution celestial body textures
│       ├── 8k_sun.jpg     # (8K) Solar surface with granulation
│       ├── 8k_earth_daymap.jpg    # (8K) Earth continents  
│       ├── 8k_earth_nightmap.jpg  # (8K) City lights
│       ├── 8k_earth_clouds.jpg    # (8K) Cloud layer
│       ├── 8k_saturn_ring.png     # (8K) Saturn ring system
│       └── [additional planet textures]
└── support/               # Development files and references
    ├── babysolar.html     # Simplified test version
    ├── maybe_use_later.js # Additional features
    └── notes.txt          # Development notes
```

## 🎯 Educational Applications

### **Learning Objectives**
- **Scale Comprehension**: Experience the vast size differences from planets to Oort Cloud
- **Orbital Mechanics**: Visualize Kepler's laws and elliptical orbits in 3D
- **Comet Physics**: Understand how solar wind creates different tail types
- **Solar System Structure**: Explore regions from inner planets to heliosphere boundary
- **Comparative Planetology**: Compare sizes, distances, and compositions

### **Recommended Exploration Path**
1. **Start at Earth** - Use focus button to center on our home planet
2. **Visit Inner Planets** - Mercury, Venus, Mars with close-up views
3. **Explore Gas Giants** - Jupiter and Saturn with their massive scales
4. **Distant Ice Giants** - Uranus and Neptune at solar system's edge
5. **Dwarf Planet Tour** - See highly eccentric orbits and inclinations
6. **Comet Watching** - Follow comets and observe tail formation
7. **Belt Exploration** - Navigate through asteroid and Kuiper belts
8. **Oort Cloud Boundary** - Zoom out to see the solar system's true extent

## ⚙️ Customization Guide

### **Modifying Visual Settings**
```javascript
// In config.js - Adjust scaling
const DISTANCE_SCALE = 200;    // Solar system spread
const SIZE_SCALE = 4;          // Planet visibility

// In scene.js - Particle counts
const starCount = 25000;        // Background stars
const asteroidCount = 2000;     // Asteroid belt
const kuiperCount = 100000;     // Kuiper belt  
const oortParticleCount = 2000000; // Oort cloud
```

### **Performance Tuning**
```javascript
// Reduce for lower-end devices
oortParticleCount: 500000,     // Instead of 2M
kuiperCount: 25000,            // Instead of 100K
asteroidCount: 500,            // Instead of 2K

// Geometry detail levels
new THREE.SphereGeometry(size, 16, 16);  // Medium detail
new THREE.SphereGeometry(size, 8, 8);    // Low detail
```

### **Adding New Objects**
```javascript
// In config.js - Add new dwarf planet
newObject: {
    size: 0.05,           // Relative to Earth
    distance: 50.0,       // AU from Sun
    speed: 0.0004,        // Orbital speed
    color: 0xFF6600,      // Hex color
    inclination: 15.0,    // Orbital tilt
    eccentricity: 0.3     // Orbital shape
}
```

## 🐛 Known Limitations

### **Performance Considerations**
- **Oort Cloud**: 2M particles may impact older devices/browsers
- **Texture Loading**: Initial 8K texture download can take time
- **Memory Usage**: Requires 2-4GB RAM for optimal performance

### **Browser Support**
- **WebGL Required**: Modern browser with hardware acceleration
- **Mobile Limitations**: Touch controls not fully optimized  
- **Safari**: Some texture formats may require fallbacks

### **Physics Simplifications**
- **N-Body**: Simplified to 2-body gravitational calculations
- **Resonances**: Orbital resonances not fully modeled
- **Perturbations**: Minor gravitational influences approximated

## 🔮 Future Development

### **Planned Enhancements**
- [ ] **Major Moons**: Jupiter's Galilean satellites, Saturn's Titan
- [ ] **Asteroid Details**: Individual asteroid rotation and shapes
- [ ] **Real-Time Data**: Integration with live astronomical feeds
- [ ] **VR/AR Support**: Immersive virtual reality exploration
- [ ] **Mobile Optimization**: Touch-based navigation system

### **Advanced Features**
- [ ] **Multi-Star Systems**: Alpha Centauri and nearby stars
- [ ] **Exoplanet Exploration**: Kepler and TESS discovered worlds
- [ ] **Historical Mode**: See past/future orbital positions
- [ ] **Educational Modules**: Guided tours and interactive lessons
- [ ] **Physics Accuracy**: Full N-body gravitational simulation

## � Additional Documentation

- **[Learning.md](Learning.md)**: Complete technology learning guide
- **[Math.md](Math.md)**: Mathematical concepts and formulas explained
- **[Report.md](Report.md)**: Academic project report (Vietnamese)

## 📄 License & Credits

### **License**
This project is open source under the [MIT License](LICENSE).

### **Data Sources**
- **NASA JPL**: Planetary and comet orbital data
- **ESA**: Comet physics and heliosphere research
- **IAU**: Official dwarf planet classifications
- **Voyager Mission**: Heliospheric boundary data

### **Texture Credits**
- **Solar System Scope**: Planetary surface textures
- **NASA**: Earth day/night and cloud maps
- **Community**: Various astronomical texture contributions

### **Technology Stack**
- **Three.js**: 3D graphics rendering library
- **WebGL**: Hardware-accelerated graphics API
- **JavaScript ES6**: Modern web development
- **HTML5/CSS3**: Interface and styling

---

## 🚀 Experience the Solar System

From the scorching surface of Mercury to the frozen depths of the Oort Cloud, this simulation offers an unparalleled journey through our cosmic neighborhood. Whether you're a student, educator, or space enthusiast, explore the wonders of the solar system in scientifically accurate detail.

**Start your cosmic journey today!** 🌌

---

*Built with passion for astronomy education and cutting-edge web graphics technology.*