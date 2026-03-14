/**
 * IDR Main Interaction Logic
 */

document.addEventListener('DOMContentLoaded', () => {

    /* --- 0. Floating Cube Background Generator --- */
    const cubeBg = document.getElementById('cube-bg');
    const heroSection = document.getElementById('hero');
    const CUBE_COUNT = 18;

    // Spawn cubes into the container
    if (cubeBg) {
        for (let i = 0; i < CUBE_COUNT; i++) {
            const cube = document.createElement('span');
            cube.classList.add('cube');

            // Randomise: size (20px – 90px), x position, animation duration & delay
            const size    = Math.random() * 70 + 20;          // 20 – 90 px
            const leftPos = Math.random() * 100;               // 0 – 100 vw
            // Start cubes at various heights across the full page
            const startTop = Math.random() * 200 + 100;       // 100vh – 300vh from top
            const duration = Math.random() * 30 + 20;         // 20 – 50 s (slow!)
            const delay    = Math.random() * -40;              // stagger so not all start at once

            cube.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${leftPos}vw;
                top: ${startTop}vh;
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
            `;

            cubeBg.appendChild(cube);
        }

        // Show cube-bg only when user scrolls past the hero section
        function updateCubeVisibility() {
            const heroBottom = heroSection ? heroSection.getBoundingClientRect().bottom : 0;
            cubeBg.style.opacity = heroBottom <= 0 ? '1' : '0';
        }

        cubeBg.style.opacity = '0';
        cubeBg.style.transition = 'opacity 0.8s ease';
        window.addEventListener('scroll', updateCubeVisibility, { passive: true });
    }

    /* --- 0b. Hero Particle Canvas --- */
    const canvas = document.getElementById('particle-canvas');
    if (canvas && window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const PARTICLE_COUNT = 60;

        function resizeCanvas() {
            canvas.width  = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Particle constructor
        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x    = Math.random() * canvas.width;
                this.y    = Math.random() * canvas.height;
                this.vx   = (Math.random() - 0.5) * 0.4;
                this.vy   = (Math.random() - 0.5) * 0.4;
                this.size = Math.random() * 2 + 0.5;
                this.alpha = Math.random() * 0.5 + 0.2;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                // Bounce off edges
                if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
                ctx.fill();
            }
        }

        // Initialise particles
        for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

        function drawConnections() {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a + 1; b < particles.length; b++) {
                    const dx   = particles[a].x - particles[b].x;
                    const dy   = particles[a].y - particles[b].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 107, 0, ${0.15 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            drawConnections();
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    /* --- 0c. Animated Counter Numbers --- */
    const statNumbers = document.querySelectorAll('.stat-number');

    function animateCounter(el) {
        const target   = parseInt(el.getAttribute('data-target'));
        const duration = 2000; // ms
        const step     = target / (duration / 16); // ~60fps
        let current    = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = Math.floor(current);
        }, 16);
    }

    // Trigger counters when stats section scrolls into view
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                statNumbers.forEach(animateCounter);
                statsObserver.disconnect(); // Only trigger once
            }
        });
    }, { threshold: 0.3 });

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) statsObserver.observe(statsSection);

    /* --- 0d. 3D Card Tilt Effect --- */
    const tiltCards = document.querySelectorAll('.glass-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect   = card.getBoundingClientRect();
            const x      = e.clientX - rect.left; // mouse X inside card
            const y      = e.clientY - rect.top;  // mouse Y inside card
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8; // max 8deg
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    /* --- 1. Custom Animated Cursor --- */
    const dot = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');
    
    // Check if device supports fine pointing (mouse)
    if(window.matchMedia("(pointer: fine)").matches) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            // Dot follows exactly
            if(dot) {
                dot.style.left = `${posX}px`;
                dot.style.top = `${posY}px`;
            }

            // Outline follows with slight delay due to CSS transition
            if(outline) {
                outline.style.left = `${posX}px`;
                outline.style.top = `${posY}px`;
            }
        });

        // Hover Effect for interactives
        const interactives = document.querySelectorAll('a, button, .glass-card, .timeline-item, .contact-info, .community-list, input, textarea');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('hovering');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('hovering');
            });
        });
    }

    /* --- 2. Sticky Navbar & Active States --- */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    /* --- 3. Ripple Effect for Buttons --- */
    const buttons = document.querySelectorAll('.ripple-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Only calc if click is true mouse click, not enter key
            if (e.clientX === 0 && e.clientY === 0) return;

            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripples = document.createElement('span');
            ripples.style.left = x + 'px';
            ripples.style.top = y + 'px';
            ripples.classList.add('ripple');
            
            const size = Math.max(rect.width, rect.height);
            ripples.style.width = size * 2 + 'px';
            ripples.style.height = size * 2 + 'px';
            ripples.style.transform = "translate(-50%, -50%) scale(0)";

            this.appendChild(ripples);

            setTimeout(() => {
                ripples.remove();
            }, 600);
        });
    });

    /* --- 4. Scroll Animations (Intersection Observer) --- */
    const scrollElements = document.querySelectorAll('.scroll-animate');
    
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px', // trigger slightly before it hits the bottom
            threshold: 0.15 
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Stop observing once animated in
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        scrollElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for older browsers
        scrollElements.forEach(el => el.classList.add('is-visible'));
    }

    /* --- 5. Parallax Hero Background Effect --- */
    const sphere1 = document.querySelector('.sphere-1');
    const sphere2 = document.querySelector('.sphere-2');
    
    if(sphere1 && sphere2 && window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
        window.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;

            // Move spheres slightly opposite to mouse direction
            const moveX1 = (mouseX - 0.5) * -50;
            const moveY1 = (mouseY - 0.5) * -50;
            const moveX2 = (mouseX - 0.5) * 40;
            const moveY2 = (mouseY - 0.5) * 40;

            window.requestAnimationFrame(() => {
                sphere1.style.transform = `translate(${moveX1}px, ${moveY1}px)`;
                sphere2.style.transform = `translate(${moveX2}px, ${moveY2}px)`;
            });
        });
    }

    /* --- 6. Smooth Scroll for Anchor Links --- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                // Account for fixed navbar height
                const navHeight = navbar.getBoundingClientRect().height;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    /* --- 7. Basic Form Handling --- */
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('form-message');

    if(contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Validate basic inputs manually if needed
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = "Sending...";
            submitBtn.disabled = true;

            // Simulate Network Request / Success
            setTimeout(() => {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                contactForm.reset();
                
                formMessage.style.display = 'block';
                formMessage.innerText = 'Thank you! Your inquiry has been received. IDR will be in touch shortly.';
                
                setTimeout(() => {
                    formMessage.style.display = 'none';
                }, 5000);
            }, 1500);
        });
    }

    /* --- 8. Typing Text Animation --- */
    const typeTextElement = document.querySelector('.type-text');
    const textArray = ["Digital Risk.", "Cyber Security.", "AI Governance.", "Tech Resilience."];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeDelay = 120;

    function typeEffect() {
        if(!typeTextElement) return;

        const currentText = textArray[textIndex];
        
        if (isDeleting) {
            typeTextElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typeDelay = 50; // Delete faster
        } else {
            typeTextElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typeDelay = 120; // Type speed
        }

        // Handle pause at ends
        if (!isDeleting && charIndex === currentText.length) {
            isDeleting = true;
            typeDelay = 2000; // Pause at end of word
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % textArray.length; // Move to next word
            typeDelay = 400; // Pause before new word
        }

        setTimeout(typeEffect, typeDelay);
    }
    
    // Start typing after initial load delay
    setTimeout(typeEffect, 500);

});
