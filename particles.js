const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let numParticles = window.innerWidth < 768 ? 200 : 800; // Responsive particle count
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

let rotationX = 0;
let rotationY = 0;
let baseRotation = 0;
let lastMouseMove = 0; // Track idle time

function resize() {
    const hero = document.getElementById('home');
    if (hero) {
        width = canvas.width = hero.offsetWidth;
        height = canvas.height = hero.offsetHeight;
        
        let newNumParticles = window.innerWidth < 768 ? 200 : 800;
        if (newNumParticles !== numParticles) {
            numParticles = newNumParticles;
            init();
        }
    }
}

window.addEventListener('resize', resize);
// Initial resize on load, and after a short delay to ensure CSS applied
resize();
setTimeout(resize, 100);

// Antigravity-style vibrant colors optimized for light themes
const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#A0C3FF', '#8AB4F8', '#F28B82'];

class Particle {
    constructor() {
        // Distribute within a 3D sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        
        // Varying radii primarily pushing towards the edges (hollowish center like a burst)
        const radius = Math.pow(Math.random(), 1/3) * (Math.min(width, height) * 0.8) + 50;
        
        this.baseX = radius * Math.sin(phi) * Math.cos(theta);
        this.baseY = radius * Math.sin(phi) * Math.sin(theta);
        this.baseZ = radius * Math.cos(phi);
        
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.size = Math.random() * 1.5 + 0.5;
        this.dashLength = Math.random() * 12 + 4; // Long dashes radiating out
    }
    
    draw() {
        // Rotate around Y
        let x1 = this.baseX * Math.cos(rotationY) - this.baseZ * Math.sin(rotationY);
        let z1 = this.baseZ * Math.cos(rotationY) + this.baseX * Math.sin(rotationY);
        
        // Rotate around X
        let y2 = this.baseY * Math.cos(rotationX) - z1 * Math.sin(rotationX);
        let z2 = z1 * Math.cos(rotationX) + this.baseY * Math.sin(rotationX);
        
        const fov = 1000;
        const z = z2 + 1500;
        
        // Prevent drawing behind the "camera"
        if (z > 50) {
            const scale = fov / z;
            const projX = x1 * scale + width / 2;
            const projY = y2 * scale + height / 2;
            
            // In antigravity, particles often look like streaks pointing away from the center
            const dirX = projX - width / 2;
            const dirY = projY - height / 2;
            const mag = Math.sqrt(dirX*dirX + dirY*dirY) || 1;
            
            ctx.beginPath();
            ctx.moveTo(projX, projY);
            // Draw a dash outward based on direction vector
            ctx.lineTo(projX + (dirX/mag) * this.dashLength * scale, projY + (dirY/mag) * this.dashLength * scale);
            
            ctx.strokeStyle = this.color;
            
            // Fade particles that are further away in the Z-axis
            const alpha = Math.min(1, Math.max(0.1, (2000 - z) / 1000));
            ctx.globalAlpha = alpha;
            ctx.lineWidth = this.size * scale;
            ctx.lineCap = 'round';
            ctx.stroke();
            
            // Reset alpha for safety
            ctx.globalAlpha = 1.0;
        }
    }
}

function init() {
    particles = [];
    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }
}

init();

const hero = document.getElementById('home');

if (hero) {
    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Normalize mouse coordinates from -1 to +1 relative to hero div
        mouse.targetX = (x / width) * 2 - 1;
        mouse.targetY = -(y / height) * 2 + 1;
        lastMouseMove = Date.now();
    });

    hero.addEventListener('touchmove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const y = e.touches[0].clientY - rect.top;
        
        mouse.targetX = (x / width) * 2 - 1;
        mouse.targetY = -(y / height) * 2 + 1;
        lastMouseMove = Date.now();
    }, { passive: true });
    
    // Add Gyroscope/Device Orientation Support for Mobile
    window.addEventListener('deviceorientation', (e) => {
        // e.gamma is the left-to-right tilt in degrees (-90 to 90)
        // e.beta is the front-to-back tilt in degrees (-180 to 180)
        if (e.gamma !== null && e.beta !== null) {
            // Increased Sensitivity: Map a smaller tilt (-15 to 15 degrees) to full -1 to 1 offset
            let x = e.gamma / 15; 
            
            // Assume 45 degrees is a neutral resting angle, map (-15 to 15 offset)
            let y = (e.beta - 45) / 15;

            // Clamp values heavily so it doesn't spin out of control if over-tilted
            x = Math.max(-1.5, Math.min(1.5, x));
            y = Math.max(-1.5, Math.min(1.5, y));

            mouse.targetX = x;
            mouse.targetY = -y; // Invert for natural tilt mapping
            lastMouseMove = Date.now();
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    
    // Clear the canvas completely to remove the motion blur effect
    ctx.clearRect(0, 0, width, height);
    
    const now = Date.now();
    
    // If idle for more than 2 seconds, gently sway left to right like a wave
    if (now - lastMouseMove > 2000) {
        mouse.targetX = Math.sin(now * 0.001) * 0.8;
        mouse.targetY = Math.sin(now * 0.0007) * 0.3; // Slight vertical wave for realism
    }
    
    // Smoothly interpolate the current mouse vector toward the target vector
    mouse.x += (mouse.targetX - mouse.x) * 0.03;
    mouse.y += (mouse.targetY - mouse.y) * 0.03;
    
    // Constant slow rotation of the entire particle sphere
    baseRotation += 0.001;
    
    // Combine base rotation with mouse offset for interactivity
    rotationY = baseRotation + mouse.x * 0.6;
    rotationX = -mouse.y * 0.6;
    
    particles.forEach(p => p.draw());
}

animate();
