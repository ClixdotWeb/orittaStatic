// --- Interactive Particle System on Canvas ---
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particlesArray = [];
let mouse = {
    x: null,
    y: null,
    radius: 120 // Range of mouse interaction
};

// Handle window resizing
window.addEventListener('resize', () => {
    resizeCanvas();
});

// Track mouse movement
window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

// Clear mouse coordinates when leaving screen
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
}

// Particle Class
class Particle {
    constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
        this.baseSize = size;
    }

    // Draw individual particle
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    // Update particle position and behavior
    update() {
        // Bounce off walls
        if (this.x > canvas.width || this.x < 0) {
            this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
            this.directionY = -this.directionY;
        }

        // Mouse interaction (move away slightly)
        if (mouse.x !== null && mouse.y !== null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                const force = (mouse.radius - distance) / mouse.radius;
                const forceX = (dx / distance) * force * 3;
                const forceY = (dy / distance) * force * 3;
                
                this.x -= forceX;
                this.y -= forceY;
                
                // Grow slightly when mouse is near
                if (this.size < this.baseSize * 1.5) {
                    this.size += 0.1;
                }
            } else {
                if (this.size > this.baseSize) {
                    this.size -= 0.1;
                }
            }
        }

        // Move particle
        this.x += this.directionX;
        this.y += this.directionY;

        this.draw();
    }
}

// Initialise particles array
function initParticles() {
    particlesArray = [];
    // Number of particles dependent on screen width
    let numberOfParticles = Math.floor((canvas.width * canvas.height) / 13000);
    if (numberOfParticles > 120) numberOfParticles = 120;
    if (numberOfParticles < 30) numberOfParticles = 30;

    for (let i = 0; i < numberOfParticles; i++) {
        let size = Math.random() * 2 + 1;
        let x = Math.random() * (canvas.width - size * 2) + size;
        let y = Math.random() * (canvas.height - size * 2) + size;
        let directionX = (Math.random() * 0.6) - 0.3;
        let directionY = (Math.random() * 0.6) - 0.3;
        
        // Use soft green particles suitable for light background
        let color = `rgba(46, 125, 50, ${Math.random() * 0.2 + 0.2})`;

        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
}

// Draw lines connecting close particles
function connectParticles() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let dx = particlesArray[a].x - particlesArray[b].x;
            let dy = particlesArray[a].y - particlesArray[b].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            // Connect if close enough
            const maxDistance = 120;
            if (distance < maxDistance) {
                opacityValue = 1 - (distance / maxDistance);
                ctx.strokeStyle = `rgba(46, 125, 50, ${opacityValue * 0.12})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update standard background particles
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    
    // Connect particles
    connectParticles();

    requestAnimationFrame(animate);
}

// Run canvas setup
resizeCanvas();
animate();
