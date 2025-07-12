# Mathematical Concepts for Solar System 3D Simulation

## Table of Contents
1. [Core Mathematical Foundations](#core-mathematical-foundations)
2. [3D Graphics Mathematics](#3d-graphics-mathematics)
3. [Orbital Mechanics Mathematics](#orbital-mechanics-mathematics)
4. [Animation and Interpolation](#animation-and-interpolation)
5. [Practical Code Examples](#practical-code-examples)
6. [Study Progression Guide](#study-progression-guide)

---

## Core Mathematical Foundations

### 1. Trigonometry (Essential)

#### **Sine and Cosine Functions**
```javascript
// Basic circular motion in your project
planet.position.x = Math.cos(userData.angle) * userData.originalDistance;
planet.position.z = Math.sin(userData.angle) * userData.originalDistance;
```

**What you need to know:**
- **Unit Circle**: cos(θ) = x-coordinate, sin(θ) = y-coordinate
- **Radian vs Degrees**: 2π radians = 360°, π = 180°
- **Key Values**: sin(0) = 0, cos(0) = 1, sin(π/2) = 1, cos(π/2) = 0

#### **Applications in Your Code:**
```javascript
// Converting degrees to radians
const inclinationRad = (data.inclination || 0) * Math.PI / 180;

// Orbital inclination calculation
planet.position.y = Math.sin(userData.angle) * Math.sin(userData.inclination) * userData.originalDistance * 0.05;
```

#### **What This Math Does:**
- **Circular Orbits**: Creates perfect circles using parametric equations
- **Orbital Tilt**: Uses sine to create vertical displacement based on inclination angle
- **Rotation**: Continuously increasing angle creates smooth orbital motion

### 2. Coordinate Systems

#### **Cartesian Coordinates (x, y, z)**
```javascript
// 3D position in space
camera.position.set(1000, 25000, 10000);
```

#### **Spherical Coordinates (r, θ, φ)**
```javascript
// Mouse rotation using spherical coordinates
const spherical = new THREE.Spherical();
spherical.setFromVector3(camera.position);
spherical.theta -= deltaX * 0.01;  // Azimuthal angle
spherical.phi += deltaY * 0.01;    // Polar angle
camera.position.setFromSpherical(spherical);
```

**Conversion Formulas:**
- x = r × sin(φ) × cos(θ)
- y = r × cos(φ)  
- z = r × sin(φ) × sin(θ)

---

## 3D Graphics Mathematics

### 1. Vector Mathematics

#### **Vector Basics**
```javascript
// Creating and using vectors in your code
const direction = new THREE.Vector3();
camera.getWorldDirection(direction);

// Vector operations
const right = new THREE.Vector3().crossVectors(direction, camera.up).normalize();
```

**Essential Vector Operations:**

#### **Addition/Subtraction**
```javascript
// Adding vectors (movement)
camera.position.add(direction.multiplyScalar(speed));

// Subtracting vectors (relative position)
const currentOffset = camera.position.clone().sub(target.position);
```

#### **Dot Product**
```javascript
// Measure angle between vectors
const dotProduct = vector1.dot(vector2);
const angle = Math.acos(dotProduct / (vector1.length() * vector2.length()));
```

#### **Cross Product**
```javascript
// Get perpendicular vector (for camera movement)
const right = new THREE.Vector3().crossVectors(forward, up).normalize();
```

#### **Normalization**
```javascript
// Make vector length = 1 (direction only)
const direction = camera.position.clone().normalize();
```

### 2. Matrix Transformations

#### **Translation (Movement)**
```javascript
// Moving objects in 3D space
object.position.x += deltaX;
object.position.y += deltaY;
object.position.z += deltaZ;
```

#### **Rotation**
```javascript
// Rotating objects
planet.rotation.y += 0.005 * timeSpeed;  // Spin on axis
rings.rotation.x = Math.PI / 2;          // Tilt rings 90 degrees
```

#### **Scaling**
```javascript
// Making objects bigger/smaller
const geometry = new THREE.SphereGeometry(data.size * SIZE_SCALE, 32, 32);
```

### 3. Projection Mathematics

#### **Perspective Projection**
```javascript
// Camera setup with field of view
const camera = new THREE.PerspectiveCamera(
    75,                           // Field of view (degrees)
    window.innerWidth / window.innerHeight,  // Aspect ratio
    0.1,                         // Near clipping plane
    500000                       // Far clipping plane
);
```

**Perspective Formula:**
- screenX = (3D_x × focal_length) / 3D_z
- screenY = (3D_y × focal_length) / 3D_z

---

## Orbital Mechanics Mathematics

### 1. Kepler's Laws Implementation

#### **First Law: Elliptical Orbits**
```javascript
// Elliptical orbit calculation for dwarf planets
const eccentricity = userData.eccentricity || 0;
const semiMajorAxis = userData.originalDistance;
const r = (semiMajorAxis * (1 - eccentricity * eccentricity)) / 
          (1 + eccentricity * Math.cos(userData.angle));
```

**Ellipse Formula:**
- r = a(1 - e²) / (1 + e × cos(θ))
- Where: a = semi-major axis, e = eccentricity, θ = true anomaly

#### **Eccentricity Values:**
- e = 0: Perfect circle
- 0 < e < 1: Ellipse
- e = 1: Parabola
- e > 1: Hyperbola

#### **Second Law: Equal Areas (Speed Variation)**
```javascript
// Objects move faster when closer to sun (perihelion)
// Your code uses constant speed, but could implement:
const speedMultiplier = Math.sqrt((1 + eccentricity * Math.cos(angle)) / (1 - eccentricity * eccentricity));
```

### 2. Orbital Inclination

#### **3D Orbital Planes**
```javascript
// Tilted orbits using inclination
if (userData.inclination) {
    dwarf.position.y = Math.sin(userData.angle) * Math.sin(userData.inclination) * semiMajorAxis * 0.3;
}
```

**Mathematical Concept:**
- Normal orbit: y = 0 (flat plane)
- Inclined orbit: y = sin(orbital_angle) × sin(inclination) × distance

### 3. Astronomical Units and Scaling

#### **Distance Scaling**
```javascript
const DISTANCE_SCALE = 200;  // 1 AU = 200 pixels
planet.position.x = Math.cos(angle) * data.distance * DISTANCE_SCALE;
```

**Real Distances:**
- 1 AU = 149,597,870.7 km (Earth-Sun distance)
- Your simulation: 1 AU = 200 pixels
- Scale factor: 1 pixel ≈ 747,989 km

---

## Animation and Interpolation

### 1. Linear Interpolation (Lerp)

#### **Smooth Camera Movement**
```javascript
// Gradual movement from current to target position
camera.position.lerp(cameraPos, 0.025);
```

**Lerp Formula:**
- result = start + (end - start) × t
- Where t = interpolation factor (0 to 1)

**Different Lerp Values:**
- t = 0.01: Very slow (99% old, 1% new each frame)
- t = 0.1: Moderate (90% old, 10% new each frame)
- t = 0.5: Fast (50% old, 50% new each frame)
- t = 1.0: Instant (100% new)

### 2. Frame Rate Mathematics

#### **Frame-Independent Animation**
```javascript
// Time-based animation
userData.angle += userData.speed * timeSpeed;
```

**Concepts:**
- **60 FPS**: 1 frame every 16.67ms
- **deltaTime**: Time since last frame
- **Frame independence**: Motion should look same regardless of frame rate

### 3. Parametric Equations

#### **Circular Motion**
```javascript
// Parametric circle
x = radius × cos(t)
y = radius × sin(t)
// Where t goes from 0 to 2π
```

#### **Elliptical Motion**
```javascript
// Parametric ellipse
x = a × cos(t)  // a = semi-major axis
y = b × sin(t)  // b = semi-minor axis
```

---

## Practical Code Examples

### 1. Distance Calculations

#### **2D Distance**
```javascript
function distance2D(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}
```

#### **3D Distance (Used for Camera Focus)**
```javascript
const currentDistance = camera.position.distanceTo(target.position);
// Internally: sqrt((x2-x1)² + (y2-y1)² + (z2-z1)²)
```

### 2. Angle Calculations

#### **Angle Between Two Points**
```javascript
function angleBetweenPoints(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}
```

#### **Angle Normalization**
```javascript
function normalizeAngle(angle) {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
}
```

### 3. Speed and Velocity

#### **Orbital Speed (Simplified)**
```javascript
// Your current implementation
userData.angle += userData.speed * timeSpeed;

// More realistic (Kepler's 2nd law)
function getOrbitalSpeed(distance, eccentricity, angle) {
    return Math.sqrt((1 + eccentricity * Math.cos(angle)) / (1 - eccentricity * eccentricity));
}
```

### 4. Zoom and Scale Calculations

#### **Logarithmic Zoom**
```javascript
// For smooth zoom feel
function logarithmicZoom(currentZoom, zoomFactor) {
    return currentZoom * Math.pow(zoomFactor, deltaTime);
}
```

#### **Perspective Scaling**
```javascript
// Objects appear smaller when farther away
const apparentSize = realSize / distance;
```

---

## Study Progression Guide

### Phase 1: Fundamentals (1-2 weeks)
1. **Trigonometry Review**
   - Unit circle
   - Sin, cos, tan functions
   - Radians vs degrees
   - Practice: Plot points on unit circle

2. **Basic Algebra**
   - Linear equations
   - Quadratic equations
   - Exponents and roots

### Phase 2: 3D Mathematics (2-3 weeks)
1. **Vector Mathematics**
   - Vector addition/subtraction
   - Dot and cross products
   - Vector magnitude and normalization
   - Practice: 3D vector problems

2. **Coordinate Systems**
   - Cartesian coordinates
   - Spherical coordinates
   - Coordinate transformations

### Phase 3: Applied Mathematics (2-3 weeks)
1. **Parametric Equations**
   - Circle and ellipse equations
   - 3D curves and surfaces
   - Practice: Create parametric animations

2. **Interpolation**
   - Linear interpolation
   - Cubic interpolation
   - Easing functions

### Phase 4: Advanced Topics (3-4 weeks)
1. **Orbital Mechanics**
   - Kepler's laws
   - Elliptical orbits
   - Gravitational mathematics

2. **Matrix Mathematics**
   - Matrix multiplication
   - Transformation matrices
   - Rotation matrices

## Essential Formulas Summary

### **Circular Orbit**
```javascript
x = radius × cos(angle)
y = radius × sin(angle)
```

### **Elliptical Orbit**
```javascript
r = a(1 - e²) / (1 + e × cos(θ))
x = r × cos(θ)
y = r × sin(θ)
```

### **3D Rotation Around Y-axis**
```javascript
x' = x × cos(θ) - z × sin(θ)
y' = y
z' = x × sin(θ) + z × cos(θ)
```

### **Linear Interpolation**
```javascript
result = start + (end - start) × t
```

### **Distance Formula (3D)**
```javascript
distance = √[(x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²]
```

### **Vector Normalization**
```javascript
normalized = vector / |vector|
|vector| = √(x² + y² + z²)
```

## Recommended Resources

### **Books:**
1. "Mathematics for 3D Game Programming and Computer Graphics" - Eric Lengyel
2. "Essential Mathematics for Games and Interactive Applications" - Van Verth & Bishop
3. "Real-Time Rendering" - Akenine-Moller, Haines & Hoffman

### **Online Resources:**
1. Khan Academy - Trigonometry and Precalculus
2. 3Blue1Brown - Linear Algebra series (YouTube)
3. Scratchapixel.com - 3D Graphics mathematics

### **Practice Tools:**
1. Desmos Graphing Calculator - Visualize functions
2. GeoGebra - 3D visualization
3. Wolfram Alpha - Mathematical computations
