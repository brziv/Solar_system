// Modify Earth's material to include night texture
    function createEarthWithNightMap() {
        // This function will be called from createPlanets() for Earth
        if (!loadedTextures.earth || !loadedTextures.earthNight) {
            return new THREE.MeshLambertMaterial({ color: fallbackColors.earth });
        }

        // Create custom shader material with day/night blending
        const customMaterial = new THREE.ShaderMaterial({
            uniforms: {
                dayTexture: { value: loadedTextures.earth },
                nightTexture: { value: loadedTextures.earthNight },
                sunDirection: { value: new THREE.Vector3(1, 0, 0) }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                
                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D dayTexture;
                uniform sampler2D nightTexture;
                uniform vec3 sunDirection;
                
                varying vec2 vUv;
                varying vec3 vNormal;
                
                void main() {
                    vec3 normalizedSunDir = normalize(sunDirection);
                    float intensity = dot(vNormal, normalizedSunDir);
                    intensity = clamp(intensity, -1.0, 1.0);
                    
                    // Smooth transition between day and night
                    float blendFactor = smoothstep(-0.2, 0.2, intensity);
                    
                    vec4 dayColor = texture2D(dayTexture, vUv);
                    vec4 nightColor = texture2D(nightTexture, vUv);
                    
                    gl_FragColor = mix(nightColor, dayColor, blendFactor);
                }
            `
        });

        return customMaterial;
    }