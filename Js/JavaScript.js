document.addEventListener('DOMContentLoaded', function () {
    // Restore theme preference
    try {
        if (localStorage.getItem('dark') === 'true') document.body.classList.add('dark-theme');
    } catch (e) { }

    // Card expand/collapse
    document.querySelectorAll('.card').forEach(card => {
        const btn = card.querySelector('.learn');
        btn?.addEventListener('click', () => {
            // Close all other cards first
            document.querySelectorAll('.card').forEach(otherCard => {
                if (otherCard !== card && otherCard.classList.contains('expanded')) {
                    otherCard.classList.remove('expanded');
                    const otherDetails = otherCard.querySelector('.details');
                    if (otherDetails) otherDetails.setAttribute('aria-hidden', 'true');
                    const otherBtn = otherCard.querySelector('.learn');
                    if (otherBtn) otherBtn.textContent = 'Learn more';
                    // Reset carousel
                    const carousel = otherCard.querySelector('.card-carousel');
                    if (carousel) {
                        carousel.dataset.current = '0';
                        updateCarousel(carousel);
                    }
                }
            });

            // Toggle current card
            const expanded = card.classList.toggle('expanded');
            const details = card.querySelector('.details');
            if (details) details.setAttribute('aria-hidden', String(!expanded));
            btn.textContent = expanded ? 'Show less' : 'Learn more';
        });
    });

    // Carousel functionality
    function updateCarousel(carousel) {
        if (!carousel) return;
        const images = carousel.querySelectorAll('.carousel-image');
        const current = parseInt(carousel.dataset.current) || 0;

        images.forEach((img, idx) => {
            img.classList.toggle('active', idx === current);
        });

        const indicators = carousel.querySelectorAll('.carousel-indicator');
        indicators.forEach((ind, idx) => {
            ind.classList.toggle('active', idx === current);
        });
    }

    // Initialize carousels with auto-rotate
    document.querySelectorAll('.card-carousel').forEach(carousel => {
        const images = carousel.querySelectorAll('.carousel-image');
        if (images.length === 0) return;

        carousel.dataset.current = '0';
        updateCarousel(carousel);

        // Auto-rotate images every 4 seconds (only when card is expanded)
        const card = carousel.closest('.card');
        let autoRotateInterval;

        const startAutoRotate = () => {
            autoRotateInterval = setInterval(() => {
                const current = parseInt(carousel.dataset.current) || 0;
                carousel.dataset.current = (current + 1) % images.length;
                updateCarousel(carousel);
            }, 4000);
        };

        const stopAutoRotate = () => {
            clearInterval(autoRotateInterval);
        };

        // Manual navigation
        carousel.querySelectorAll('.carousel-indicator').forEach((indicator, idx) => {
            indicator.addEventListener('click', () => {
                carousel.dataset.current = idx;
                updateCarousel(carousel);
                stopAutoRotate();
                startAutoRotate();
            });
        });

        // Watch for card expansion/collapse
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    if (card.classList.contains('expanded')) {
                        startAutoRotate();
                    } else {
                        stopAutoRotate();
                    }
                }
            });
        });

        observer.observe(card, { attributes: true });
    });

    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (href && href.length > 1) {
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault();

                    // Special handling for card links from panel or nav
                    if (targetElement.classList.contains('card') && !targetElement.classList.contains('expanded')) {
                        // Expand the target card
                        targetElement.classList.add('expanded');
                        const details = targetElement.querySelector('.details');
                        if (details) details.setAttribute('aria-hidden', 'false');
                        const btn = targetElement.querySelector('.learn');
                        if (btn) btn.textContent = 'Show less';

                        // Close other cards
                        document.querySelectorAll('.card').forEach(otherCard => {
                            if (otherCard !== targetElement && otherCard.classList.contains('expanded')) {
                                otherCard.classList.remove('expanded');
                                const otherDetails = otherCard.querySelector('.details');
                                if (otherDetails) otherDetails.setAttribute('aria-hidden', 'true');
                                const otherBtn = otherCard.querySelector('.learn');
                                if (otherBtn) otherBtn.textContent = 'Learn more';
                                // Reset carousel
                                const carousel = otherCard.querySelector('.card-carousel');
                                if (carousel) carousel.dataset.current = '0';
                                updateCarousel(carousel);
                            }
                        });

                        // Scroll to the card after a short delay to allow expansion
                        setTimeout(() => {
                            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                    } else {
                        // Normal scroll for non-card elements (like #contact)
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }
        });
    });

    // Side panel interactions
    const sidePanel = document.getElementById('sidePanel');
    const panelTab = document.getElementById('panelTab');
    const openPanelBtn = document.getElementById('openPanelBtn');

    function togglePanel(open) {
        const shouldOpen = (typeof open === 'boolean') ? open : !sidePanel.classList.contains('open');
        sidePanel.setAttribute('aria-hidden', String(!shouldOpen));
        sidePanel.classList.toggle('open', shouldOpen);
    }

    panelTab?.addEventListener('click', () => togglePanel());
    panelTab?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            panelTab.click();
        }
    });

    openPanelBtn?.addEventListener('click', () => togglePanel(true));

    // Topic toggles inside panel
    document.querySelectorAll('.panel-section').forEach(section => {
        const toggle = section.querySelector('.topic-toggle');
        const list = section.querySelector('.topic-list');
        toggle?.addEventListener('click', () => {
            const opening = section.classList.toggle('open');
            if (list) list.setAttribute('aria-hidden', String(!opening));
        });
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidePanel) return;
        const target = e.target;
        if (sidePanel.contains(target) || (panelTab && panelTab.contains(target)) || (openPanelBtn && openPanelBtn.contains(target))) return;
        // click outside -> collapse
        togglePanel(false);
    });
});

// Modal functionality (add this to your existing JavaScript)
const modal = document.getElementById('contactModal');
const contactLink = document.getElementById('contactLink');
const closeModalBtn = document.getElementById('closeModal');

// Open modal
contactLink?.addEventListener('click', (e) => {
    e.preventDefault();
    if (modal) {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
});

// Close modal function
function closeModal() {
    if (modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        // Reset form if needed
        const form = document.getElementById('contactForm');
        if (form) form.reset();
    }
}

closeModalBtn?.addEventListener('click', closeModal);

// Close when clicking outside modal
modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Close with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('open')) {
        closeModal();
    }
});

// Form submission handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: new FormData(contactForm),
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                contactForm.reset();
                submitBtn.textContent = 'Sent Successfully! ✓';
                setTimeout(() => {
                    closeModal();
                    submitBtn.textContent = originalText;
                }, 2000);
            } else {
                alert('Oops! There was a problem sending your message. Please try again.');
                submitBtn.textContent = originalText;
            }
        } catch (error) {
            alert('Oops! There was a problem sending your message. Please try again.');
            submitBtn.textContent = originalText;
        }

        submitBtn.disabled = false;
    });
}