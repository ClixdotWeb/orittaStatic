// --- Interactive Particle System on Canvas ---
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particlesArray = [];
let confettiArray = [];
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

// Confetti Particle Class for Form Submission Success
class ConfettiParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 6 + 4;
        this.speedX = Math.random() * 8 - 4;
        this.speedY = Math.random() * -10 - 5; // Launch upward
        this.gravity = 0.3;
        
        // Randomly pick gold or emerald green
        const colors = ['#4caf50', '#81c784', '#2e7d32', '#ffb74d', '#ff9800', '#ffe082'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
        this.opacity = 1;
        this.fadeSpeed = Math.random() * 0.01 + 0.008;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        // Draw small rectangles or circles
        if (Math.random() > 0.5) {
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    update() {
        this.speedY += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        this.opacity -= this.fadeSpeed;
        
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
        
        // Use soft green particles
        let color = `rgba(76, 175, 80, ${Math.random() * 0.3 + 0.15})`;

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
                ctx.strokeStyle = `rgba(76, 175, 80, ${opacityValue * 0.08})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

// Trigger Confetti Blast from coordinates
function triggerConfetti(x, y) {
    for (let i = 0; i < 150; i++) {
        confettiArray.push(new ConfettiParticle(x, y));
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

    // Update active confetti particles
    for (let i = confettiArray.length - 1; i >= 0; i--) {
        confettiArray[i].update();
        if (confettiArray[i].opacity <= 0) {
            confettiArray.splice(i, 1);
        }
    }

    requestAnimationFrame(animate);
}

// Run canvas setup
resizeCanvas();
animate();


// --- Countdown Timer Code ---
// Set Launch Date: August 15, 2026, 09:00 AM IST
const targetLaunchDate = new Date('August 15, 2026 09:00:00').getTime();

const daysVal = document.getElementById('days');
const hoursVal = document.getElementById('hours');
const minutesVal = document.getElementById('minutes');
const secondsVal = document.getElementById('seconds');

function updateCountdown() {
    const now = new Date().getTime();
    const difference = targetLaunchDate - now;

    // If countdown is finished
    if (difference <= 0) {
        daysVal.innerText = '00';
        hoursVal.innerText = '00';
        minutesVal.innerText = '00';
        secondsVal.innerText = '00';
        clearInterval(countdownInterval);
        return;
    }

    // Time calculations
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    // Render values with padded leading zero
    daysVal.innerText = days < 10 ? '0' + days : days;
    hoursVal.innerText = hours < 10 ? '0' + hours : hours;
    minutesVal.innerText = minutes < 10 ? '0' + minutes : minutes;
    secondsVal.innerText = seconds < 10 ? '0' + seconds : seconds;
}

// Initial fire and run interval
updateCountdown();
const countdownInterval = setInterval(updateCountdown, 1000);


// --- Notify Me Form & Modal Handling ---
const notifyForm = document.getElementById('notify-form');
const emailInput = document.getElementById('email-input');
const formFeedback = document.getElementById('form-feedback');
const successModal = document.getElementById('success-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const submitBtn = notifyForm.querySelector('.submit-btn');
const submitBtnText = submitBtn.querySelector('span');
const submitBtnIcon = submitBtn.querySelector('i');

notifyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    
    // Clear previous feedbacks
    formFeedback.innerText = '';
    formFeedback.className = 'form-feedback';

    // Email verification regex
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email) {
        showFeedback('Please enter an email address.', 'error');
        return;
    }

    if (!emailPattern.test(email)) {
        showFeedback('Please enter a valid email address.', 'error');
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitBtnText.innerText = 'Registering...';
    submitBtnIcon.className = 'fa-solid fa-spinner fa-spin btn-icon';
    emailInput.disabled = true;

    // Simulate server side request
    setTimeout(() => {
        // Reset button states
        submitBtn.disabled = false;
        submitBtnText.innerText = 'Notify Me';
        submitBtnIcon.className = 'fa-solid fa-arrow-right-long btn-icon';
        emailInput.disabled = false;

        // Display success state
        emailInput.value = ''; // Reset input
        
        // Show modal
        successModal.classList.add('active');
        
        // Trigger particle confetti from button position
        const btnRect = submitBtn.getBoundingClientRect();
        triggerConfetti(btnRect.left + btnRect.width / 2, btnRect.top + btnRect.height / 2);
    }, 1500);
});

// Clear error on input change
emailInput.addEventListener('input', () => {
    if (formFeedback.classList.contains('error')) {
        formFeedback.innerText = '';
        formFeedback.className = 'form-feedback';
    }
});

// Modal close action
closeModalBtn.addEventListener('click', () => {
    successModal.classList.remove('active');
});

// Close modal when clicking outer overlay
successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
        successModal.classList.remove('active');
    }
});

function showFeedback(message, type) {
    formFeedback.innerText = message;
    formFeedback.className = `form-feedback ${type}`;
}
