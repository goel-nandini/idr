/**
 * IDR Main Interaction Logic
 */

document.addEventListener('DOMContentLoaded', () => {

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
