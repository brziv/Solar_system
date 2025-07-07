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
2. Place all files in a web server directory
3. Ensure texture files are in the `textures/` folder
4. Open `index.html` in your browser

### **Required Textures**
Place these texture files in the `textures/` directory:
```
textures/
├── 8k_sun.jpg
├── 8k_mercury.jpg
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
└── 4k_makemake.jpg
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
- **Time Speed Slider**: Adjust orbital motion speed (0-10x)
- **Pause Button**: Freeze all orbital motion
- **Real-time Updates**: Smooth interpolation for all speeds

### **Movement Controls**
- **Movement Speed Slider**: Adjust camera travel speed (1-50)
- **Shift Modifier**: Hold for 2x speed boost
- **Adaptive Scaling**: Automatically adjusts for system scale

### **View Options**
- ☑️ **Show Orbits**: Toggle orbital path visibility
- ☑️ **Show Moons**: Toggle moon visibility
- ☑️ **Show Dwarf Planets**: Toggle dwarf planet visibility
- ☑️ **Show Asteroid Belt**: Toggle asteroid belt visibility
- ☑️ **Show Kuiper Belt**: Toggle Kuiper belt visibility

### **Focus Targets**
- **Sun**: Central star with enhanced visibility
- **Inner Planets**: Mercury, Venus, Earth, Mars
- **Outer Planets**: Jupiter, Saturn, Uranus, Neptune
- **Dwarf Planets**: Ceres, Pluto, Eris, Haumea, Makemake

## 🔬 Scientific Accuracy

### **Scale Compromises**
- **Sun Size**: Compressed to 2x Jupiter radius (real: 109x Earth)
- **Planet Sizes**: Realistic relative proportions maintained
- **Distances**: Scaled proportionally for visibility
- **Orbital Speeds**: Reduced for observable motion

### **Astronomical Data**
| Object | Real Size (Earth=1) | Orbital Inclination | Eccentricity |
|--------|-------------------|-------------------|--------------|
| Mercury | 0.38 | 7.0° | ~0 |
| Venus | 0.95 | 3.4° | ~0 |
| Earth | 1.00 | 0.0° | ~0 |
| Mars | 0.53 | 1.9° | ~0 |
| Jupiter | 11.0 | 1.3° | ~0 |
| Saturn | 9.0 | 2.5° | ~0 |
| Uranus | 4.0 | 0.8° | ~0 |
| Neptune | 3.9 | 1.8° | ~0 |
| Ceres | 0.15 | 10.6° | 0.076 |
| Pluto | 0.18 | 17.2° | 0.244 |
| Eris | 0.19 | 44.2° | 0.436 |

### **Orbital Mechanics**
- **Elliptical Orbits**: Proper eccentricity calculations for dwarf planets
- **Inclination Effects**: 3D orbital planes with realistic tilts
- **Kepler's Laws**: Orbital speeds vary with distance
- **Orbital Periods**: Proportionally accurate relative timing

## 🛠️ Technical Details

### **Built With**
- **Three.js r128**: 3D graphics library
- **WebGL**: Hardware-accelerated rendering
- **JavaScript ES6**: Modern web standards
- **HTML5/CSS3**: Responsive interface design

### **Performance Features**
- **LOD System**: Adaptive detail based on distance
- **Frustum Culling**: Automatic object culling
- **Texture Optimization**: Efficient memory usage
- **Point Cloud Rendering**: Optimized asteroid/Kuiper belts

### **Rendering Pipeline**
- **Sphere Geometry**: Planets and celestial bodies
- **Line Geometry**: Orbital paths
- **Point Cloud**: Asteroid and Kuiper belt objects
- **Instanced Rendering**: Efficient belt object rendering

### **Camera System**
- **Perspective Camera**: 75° FOV
- **Dynamic Range**: 0.1 to 300,000 units
- **Smooth Controls**: Interpolated movement
- **Focus Tracking**: Automatic object following

## 📁 Project Structure

```
Solar_system/
├── main/
│   ├── index.html          # Main application entry
│   ├── script.js          # Core simulation logic
│   ├── style.css          # Interface styling
│   └── textures/          # Planet texture assets
├── support/               # Development files
│   ├── babysolar.html     # Simplified version
│   ├── maybe_use_later.js # Additional features
│   └── notes.txt          # Development notes
└── README.md              # This file
```

## 🎯 Educational Use

This simulation is ideal for:
- **Astronomy Education**: Visual learning of solar system mechanics
- **Physics Demonstrations**: Orbital mechanics and gravity
- **Computer Graphics**: WebGL and Three.js examples
- **Interactive Learning**: Hands-on exploration of space

### **Learning Objectives**
- Understand relative sizes of celestial bodies
- Visualize orbital inclinations and eccentricity
- Explore the difference between inner and outer solar system
- Learn about dwarf planets and their unique orbits
- Experience the vast scale of the solar system

## 🔧 Customization

### **Scaling Factors**
Edit these values in `script.js`:
```javascript
// Size scaling (line ~227)
const geometry = new THREE.SphereGeometry(data.size * 10, 32, 32);

// Distance scaling (line ~232)
planet.position.x = Math.cos(angle) * data.distance * 200;

// Inclination scaling (line ~234)
planet.position.y = Math.sin(inclinationRad) * data.distance * 10;
```

### **Visual Settings**
```javascript
// Camera range (line ~61)
camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 300000);

// Star count (line ~172)
const starCount = 25000;

// Belt object counts (lines ~434, ~463)
const asteroidCount = 3000;
const kuiperCount = 150000;
```

## 🐛 Known Issues

- **Large distances**: Some objects may appear small at extreme zoom levels
- **Performance**: Large Kuiper belt may impact performance on older devices
- **Texture loading**: Requires web server for proper texture loading
- **Mobile support**: Touch controls not yet implemented

## 🔮 Future Enhancements

- [ ] **Moons of Gas Giants**: Jupiter's Galilean moons, Saturn's Titan
- [ ] **Comet Trajectories**: Highly eccentric comet orbits
- [ ] **Time Controls**: Fast-forward through years/decades
- [ ] **Search Function**: Find and focus on specific objects
- [ ] **Orbit Trails**: Show historical orbital paths
- [ ] **Mobile Support**: Touch-based navigation
- [ ] **VR Mode**: Virtual reality exploration
- [ ] **Educational Overlays**: Interactive learning modules

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **NASA**: Astronomical data and texture references
- **Three.js Community**: Amazing 3D web graphics library
- **Solar System Scope**: Inspiration for realistic visualization
- **Astronomy Community**: Accurate orbital data and measurements

## 📞 Support

For questions, suggestions, or issues:
- Check the code comments for implementation details
- Review the console for any loading errors
- Ensure all texture files are properly placed
- Verify web server is serving files correctly

---

**Made with ❤️ for astronomy education and WebGL exploration**
