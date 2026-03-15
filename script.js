document.addEventListener('DOMContentLoaded', () => {
    
    /* =========================================
       1. Form Handling
       ========================================= */
    const leadForm = document.getElementById('lead-form');
    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // In a real scenario, handle fetch/ajax submission here.
            alert('Thank you for your inquiry! I will get back to you shortly.');
            leadForm.reset();
        });
    }

    /* =========================================
       2. Background Glow Animation
       ========================================= */
    const bgGlow = document.querySelector('.background-glow');

    if (bgGlow && window.matchMedia("(pointer: fine)").matches) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            // Animate the background glow to follow the mouse smoothly
            bgGlow.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 800, fill: "forwards" });
        });
    }
    // ... (Theme and Form handling code continues above)
    // Removed because we are appending, keep existing code.
    
    /* =========================================
       3. Mobile Menu Toggle
       ========================================= */
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.querySelector('.nav-list');
    const mobileIcon = mobileToggle.querySelector('i');

    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        if (navMenu.classList.contains('active')) {
            mobileIcon.classList.remove('fa-bars');
            mobileIcon.classList.add('fa-xmark');
        } else {
            mobileIcon.classList.remove('fa-xmark');
            mobileIcon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileIcon.classList.remove('fa-xmark');
            mobileIcon.classList.add('fa-bars');
        });
    });

    /* =========================================
       4. Header Background on Scroll & Active Links
       ========================================= */
    const header = document.getElementById('header');
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        // Add shadow to header on scroll
        if (window.scrollY > 50) {
            header.style.boxShadow = 'var(--shadow-sm)';
        } else {
            header.style.boxShadow = 'none';
        }

        // Highlight active link
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active'); // Needs corresponding CSS if desired, currently uses hover state pseudo-element
            }
        });
    });

    /* =========================================
       5. Scroll Reveal Animations
       ========================================= */
    // Add reveal class to specific elements
    const revealElements = document.querySelectorAll('.section-title, .section-desc, .service-card, .portfolio-card, .testimonial-card, .pricing-card, .about-content, .contact-container > div');
    
    revealElements.forEach(el => {
        el.classList.add('reveal');
    });

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Stop observing once revealed
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    /* =========================================
       6. Project Detail Modal (Popup)
       ========================================= */
    const modal = document.getElementById('project-modal');
    const modalClose = document.getElementById('modal-close');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalTags = document.getElementById('modal-tags');
    
    const projectBtns = document.querySelectorAll('.view-project-btn');

    if (modal && projectBtns.length > 0) {
        projectBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const card = btn.closest('.portfolio-card');
                
                // Extract data from card attributes
                const title = card.getAttribute('data-title');
                const desc = card.getAttribute('data-desc');
                const imgUrl = card.getAttribute('data-img');
                const tagsStr = card.getAttribute('data-tags');
                
                // Populate Modal
                if (title) modalTitle.textContent = title;
                if (desc) modalDesc.textContent = desc;
                if (imgUrl) modalImg.src = imgUrl;
                
                // Handle Tags
                if (tagsStr) {
                    try {
                        const tags = JSON.parse(tagsStr);
                        modalTags.innerHTML = '';
                        tags.forEach(tag => {
                            const span = document.createElement('span');
                            span.textContent = tag;
                            modalTags.appendChild(span);
                        });
                    } catch(e) { console.error("Error parsing tags", e); }
                }

                // Show Modal
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            });
        });

        // Close Modal Logic
        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        };

        modalClose.addEventListener('click', closeModal);
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    }
});
