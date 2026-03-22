document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Navbar
    const nav = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinksContainer = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links a');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navLinksContainer.classList.toggle('active');
        });

        // Close menu when link is clicked
        navLinksItems.forEach(item => {
            item.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navLinksContainer.classList.remove('active');
            });
        });
    }

    // 2. Hero Scroll Parallax (Multiple Layers)
    const parallaxBg = document.querySelector('.hero-bg');
    const parallaxElements = document.querySelectorAll('.parallax-element');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;

        // Background Parallax (Very Slow)
        if (parallaxBg) {
            parallaxBg.style.transform = `translateY(${scrolled * 0.15}px)`;
        }

        // Foreground Elements Parallax
        parallaxElements.forEach(el => {
            const speed = el.getAttribute('data-speed') || 0.3;
            el.style.transform = `translateY(-${scrolled * speed}px)`;
        });

        // 9. Paletas Dynamic Background Parallax (Subida y Caida)
        const parallaxBanner = document.querySelector('.parallax-banner');
        if (parallaxBanner) {
            const rect = parallaxBanner.getBoundingClientRect();
            // Check if element is in viewport
            if (rect.top <= window.innerHeight && rect.bottom >= 0) {
                // Calculate distance scrolled past the element's original top
                const elementTop = parallaxBanner.offsetTop;
                const distance = scrolled - elementTop;
                
                // Adjusting background-position-y creates the sliding up/down effect physically
                parallaxBanner.style.backgroundPositionY = `${distance * 0.5}px`;
            }
        }
    });

    // 3. Carousel Center Mode Logic
    const track = document.querySelector('.carousel-track');
    if (track) {
        const slides = Array.from(document.querySelectorAll('.carousel-slide'));
        const nextBtn = document.querySelector('.next-btn');
        const prevBtn = document.querySelector('.prev-btn');
        const dotsContainer = document.querySelector('.carousel-dots');
        const seasonalSubtitle = document.getElementById('seasonal-subtitle');

        let currentIndex = 0;

        // Create dots
        slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });

        const dots = Array.from(document.querySelectorAll('.dot'));

        function updateCarousel() {
            // Simple translation based on percentage
            track.style.transform = `translateX(-${currentIndex * 100}%)`;

            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === currentIndex);
            });

            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });

            // Update seasonal subtitle
            const activeSlide = slides[currentIndex];
            const season = activeSlide.getAttribute('data-season'); // spring, summer, autumn
            if (seasonalSubtitle) {
                const translationKey = `seasonal.${season.toLowerCase()}`;
                const translatedSeason = (window.siteTranslator && window.siteTranslator.getValue) 
                    ? window.siteTranslator.getValue(translationKey) 
                    : season;
                
                seasonalSubtitle.innerText = translatedSeason;
                seasonalSubtitle.style.animation = 'none';
                seasonalSubtitle.offsetHeight; // trigger reflow
                seasonalSubtitle.style.animation = 'fadeIn 0.5s ease-out';
            }
        }

        function goToSlide(index) {
            currentIndex = index;
            updateCarousel();
        }

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel();
        });

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateCarousel();
        });

        // Auto change carousel
        setInterval(() => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel();
        }, 4000);

        // Initial positioning
        window.addEventListener('resize', updateCarousel);
        updateCarousel();
    }

    // 4. Active Link Logic (Multi-page & Scroll)
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');
    function setActiveLink() {
        const navLinks = document.querySelectorAll('.nav-links a');
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            // Remove active class from all
            link.classList.remove('active');
            
            // Add active class only to the link matching the current filename
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }

    // Only run on load, no scroll listener for active links
    setActiveLink();

    // 5. Rotating images in history section
    function setupRotatingImages() {
        const leftColumn = document.querySelector('.left-images');
        const rightColumn = document.querySelector('.right-images');

        if (!leftColumn || !rightColumn) return;

        const leftImgs = Array.from(leftColumn.querySelectorAll('.rotating-img'));
        const rightImgs = Array.from(rightColumn.querySelectorAll('.rotating-img'));

        let rotationIndex = 0;

        function rotate() {
            leftImgs.forEach((img, i) => {
                img.style.opacity = i === rotationIndex ? '1' : '0.3';
                img.style.transform = i === rotationIndex ? 'scale(1)' : 'scale(0.9)';
            });
            rightImgs.forEach((img, i) => {
                img.style.opacity = i === (rotationIndex + 1) % rightImgs.length ? '1' : '0.3';
                img.style.transform = i === (rotationIndex + 1) % rightImgs.length ? 'scale(1)' : 'scale(0.9)';
            });

            rotationIndex = (rotationIndex + 1) % leftImgs.length;
        }

        setInterval(rotate, 3000);
        rotate();
    }

    setupRotatingImages();

    // 6. Intersection Observer for Scroll Animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-up').forEach(el => {
        observer.observe(el);
    });

    // Add revealed class style dynamically if not in CSS
    const style = document.createElement('style');
    style.innerHTML = `
        .reveal-up { opacity: 0; transform: translateY(30px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .reveal-up.revealed { opacity: 1; transform: translateY(0); }
    `;
    document.head.appendChild(style);

    // 7. Product Modal Logic
    const productCards = document.querySelectorAll('.product-card');
    const modalOverlay = document.getElementById('product-modal');
    
    if (productCards.length > 0 && modalOverlay) {
        const modalClose = document.querySelector('.modal-close');
        const modalImg = document.getElementById('modal-img');
        const modalTitle = document.getElementById('modal-title');
        const modalDesc = document.getElementById('modal-desc');
        const modalWhatsapp = document.getElementById('modal-whatsapp');
        const qtyInput = document.getElementById('product-quantity');

        const waNumber = '5219993960148';
        let currentWaProduct = '';
        let currentImgUrl = '';

        const updateWaLink = () => {
            const qty = qtyInput ? qtyInput.value : 1;
            const waMessage = encodeURIComponent(`Hola, me gustaría pedir:\nProducto: ${currentWaProduct}\nCantidad: ${qty} unidades\nImagen del producto: ${currentImgUrl}`);
            modalWhatsapp.href = `https://wa.me/${waNumber}?text=${waMessage}`;
        };

        if (qtyInput) {
            qtyInput.addEventListener('input', updateWaLink);
            qtyInput.addEventListener('change', updateWaLink);
        }

        productCards.forEach(card => {
            card.addEventListener('click', () => {
                const title = card.getAttribute('data-title');
                const img = card.getAttribute('data-img');
                const desc = card.getAttribute('data-desc');
                currentWaProduct = card.getAttribute('data-whatsapp') || title;

                modalImg.src = img;
                modalTitle.textContent = title;
                modalDesc.textContent = desc;

                if (qtyInput) qtyInput.value = 1;

                // Generamos la URL absoluta para que la imagen se vea en WhatsApp si la web está en línea
                currentImgUrl = new URL(img, window.location.href).href;
                
                updateWaLink();

                modalOverlay.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            });
        });

        const closeModal = () => {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        modalClose.addEventListener('click', closeModal);

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // 8. View All Products Logic (Dynamic for multiple sections)
    const viewAllLinks = document.querySelectorAll('.view-all-link');
    
    viewAllLinks.forEach(viewAllLink => {
        // Find the parent section containing this specific link
        const sectionContainer = viewAllLink.closest('.highlights');
        if (!sectionContainer) return;

        const hideAllLink = sectionContainer.querySelector('.hide-all-link');
        const extraCards = sectionContainer.querySelectorAll('.extra-card');
        
        if (viewAllLink && hideAllLink && extraCards.length > 0) {
            viewAllLink.addEventListener('click', (e) => {
                e.preventDefault();
                viewAllLink.style.display = 'none';

                extraCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.style.display = 'flex';
                        void card.offsetWidth;
                        card.classList.add('show');
                    }, index * 40); 
                });

                // Show 'hide link' once all animations have fired
                setTimeout(() => {
                    hideAllLink.style.display = 'inline-flex';
                }, extraCards.length * 40 + 100);
            });

            hideAllLink.addEventListener('click', (e) => {
                e.preventDefault();
                hideAllLink.style.display = 'none';
                viewAllLink.style.display = 'inline-flex';

                // Hide cards smoothly
                extraCards.forEach((card) => {
                    card.classList.remove('show');
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 500); // Wait for CSS opacity/transform transition to complete
                });

                // Scroll back to the top of this specific section grid smoothly
                const headerOffset = 100;
                const elementPosition = sectionContainer.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                     top: offsetPosition,
                     behavior: "smooth"
                });
            });
        }
    });
});
