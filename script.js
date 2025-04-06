document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const header = document.getElementById('header');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenuCloseButton = document.getElementById('mobile-menu-close-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const navLinks = document.querySelectorAll('.nav-link');
    const contactForm = document.getElementById('contact-form');
    const sections = document.querySelectorAll('section[id]');
    const currentTimeContactEl = document.getElementById('current-time-contact');
    const currentYearEls = [ document.getElementById('current-year-footer') ];
    const filterContainer = document.getElementById('project-filters');
    const projectGrid = document.getElementById('project-grid');
    const projectCards = projectGrid ? Array.from(projectGrid.querySelectorAll('.project-card')) : [];
    const preloader = document.getElementById('preloader'); // Get preloader

    // --- Preloader Logic ---
    if (preloader) {
        window.addEventListener('load', () => {
            preloader.classList.add('preloader-hidden');
            // Optional: Remove the element after transition
            setTimeout(() => {
                if (preloader.parentNode) {
                    preloader.parentNode.removeChild(preloader);
                }
            }, 600); // Match CSS transition duration + buffer
        });
        // Optional: Add a fallback timeout
        // setTimeout(() => { if (!preloader.classList.contains('preloader-hidden')) { /* ... hide anyway ... */ } }, 8000);
    } else {
        console.warn("Preloader element #preloader not found!"); // Use warn instead of error
    }

    // --- Functions ---
    const handleHeaderScroll = () => {
        const isScrolled = window.scrollY > 50;
        header.classList.toggle('scrolled', isScrolled);
    };

    const toggleMobileMenu = (forceOpen = null) => {
        const isOpen = forceOpen !== null ? forceOpen : !mobileMenu.classList.contains('open');
        mobileMenu.classList.toggle('open', isOpen);
        mobileMenu.setAttribute('aria-hidden', (!isOpen).toString());
        mobileMenuOverlay.classList.toggle('hidden', !isOpen);
        setTimeout(() => {
            mobileMenuOverlay.classList.toggle('opacity-100', isOpen);
            mobileMenuOverlay.classList.toggle('opacity-0', !isOpen);
        }, 10);
        document.body.style.overflow = isOpen ? 'hidden' : '';
        mobileMenuButton.setAttribute('aria-expanded', isOpen.toString());
    };

    const handleScrollspy = () => {
        let currentSectionId = '';
        const headerHeight = header.offsetHeight || 80;
        const scrollPosition = window.scrollY + headerHeight + 150;
        sections.forEach(section => {
            if (section.offsetParent !== null) {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    currentSectionId = section.getAttribute('id');
                }
            }
        });
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
            currentSectionId = sections[sections.length - 1].id;
        } else if (window.scrollY < sections[0].offsetTop - headerHeight) {
             currentSectionId = '';
        }
        navLinks.forEach(link => {
            const parentNav = link.closest('#mobile-menu nav, #header nav');
            if(parentNav) {
                const linkHref = link.getAttribute('href');
                const isActive = linkHref === `#${currentSectionId}`;
                link.classList.toggle('active', isActive);
            }
        });
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        const intersectingEntries = entries.filter(entry => entry.isIntersecting);
        intersectingEntries.forEach((entry, index) => {
             if (!entry.target.classList.contains('visible')) {
                 const delayClass = Array.from(entry.target.classList).find(cls => cls.startsWith('animation-delay-'));
                 if (!delayClass) {
                      const delay = index * 100;
                      entry.target.style.transitionDelay = `${delay}ms`;
                 }
                 entry.target.classList.add('visible');
                 observer.unobserve(entry.target);
             }
        });
    }, { root: null, threshold: 0.1 });

    const revealItems = document.querySelectorAll('.reveal-item');
    revealItems.forEach(item => {
        const style = window.getComputedStyle(item);
        if (style.opacity === '0') {
             if (item.classList.contains('from-left')) item.style.transform = 'translateX(-30px)';
             else if (item.classList.contains('from-right')) item.style.transform = 'translateX(30px)';
             else if (item.classList.contains('zoom-in')) item.style.transform = 'scale(0.9)';
             else if (style.transform === 'none') item.style.transform = 'translateY(20px)';
             revealObserver.observe(item);
        } else {
            item.classList.add('visible'); item.style.transform = 'none';
        }
         if (item.classList.contains('visible')) { revealObserver.unobserve(item); }
    });

    const handleProjectFilter = (e) => {
        if (!filterContainer || !e.target.matches('.filter-btn')) return; // Add check for filterContainer
        const filterButtons = filterContainer.querySelectorAll('.filter-btn');
        const selectedFilter = e.target.dataset.filter;
        filterButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        let visibleCardIndex = 0;
        projectCards.forEach((card) => {
            const tags = card.dataset.tags ? card.dataset.tags.split(' ') : [];
            const shouldShow = selectedFilter === 'all' || tags.includes(selectedFilter);
            card.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
            card.style.transitionDelay = '0ms';
            if (shouldShow) {
                if(card.classList.contains('hidden')) { card.style.opacity = '0'; card.style.transform = 'scale(0.95) translateY(10px)'; card.classList.remove('hidden'); }
                 card.style.transitionDelay = `${visibleCardIndex * 75}ms`; visibleCardIndex++;
                 setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'scale(1) translateY(0)'; }, 10);
            } else {
                 card.style.opacity = '0'; card.style.transform = 'scale(0.95) translateY(10px)';
                 setTimeout(() => {
                     const currentFilterBtn = filterContainer?.querySelector('.filter-btn.active'); // Optional chaining
                     if (currentFilterBtn) {
                         const currentFilter = currentFilterBtn.dataset.filter;
                         const currentTags = card.dataset.tags ? card.dataset.tags.split(' ') : [];
                         if (currentFilter !== 'all' && !currentTags.includes(currentFilter)) { card.classList.add('hidden'); }
                     } else { card.classList.add('hidden'); }
                 }, 400);
            }
        });
    };

    const handleContactForm = (e) => {
        e.preventDefault();
        const formButton = e.target.querySelector('button[type="submit"]');
        const originalButtonContent = formButton.innerHTML;
        formButton.innerHTML = `<span class="relative z-10">Sending... <i class="fas fa-spinner fa-spin ml-2"></i></span>`;
        formButton.disabled = true;
        // Replace with your actual form submission logic (e.g., fetch)
        setTimeout(() => {
            console.log('Form Data (Placeholder):', Object.fromEntries(new FormData(contactForm)));
            const success = Math.random() > 0.2; // Simulate
            if (success) { alert('Message sent successfully! (Placeholder)'); contactForm.reset(); }
            else { alert('Error sending message. Please try again. (Placeholder)'); }
            formButton.innerHTML = originalButtonContent; formButton.disabled = false;
        }, 1500);
    };

    const updateTimeAndYear = () => {
        const now = new Date();
        const timeOptions = { timeZone: 'Asia/Colombo', hour: 'numeric', minute: '2-digit', hour12: true };
        let formattedTime = '--:--';
        try { formattedTime = now.toLocaleTimeString('en-LK', timeOptions); }
        catch (e) { formattedTime = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }); /* console.warn(...) */ }
        // if (currentTimeEl) currentTimeEl.textContent = formattedTime; // Removed from HTML
        if (currentTimeContactEl) currentTimeContactEl.textContent = formattedTime;
        const currentYear = now.getFullYear();
        currentYearEls.forEach(el => { if (el) el.textContent = currentYear; });
     };

    // --- Event Listeners ---
    window.addEventListener('scroll', handleScrollspy, { passive: true });
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    window.addEventListener('resize', handleHeaderScroll);
    if (mobileMenuButton) mobileMenuButton.addEventListener('click', () => toggleMobileMenu(true));
    if (mobileMenuCloseButton) mobileMenuCloseButton.addEventListener('click', () => toggleMobileMenu(false));
    if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', () => toggleMobileMenu(false));
    if (mobileMenu) mobileMenu.addEventListener('click', (e) => { if (e.target.matches('.nav-link')) { toggleMobileMenu(false); } });
    if (filterContainer) { filterContainer.addEventListener('click', handleProjectFilter); } else { console.warn("#project-filters not found."); }
    if (contactForm) { contactForm.addEventListener('submit', handleContactForm); } else { console.warn("#contact-form not found."); }

    // --- Initializations ---
    handleHeaderScroll();
    setTimeout(handleScrollspy, 100); // Initial check after layout settles
    updateTimeAndYear(); // Initial time/year set
    setInterval(updateTimeAndYear, 60000); // Update time every minute

}); // End DOMContentLoaded