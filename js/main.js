document.addEventListener('DOMContentLoaded', () => {
    // === 1. Sticky Navbar ===
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

        navLinksItems.forEach(item => {
            item.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navLinksContainer.classList.remove('active');
            });
        });
    }

    // === 2. Hero Scroll Parallax ===
    const parallaxBg = document.querySelector('.hero-bg');
    const parallaxElements = document.querySelectorAll('.parallax-element');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (parallaxBg) {
            parallaxBg.style.transform = `translateY(${scrolled * 0.15}px)`;
        }
        parallaxElements.forEach(el => {
            const speed = el.getAttribute('data-speed') || 0.3;
            el.style.transform = `translateY(-${scrolled * speed}px)`;
        });

        const parallaxBanner = document.querySelector('.parallax-banner');
        if (parallaxBanner) {
            const rect = parallaxBanner.getBoundingClientRect();
            if (rect.top <= window.innerHeight && rect.bottom >= 0) {
                const elementTop = parallaxBanner.offsetTop;
                const distance = scrolled - elementTop;
                parallaxBanner.style.backgroundPositionY = `${distance * 0.5}px`;
            }
        }
    });

    // === 3. Carousel Center Mode Logic ===
    const track = document.querySelector('.carousel-track');
    if (track) {
        const slides = Array.from(document.querySelectorAll('.carousel-slide'));
        const nextBtn = document.querySelector('.next-btn');
        const prevBtn = document.querySelector('.prev-btn');
        const dotsContainer = document.querySelector('.carousel-dots');
        const seasonalSubtitle = document.getElementById('seasonal-subtitle');

        let currentIndex = 0;

        slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });

        const dots = Array.from(document.querySelectorAll('.dot'));

        function updateCarousel() {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            slides.forEach((slide, i) => slide.classList.toggle('active', i === currentIndex));
            dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));

            const activeSlide = slides[currentIndex];
            const season = activeSlide.getAttribute('data-season');
            if (seasonalSubtitle) {
                const translationKey = `seasonal.${season.toLowerCase()}`;
                const translatedSeason = (window.siteTranslator && window.siteTranslator.getValue) 
                    ? window.siteTranslator.getValue(translationKey) 
                    : season;
                
                seasonalSubtitle.innerText = translatedSeason;
                seasonalSubtitle.style.animation = 'none';
                seasonalSubtitle.offsetHeight; 
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

        setInterval(() => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel();
        }, 4000);

        window.addEventListener('resize', updateCarousel);
        updateCarousel();
    }

    // === 4. Product Modal & Cart Logic ===
    const productCards = document.querySelectorAll('.product-card');
    const modalOverlay = document.getElementById('product-modal');
    const cartModal = document.getElementById('cart-modal');
    const cartBtn = document.getElementById('cart-btn');
    const cartCount = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartSummary = document.getElementById('cart-summary');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const emptyCartBtn = document.getElementById('empty-cart-btn');
    const cartWaBtn = document.getElementById('cart-whatsapp-btn');
    
    let cart = JSON.parse(localStorage.getItem('casfrela_cart')) || [];
    const waNumber = '5219993960148';

    // Update Cart UI
    const updateCartUI = () => {
        if (!cartCount) return;
        
        const totalItems = cart.reduce((acc, item) => acc + parseInt(item.quantity), 0);
        cartCount.textContent = totalItems;
        
        if (cartItemsContainer) {
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = `
                    <div class="empty-cart-msg">
                        <span class="empty-icon">🛒</span>
                        <h3 data-i18n="cart.empty_title">${window.siteTranslator ? window.siteTranslator.getValue('cart.empty_title') : '¡Tu carrito está vacío!'}</h3>
                        <p data-i18n="cart.empty">${window.siteTranslator ? window.siteTranslator.getValue('cart.empty') : 'Agrega algunos deliciosos helados para comenzar.'}</p>
                    </div>`;
                cartSummary.style.display = 'none';
            } else {
                cartItemsContainer.innerHTML = '';
                let total = 0;
                
                cart.forEach((item, index) => {
                    const subtotal = item.price * item.quantity;
                    total += subtotal;
                    
                    const itemEl = document.createElement('div');
                    itemEl.className = 'cart-item';
                    itemEl.innerHTML = `
                        <div class="cart-item-info" style="display: flex; align-items: center; gap: 12px; flex: 1;">
                            <img src="${item.img}" class="cart-item-img">
                            <div>
                                <h4>${item.title}</h4>
                                <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px; justify-content: flex-end;">
                            <p class="cart-item-price">$${subtotal.toFixed(2)}</p>
                            <button class="remove-item-btn" data-index="${index}" title="${window.siteTranslator ? window.siteTranslator.getValue('cart.remove') : 'Eliminar'}">
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    `;
                    cartItemsContainer.appendChild(itemEl);
                });
                
                cartTotalPrice.textContent = `$${total.toFixed(2)}`;
                cartSummary.style.display = 'block';
                
                // Add remove listeners
                document.querySelectorAll('.remove-item-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const idx = e.currentTarget.getAttribute('data-index');
                        cart.splice(idx, 1);
                        saveCart();
                        updateCartUI();
                    });
                });
                
                // Update WhatsApp Link for Entire Cart
                let waMessage = encodeURIComponent("Hola, me gustaría hacer el siguiente pedido:\n\n");
                cart.forEach(item => {
                    waMessage += encodeURIComponent(`- ${item.title} x ${item.quantity} ($${(item.price * item.quantity).toFixed(2)})\n`);
                });
                waMessage += encodeURIComponent(`\n*Total: $${total.toFixed(2)}*`);

                const shippingCheckbox = document.getElementById('shipping-checkbox');
                if (shippingCheckbox && shippingCheckbox.checked) {
                    const shippingMsg = window.siteTranslator ? window.siteTranslator.getValue('cart.shipping_request_wa') : 'Requiero envío y quiero saber el precio del envío.';
                    waMessage += encodeURIComponent(`\n\n${shippingMsg}`);
                }
                
                cartWaBtn.href = `https://wa.me/${waNumber}?text=${waMessage}`;
            }
        }
        localStorage.setItem('casfrela_cart', JSON.stringify(cart));
    };

    const saveCart = () => localStorage.setItem('casfrela_cart', JSON.stringify(cart));

    if (cartBtn) cartBtn.addEventListener('click', () => {
        cartModal.classList.add('active');
        document.body.classList.add('modal-open');
        updateCartUI();
        
        // Add listener for shipping checkbox once it's visible/rendered
        const shippingCheckbox = document.getElementById('shipping-checkbox');
        if (shippingCheckbox && !shippingCheckbox.dataset.listenerAdded) {
            shippingCheckbox.addEventListener('change', updateCartUI);
            shippingCheckbox.dataset.listenerAdded = "true";
        }
    });

    if (emptyCartBtn) emptyCartBtn.addEventListener('click', () => {
        showCustomConfirm(
            window.siteTranslator ? window.siteTranslator.getValue('cart.confirm_clear_title') : '¿Vaciar Carrito?',
            window.siteTranslator ? window.siteTranslator.getValue('cart.confirm_clear') : '¿Estás seguro de que quieres quitar todos los productos?',
            () => {
                cart = [];
                saveCart();
                updateCartUI();
            }
        );
    });

    const showCustomConfirm = (title, msg, onConfirm) => {
        const dialog = document.createElement('div');
        dialog.style = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100000000; backdrop-filter: blur(5px); animation: fadeIn 0.3s;';
        dialog.innerHTML = `
            <div style="background: white; padding: 40px; border-radius: 24px; max-width: 400px; width: 90%; text-align: center; box-shadow: 0 20px 70px rgba(0,0,0,0.25);">
                <div style="font-size: 3rem; margin-bottom: 20px;">🗑️</div>
                <h3 style="margin: 0 0 10px; color: var(--logo-brown); font-size: 1.6rem; font-weight: 700;">${title}</h3>
                <p style="color: var(--text-light); margin-bottom: 30px; line-height: 1.5;">${msg}</p>
                <div style="display: flex; gap: 12px;">
                    <button id="cancel-confirm" style="flex: 1; padding: 12px; border-radius: 12px; border: 2px solid #eee; background: none; font-weight: 600; cursor: pointer;">${window.siteTranslator ? window.siteTranslator.getValue('common.cancel') : 'Cancelar'}</button>
                    <button id="ok-confirm" style="flex: 1; padding: 12px; border-radius: 12px; border: none; background: #ff5252; color: white; font-weight: 700; cursor: pointer;">${window.siteTranslator ? window.siteTranslator.getValue('common.confirm') : 'Confirmar'}</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
        document.getElementById('cancel-confirm').onclick = () => dialog.remove();
        document.getElementById('ok-confirm').onclick = () => { onConfirm(); dialog.remove(); };
    };

    // Product Modal Logic
    if (modalOverlay) {
        const modalClose = document.querySelector('.modal-close:not(.cart-close)');
        const modalImg = document.getElementById('modal-img');
        const modalTitle = document.getElementById('modal-title');
        const modalDesc = document.getElementById('modal-desc');
        const modalPrice = document.getElementById('modal-price');
        const modalWhatsapp = document.getElementById('modal-whatsapp');
        const qtyInput = document.getElementById('product-quantity');
        const addToCartBtn = document.getElementById('add-to-cart-btn');

        let currentProduct = null;

        const updateWaLink = () => {
            if (!currentProduct) return;
            const qty = qtyInput ? qtyInput.value : 1;
            const waMessage = encodeURIComponent(`Hola, me gustaría pedir:\nProducto: ${currentProduct.title}\nCantidad: ${qty} unidades\nPrecio: $${(currentProduct.price * qty).toFixed(2)}\nLink: ${new URL(currentProduct.img, window.location.href).href}`);
            modalWhatsapp.href = `https://wa.me/${waNumber}?text=${waMessage}`;
        };

        productCards.forEach(card => {
            // Render price on card if not present
            const pPrice = card.getAttribute('data-price');
            if (pPrice && !card.querySelector('.card-price')) {
                const priceTag = document.createElement('p');
                priceTag.className = 'card-price';
                priceTag.style = 'color: var(--logo-orange); font-weight: 700; margin-top: 5px; font-size: 1.1rem;';
                priceTag.textContent = `$${parseFloat(pPrice).toFixed(2)}`;
                card.appendChild(priceTag);
            }

            card.addEventListener('click', () => {
                const title = card.getAttribute('data-title');
                const img = card.getAttribute('data-img');
                const desc = card.getAttribute('data-desc');
                const price = parseFloat(card.getAttribute('data-price')) || 0;
                const id = card.getAttribute('data-id') || title;

                currentProduct = { id, title, img, price };
                
                modalImg.src = img;
                modalTitle.textContent = title;
                modalDesc.textContent = desc;
                
                if (qtyInput) qtyInput.value = 1;
                updateModalUI();
                modalOverlay.classList.add('active');
                document.body.classList.add('modal-open');
                updateWaLink();
            });
        });

        const updateModalUI = () => {
            if (!currentProduct) return;
            const qty = qtyInput ? parseInt(qtyInput.value) : 1;
            modalPrice.textContent = `$${(currentProduct.price * qty).toFixed(2)}`;
            updateWaLink();
        };

        if (qtyInput) qtyInput.addEventListener('input', updateModalUI);
        
        if (addToCartBtn) addToCartBtn.addEventListener('click', () => {
            const qty = parseInt(qtyInput.value);
            const existing = cart.find(item => item.id === currentProduct.id);
            if (existing) {
                existing.quantity += qty;
            } else {
                cart.push({ ...currentProduct, quantity: qty });
            }
            saveCart();
            updateCartUI();
            
            // Animation for visual feedback
            addToCartBtn.textContent = window.siteTranslator ? window.siteTranslator.getValue('modal.added') : '¡Añadido!';
            addToCartBtn.style.backgroundColor = '#22c55e';
            setTimeout(() => {
                addToCartBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    <span>${window.siteTranslator ? window.siteTranslator.getValue('modal.add_to_cart') : 'Agregar al carrito'}</span>
                `;
                addToCartBtn.style.backgroundColor = 'var(--logo-brown)';
                modalOverlay.classList.remove('active');
                document.body.classList.remove('modal-open');
            }, 800);
        });
    }

    const closeModal = (m) => {
        if (!m) return;
        m.classList.remove('active');
        document.body.classList.remove('modal-open');
    };

    if (modalOverlay) {
        const modalClose = document.querySelector('.modal-close:not(.cart-close)');
        if (modalClose) modalClose.addEventListener('click', () => closeModal(modalOverlay));
    }

    const cartCloseBtn = document.querySelector('.cart-close');
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', () => closeModal(cartModal));

    window.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal(modalOverlay);
        if (e.target === cartModal) closeModal(cartModal);
    });

    // === 5. View All Products Logic ===
    const viewAllLinks = document.querySelectorAll('.view-all-link');
    viewAllLinks.forEach(viewAllLink => {
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
                setTimeout(() => hideAllLink.style.display = 'inline-flex', extraCards.length * 40 + 100);
            });

            hideAllLink.addEventListener('click', (e) => {
                e.preventDefault();
                hideAllLink.style.display = 'none';
                viewAllLink.style.display = 'inline-flex';
                extraCards.forEach(card => {
                    card.classList.remove('show');
                    setTimeout(() => card.style.display = 'none', 500);
                });
                window.scrollTo({ top: sectionContainer.offsetTop - 100, behavior: "smooth" });
            });
        }
    });

    updateCartUI();
});
