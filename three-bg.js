// Ensure Three.js is loaded before running this script
if (typeof THREE === 'undefined') {
    console.error('Three.js library not found!');
} else {
    const container = document.getElementById('three-canvas-container');
    if (!container) {
        console.error('Three.js container not found!');
    } else {
        let scene, camera, renderer;
        let planes = []; // Array to hold our drifting planes
        const clock = new THREE.Clock();
        let mouseX = 0, mouseY = 0;
        let targetX = 0, targetY = 0;

        function initThree() {
            // Scene
            scene = new THREE.Scene();

            // Camera
            camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
            camera.position.z = 10;

            // Renderer
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setSize(container.offsetWidth, container.offsetHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            container.appendChild(renderer.domElement);

            // --- Drifting Planes (Light Theme Colors) ---

            // Use light theme accent/highlight colors, maybe lighter shades
            const colors = [
                0x2563eb, // accent (blue-600)
                0x14b8a6, // highlight (teal-500)
                0x60a5fa, // Lighter blue (blue-400)
                0x5eead4, // Lighter teal (teal-300)
                0xdbeafe, // Very light blue (blue-100) - more subtle
            ];

            const planeGeometry = new THREE.PlaneGeometry(5, 5);
            const planeCount = 15;

            for (let i = 0; i < planeCount; i++) {
                const material = new THREE.MeshBasicMaterial({
                    color: colors[Math.floor(Math.random() * colors.length)],
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: Math.random() * 0.3 + 0.3, // Opacity between 0.3 and 0.6
                    depthWrite: false,
                    blending: THREE.AdditiveBlending,
                });

                const plane = new THREE.Mesh(planeGeometry, material);

                plane.position.x = (Math.random() - 0.5) * 20;
                plane.position.y = (Math.random() - 0.5) * 20;
                plane.position.z = (Math.random() - 0.5) * 15;
                plane.rotation.x = Math.random() * Math.PI * 2;
                plane.rotation.y = Math.random() * Math.PI * 2;
                plane.rotation.z = Math.random() * Math.PI * 2;
                const scale = Math.random() * 0.5 + 0.8;
                plane.scale.set(scale, scale, scale);
                plane.userData = {
                    driftSpeedX: (Math.random() - 0.5) * 0.001,
                    driftSpeedY: (Math.random() - 0.5) * 0.001,
                    rotationSpeedX: (Math.random() - 0.5) * 0.0005,
                    rotationSpeedY: (Math.random() - 0.5) * 0.0005,
                    rotationSpeedZ: (Math.random() - 0.5) * 0.0005,
                };
                scene.add(plane);
                planes.push(plane);
            }

            window.addEventListener('resize', onWindowResize, false);
            document.addEventListener('mousemove', onDocumentMouseMove, false);
            animate();
        }

        function onWindowResize() {
            if (!container || !camera || !renderer) return;
            camera.aspect = container.offsetWidth / container.offsetHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.offsetWidth, container.offsetHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }

        function onDocumentMouseMove(event) {
             mouseX = (event.clientX / window.innerWidth) * 2 - 1;
             mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        }

        function animate() {
            requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();
            planes.forEach(plane => {
                plane.rotation.x += plane.userData.rotationSpeedX;
                plane.rotation.y += plane.userData.rotationSpeedY;
                plane.rotation.z += plane.userData.rotationSpeedZ;
                plane.position.x += plane.userData.driftSpeedX;
                plane.position.y += plane.userData.driftSpeedY;
                if (plane.position.x > 12 || plane.position.x < -12) plane.userData.driftSpeedX *= -1;
                if (plane.position.y > 12 || plane.position.y < -12) plane.userData.driftSpeedY *= -1;
            });
            targetX = mouseX * 0.3;
            targetY = mouseY * 0.3;
            if (camera && scene) {
                camera.position.x += (targetX - camera.position.x) * 0.04;
                camera.position.y += (targetY - camera.position.y) * 0.04;
                camera.lookAt(scene.position);
            }
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }
        }
        initThree();
    }
}