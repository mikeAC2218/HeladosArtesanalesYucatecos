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

        // === Explosion blob scroll animation ===
        const explosionBg = document.getElementById('explosion-bg');
        const alsoHaveSection = document.getElementById('also-have-section');
        if (explosionBg && alsoHaveSection) {
            const rect = alsoHaveSection.getBoundingClientRect();
            const sectionH = alsoHaveSection.offsetHeight;
            const viewH = window.innerHeight;

            // progress: 0 when top of section hits bottom of viewport,
            //           1 when bottom of section hits top of viewport
            const rawProgress = 1 - (rect.bottom / (viewH + sectionH));
            const progress = Math.max(0, Math.min(1, rawProgress));

            // Scale: 0.05 → 1.0 as progress goes 0 → 0.55, then back down to 0.05 as it goes 0.55 → 1
            let scale, opacity;
            if (progress < 0.55) {
                const t = progress / 0.55;
                scale = 0.05 + t * 0.95;
                opacity = t;
            } else {
                const t = (progress - 0.55) / 0.45;
                scale = 1 - t * 0.95;
                opacity = 1 - t;
            }

            explosionBg.style.transform = `scale(${scale.toFixed(3)})`;
            explosionBg.style.opacity   = opacity.toFixed(3);
        }
    });

    // === 3. Season Tabs Logic (replaces old carousel) ===
    const seasonTabs = document.querySelectorAll('.season-tab');
    if (seasonTabs.length > 0) {
        const seasonPanels = document.querySelectorAll('.season-panel');

        function activateTab(tabEl) {
            const target = tabEl.getAttribute('data-tab');

            // Update tab active states
            seasonTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tabEl.classList.add('active');
            tabEl.setAttribute('aria-selected', 'true');

            // Show matching panel
            seasonPanels.forEach(panel => {
                if (panel.getAttribute('data-season') === target) {
                    panel.classList.add('active');
                } else {
                    panel.classList.remove('active');
                }
            });
        }

        seasonTabs.forEach(tab => {
            tab.addEventListener('click', () => activateTab(tab));
        });
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
    const nameInput = document.getElementById('name-input');
    const addressInput = document.getElementById('address-input');
    const referencesInput = document.getElementById('references-input');
    
    const validateCartForm = () => {
        const nameVal = nameInput ? nameInput.value.trim() : "";
        const locationPicked = addressInput && addressInput.dataset.mapsUrl;
        let isValid = true;
        
        // Use siteTranslator if available
        const t = (key, fallback) => window.siteTranslator ? window.siteTranslator.getValue(key) || fallback : fallback;

        // Clean up previous states
        if (nameInput) {
            nameInput.classList.remove('field-invalid');
            const oldMsg = nameInput.parentNode.querySelector('.field-error-msg');
            if (oldMsg) oldMsg.remove();
        }
        document.querySelectorAll('.btn-location').forEach(btn => btn.classList.remove('location-btn-invalid'));
        const locContainer = document.querySelector('.address-container');
        if (locContainer) {
            const oldLocMsg = locContainer.querySelector('.field-error-msg');
            if (oldLocMsg) oldLocMsg.remove();
        }
        const oldBanner = document.getElementById('cart-validation-errors');
        if (oldBanner) oldBanner.remove();

        if (nameVal === "") {
            isValid = false;
            if (nameInput) {
                nameInput.classList.add('field-invalid');
                const errorMsg = document.createElement('div');
                errorMsg.className = 'field-error-msg';
                errorMsg.innerHTML = `<span data-i18n="cart.validation_name">${t('cart.validation_name', 'El nombre es obligatorio.')}</span>`;
                nameInput.parentNode.appendChild(errorMsg);
            }
        }

        if (!locationPicked) {
            isValid = false;
            const locBtns = document.querySelector('.location-buttons');
            document.querySelectorAll('.btn-location').forEach(btn => btn.classList.add('location-btn-invalid'));
            if (locBtns) {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'field-error-msg';
                errorMsg.style.marginBottom = "10px";
                errorMsg.innerHTML = `<span data-i18n="cart.validation_location">${t('cart.validation_location', 'Debes confirmar tu ubicación usando GPS o el mapa.')}</span>`;
                locBtns.after(errorMsg);
            }
        }

        if (!isValid) {
            const bannerMsg = t('cart.validation_banner', 'Para continuar, por favor completa los campos requeridos:');
            // Show as a global modal alert with only OK button
            showCustomAlert(
                t('common.attention', 'Atención'), 
                bannerMsg,
                null,
                'assets/sad_pineapple.png'
            );
            
            // Still highlight fields so user knows what to fix
            const firstInvalid = document.querySelector('.field-invalid, .location-btn-invalid');
            if (firstInvalid) {
                // Wait a bit for the alert to be seen before scrolling
                setTimeout(() => {
                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        }

        return isValid;
    };

    const showCustomAlert = (title, msg, onOk = null, icon = 'assets/sad_pineapple.png') => {
        const dialog = document.createElement('div');
        dialog.style = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100000005; backdrop-filter: blur(5px); animation: fadeIn 0.3s;';
        const okText = window.siteTranslator ? window.siteTranslator.getValue('common.ok') || 'OK' : 'OK';
        dialog.innerHTML = `
            <div style="background: white; padding: 40px; border-radius: 24px; max-width: 400px; width: 90%; text-align: center; box-shadow: 0 20px 70px rgba(0,0,0,0.25);">
                <div style="margin-bottom: 20px;">
                    <img src="${icon}" style="height: 110px; object-fit: contain; animation: float 3s ease-in-out infinite;">
                </div>
                <h3 style="margin: 0 0 10px; color: var(--logo-brown); font-size: 1.6rem; font-weight: 700;">${title}</h3>
                <p style="color: var(--text-light); margin-bottom: 30px; line-height: 1.6;">${msg}</p>
                <button id="alert-ok-generic" style="width: 100%; padding: 12px; border-radius: 12px; border: none; background: var(--logo-orange); color: white; font-weight: 700; cursor: pointer; font-size: 1rem;">${okText}</button>
            </div>
        `;
        document.body.appendChild(dialog);
        document.getElementById('alert-ok-generic').onclick = () => {
            dialog.remove();
            if (onOk) onOk();
        };
    };
    
    // Add Click listener to WhatsApp button to confirm and then empty cart
    if (cartWaBtn) {
        cartWaBtn.addEventListener('click', (e) => {
            if (cart.length > 0) {
                e.preventDefault(); // Stop immediate redirect
                
                // VALIDATION: Name and Location are required
                if (!validateCartForm()) {
                    return; // Stop if invalid
                }
                
                const title = window.siteTranslator ? window.siteTranslator.getValue('cart.confirm_order_title') : '¿Confirmar pedido?';
                const msg = window.siteTranslator ? window.siteTranslator.getValue('cart.confirm_order_msg') : '¿Ya tienes listo tu pedido para enviarlo por WhatsApp?';
                
                showCustomConfirm(title, msg, (dialog) => {
                    // First show the loader animation
                    const dialogContent = dialog.querySelector('div');
                    dialogContent.innerHTML = `
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px 0;">
                            <div class="loader" style="margin-bottom: 30px;"></div>
                            <h3 class="script-font" style="margin: 0; color: var(--logo-brown); font-size: 1.6rem; font-weight: 700;">
                                <span class="typing-text">${window.siteTranslator && window.siteTranslator.getValue('cart.processing_order') ? window.siteTranslator.getValue('cart.processing_order') : 'Procesando tu pedido...'}</span>
                            </h3>
                        </div>
                    `;

                    setTimeout(() => {
                        // 1. Open WhatsApp in new tab
                        window.open(cartWaBtn.href, '_blank');

                        // 2. Success feedback animation
                        const successTitle = window.siteTranslator ? window.siteTranslator.getValue('cart.order_success_title') : '¡Pedido Enviado!';
                        const successMsg = window.siteTranslator ? window.siteTranslator.getValue('cart.order_success_msg') : 'Tu pedido se ha procesado. Hemos limpiado tu carrito por ti.';
                        
                        dialogContent.innerHTML = `
                            <div style="margin-bottom: 20px; display: flex; justify-content: center;">
                                <div class="delivery-loader">
                                  <div class="truckWrapper">
                                    <div class="truckBody">
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 198 93" class="trucksvg">
                                        <path stroke-width="3" stroke="#282828" fill="#F83D3D" d="M135 22.5H177.264C178.295 22.5 179.22 23.133 179.594 24.0939L192.33 56.8443C192.442 57.1332 192.5 57.4404 192.5 57.7504V89C192.5 90.3807 191.381 91.5 190 91.5H135C133.619 91.5 132.5 90.3807 132.5 89V25C132.5 23.6193 133.619 22.5 135 22.5Z"></path>
                                        <path stroke-width="3" stroke="#282828" fill="#7D7C7C" d="M146 33.5H181.741C182.779 33.5 183.709 34.1415 184.078 35.112L190.538 52.112C191.16 53.748 189.951 55.5 188.201 55.5H146C144.619 55.5 143.5 54.3807 143.5 53V36C143.5 34.6193 144.619 33.5 146 33.5Z"></path>
                                        <path stroke-width="2" stroke="#282828" fill="#282828" d="M150 65C150 65.39 149.763 65.8656 149.127 66.2893C148.499 66.7083 147.573 67 146.5 67C145.427 67 144.501 66.7083 143.873 66.2893C143.237 65.8656 143 65.39 143 65C143 64.61 143.237 64.1344 143.873 63.7107C144.501 63.2917 145.427 63 146.5 63C147.573 63 148.499 63.2917 149.127 63.7107C149.763 64.1344 150 64.61 150 65Z"></path>
                                        <rect stroke-width="2" stroke="#282828" fill="#FFFCAB" rx="1" height="7" width="5" y="63" x="187"></rect>
                                        <rect stroke-width="2" stroke="#282828" fill="#282828" rx="1" height="11" width="4" y="81" x="193"></rect>
                                        <rect stroke-width="3" stroke="#282828" fill="#DFDFDF" rx="2.5" height="90" width="121" y="1.5" x="6.5"></rect>
                                        <rect stroke-width="2" stroke="#282828" fill="#DFDFDF" rx="2" height="4" width="6" y="84" x="1"></rect>
                                      </svg>
                                    </div>
                                    <div class="truckTires">
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30" class="tiresvg">
                                        <circle stroke-width="3" stroke="#282828" fill="#282828" r="13.5" cy="15" cx="15"></circle>
                                        <circle fill="#DFDFDF" r="7" cy="15" cx="15"></circle>
                                      </svg>
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30" class="tiresvg">
                                        <circle stroke-width="3" stroke="#282828" fill="#282828" r="13.5" cy="15" cx="15"></circle>
                                        <circle fill="#DFDFDF" r="7" cy="15" cx="15"></circle>
                                      </svg>
                                    </div>
                                    <div class="road"></div>
                                    <svg xml:space="preserve" viewBox="0 0 453.459 453.459" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" id="Capa_1" version="1.1" fill="#000000" class="lampPost">
                                      <path d="M252.882,0c-37.781,0-68.686,29.953-70.245,67.358h-6.917v8.954c-26.109,2.163-45.463,10.011-45.463,19.366h9.993 c-1.65,5.146-2.507,10.54-2.507,16.017c0,28.956,23.558,52.514,52.514,52.514c28.956,0,52.514-23.558,52.514-52.514 c0-5.478-0.856-10.872-2.506-16.017h9.992c0-9.354-19.352-17.204-45.463-19.366v-8.954h-6.149C200.189,38.779,223.924,16,252.882,16 c29.952,0,54.32,24.368,54.32,54.32c0,28.774-11.078,37.009-25.105,47.437c-17.444,12.968-37.216,27.667-37.216,78.884v113.914 h-0.797c-5.068,0-9.174,4.108-9.174,9.177c0,2.844,1.293,5.383,3.321,7.066c-3.432,27.933-26.851,95.744-8.226,115.459v11.202h45.75 v-11.202c18.625-19.715-4.794-87.527-8.227-115.459c2.029-1.683,3.322-4.223,3.322-7.066c0-5.068-4.107-9.177-9.176-9.177h-0.795 V196.641c0-43.174,14.942-54.283,30.762-66.043c14.793-10.997,31.559-23.461,31.559-60.277C323.202,31.545,291.656,0,252.882,0z M232.77,111.694c0,23.442-19.071,42.514-42.514,42.514c-23.442,0-42.514-19.072-42.514-42.514c0-5.531,1.078-10.957,3.141-16.017 h78.747C231.693,100.736,232.77,106.162,232.77,111.694z"></path>
                                    </svg>
                                  </div>
                                </div>
                            </div>
                            <h3 style="margin: 0 0 10px; color: var(--logo-brown); font-size: 1.6rem; font-weight: 700;">${successTitle}</h3>
                            <p style="color: var(--text-light); margin-bottom: 25px; line-height: 1.5;">${successMsg}</p>
                            <button id="close-success-dialog" style="padding: 10px 24px; border-radius: 12px; border: none; background: var(--logo-brown); color: white; font-weight: 700; cursor: pointer; transition: all 0.3s ease;">${window.siteTranslator ? window.siteTranslator.getValue('common.confirm') : 'OK'}</button>
                        `;

                        // Add manual close listener
                        const closeBtn = document.getElementById('close-success-dialog');
                        const finishOrder = () => {
                            // 3. Clear data
                            cart = [];
                            saveCart();
                            
                            // Clear inputs
                            if (nameInput) nameInput.value = '';
                            if (addressInput) {
                                addressInput.value = '';
                                delete addressInput.dataset.mapsUrl;
                            }
                            if (referencesInput) referencesInput.value = '';
                            
                            // Clear map preview
                            const previewContainer = document.getElementById('cart-map-preview');
                            if (previewContainer) {
                                previewContainer.style.display = 'none';
                                previewContainer.innerHTML = '';
                                previewMap = null;
                                previewMarker = null;
                            }

                            updateCartUI();

                            dialog.remove();
                            if (cartModal) {
                                cartModal.classList.remove('active');
                                document.body.classList.remove('modal-open');
                            }
                        };
                        
                        if (closeBtn) closeBtn.onclick = finishOrder;
                    }, 3000);
                }, 'assets/pineapple-icecream.png', 'background: #25D366; color: white;');
            } else {
                // Cart is empty — show friendly alert
                e.preventDefault();
                showEmptyCartAlert();
            }
        });
    }
    
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
                        <h3 data-i18n="cart.empty_title">${window.siteTranslator ? window.siteTranslator.getValue('cart.empty_title') : '¡Tu carrito está vacío!'}</h3>
                    </div>`;
                if (cartTotalPrice) cartTotalPrice.textContent = "$0.00";
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
                        <img src="${item.img}" class="cart-item-img">
                        <div class="cart-item-name">${item.title}</div>
                        <div class="cart-item-qty-control">
                            <button class="qty-btn qty-minus" data-index="${index}" title="Quitar">&#8722;</button>
                            <span class="qty-display">${item.quantity}</span>
                            <button class="qty-btn qty-plus" data-index="${index}" title="Agregar">&#43;</button>
                        </div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                        <button class="remove-item-btn" data-index="${index}" title="${window.siteTranslator ? window.siteTranslator.getValue('cart.remove') : 'Eliminar'}">
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    `;
                    cartItemsContainer.appendChild(itemEl);
                });
                
                cartTotalPrice.textContent = `$${total.toFixed(2)}`;
                cartSummary.style.display = 'block';
                
                // Add remove listeners
                document.querySelectorAll('.remove-item-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                        cart.splice(idx, 1);
                        saveCart();
                        updateCartUI();
                    });
                });

                // Qty +/- listeners
                document.querySelectorAll('.qty-minus').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                        if (cart[idx].quantity > 1) {
                            cart[idx].quantity -= 1;
                        } else {
                            cart.splice(idx, 1);
                        }
                        saveCart();
                        updateCartUI();
                    });
                });
                document.querySelectorAll('.qty-plus').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                        cart[idx].quantity += 1;
                        saveCart();
                        updateCartUI();
                    });
                });

                // Update WhatsApp Link for Entire Cart
                const waNumber = "5219993960148";
                total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                
                const nameValue = nameInput ? nameInput.value.trim() : "";
                const mapLink = addressInput ? addressInput.dataset.mapsUrl : "";
                const addressValue = addressInput ? addressInput.value.trim() : "";
                const refValue = referencesInput ? referencesInput.value.trim() : "";

                let waMessage = encodeURIComponent(`Hola! Me gustaría hacer un pedido a nombre de: ${nameValue || "No especificado"}\n\n`);
                waMessage += encodeURIComponent("con los siguientes productos:\n");
                
                cart.forEach(item => {
                    waMessage += encodeURIComponent(`  • ${item.title} x ${item.quantity} ($${(item.price * item.quantity).toFixed(2)})\n`);
                });
                
                waMessage += encodeURIComponent(`\ntotal: *$${total.toFixed(2)}*\n\n`);

                if (addressValue !== "" || mapLink || refValue !== "") {
                    waMessage += encodeURIComponent("Y requiero envío para esta dirección:");
                    
                    if (addressValue !== "") {
                        waMessage += encodeURIComponent(`\n  • ${addressValue}`);
                    }
                    if (mapLink && mapLink !== addressValue) {
                        waMessage += encodeURIComponent(`\n  • GPS: ${mapLink}`);
                    }
                    if (refValue !== "") {
                        waMessage += encodeURIComponent(`\n  • Referencias: ${refValue}`);
                    }
                    
                    waMessage += encodeURIComponent(`\n\n¿Cuál sería el costo de envío para esta ubicación?`);
                }
                
                cartWaBtn.href = `https://wa.me/${waNumber}?text=${waMessage}`;
            }
        }
        localStorage.setItem('casfrela_cart', JSON.stringify(cart));
    };

    const saveCart = () => localStorage.setItem('casfrela_cart', JSON.stringify(cart));

    // Map Picker Logic
    let pickerMap, pickerMarker;
    let previewMap, previewMarker;

    const fillAddressFromCoords = (lat, lng, addressInput) => {
        addressInput.dataset.mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
            .then(r => r.json())
            .then(data => {
                if (data && data.address) {
                    const road = data.address.road || data.address.pedestrian;
                    const suburb = data.address.suburb || data.address.neighbourhood;
                    
                    if (road && suburb) {
                        addressInput.value = `${road} x ____ y ____, ${suburb}`;
                    } else if (road) {
                        addressInput.value = `${road} x ____ y ____`;
                    } else if (suburb) {
                        addressInput.value = `${suburb} (Especificar calle y cruzamientos)`;
                    } else if (addressInput.value.includes('google.com/maps')) {
                        addressInput.value = '';
                    }

                    let crossLegend = document.getElementById('cross-streets-legend');
                    if (!crossLegend && addressInput.parentNode && (road || suburb)) {
                        crossLegend = document.createElement('p');
                        crossLegend.id = 'cross-streets-legend';
                        crossLegend.style = "font-size: 0.8rem; color: var(--logo-orange); margin: 6px 0 12px 0; font-weight: 600; animation: fadeIn 0.4s ease-out;";
                        
                        const defaultMsg = 'Para un envío más rápido, puedes completar los cruzamientos de tus calles (Opcional).';
                        const i18nText = window.siteTranslator ? window.siteTranslator.getValue('cart.cross_streets_legend') || defaultMsg : defaultMsg;
                        
                        crossLegend.innerHTML = `<span data-i18n="cart.cross_streets_legend">${i18nText}</span>`;
                        addressInput.parentNode.insertBefore(crossLegend, addressInput.nextSibling);
                    }
                } else if (addressInput.value.includes('google.com/maps')) {
                    addressInput.value = '';
                    const crossLegend = document.getElementById('cross-streets-legend');
                    if (crossLegend) crossLegend.remove();
                }
                updateCartUI();
            })
            .catch(() => {
                if (addressInput.value.includes('google.com/maps')) {
                    addressInput.value = '';
                }
                const crossLegend = document.getElementById('cross-streets-legend');
                if (crossLegend && addressInput.value === '') crossLegend.remove();
                updateCartUI();
            });
        
        // Remove maps URL if it was already in there to prevent flashing
        if (addressInput.value.includes('google.com/maps')) {
            addressInput.value = '';
        }
        updateCartUI();
    };

    const updateMapPreview = (lat, lng) => {
        const previewContainer = document.getElementById('cart-map-preview');
        if (previewContainer) {
            previewContainer.style.display = 'block';
            setTimeout(() => {
                if (!previewMap) {
                    previewMap = L.map('cart-map-preview', {
                        zoomControl: true,
                        dragging: true,
                        touchZoom: true,
                        scrollWheelZoom: false,
                        doubleClickZoom: false,
                        boxZoom: false
                    }).setView([lat, lng], 17);
                    L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
                        maxZoom: 20,
                        attribution: '© Google Maps'
                    }).addTo(previewMap);
                    previewMarker = L.marker([lat, lng], { draggable: true }).addTo(previewMap);

                    // Al arrastrar el marcador en la vista previa, actualizar la dirección
                    previewMarker.on('dragend', () => {
                        const pos = previewMarker.getLatLng();
                        const addressInput = document.getElementById('address-input');
                        if (addressInput) {
                            fillAddressFromCoords(pos.lat, pos.lng, addressInput);
                        }
                    });
                } else {
                    previewMap.setView([lat, lng], 17);
                    previewMarker.setLatLng([lat, lng]);
                    previewMap.invalidateSize();
                }
            }, 100);
        }
    };


    const openMapPicker = () => {
        const mapModal = document.getElementById('map-modal');
        mapModal.classList.add('active');
        document.body.classList.add('modal-open');

        setTimeout(() => {
            if (!pickerMap) {
                const meridaPos = [20.9673, -89.6241];
                pickerMap = L.map('map-container', { doubleClickZoom: false }).setView(meridaPos, 13);
                L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
                    maxZoom: 20,
                    attribution: '© Google Maps'
                }).addTo(pickerMap);
                pickerMarker = L.marker(meridaPos, {draggable: true}).addTo(pickerMap);
                
                // Handle single click/tap for both mobile and desktop
                pickerMap.on('click', function(e) {
                    pickerMarker.setLatLng(e.latlng);
                });
                
                // Also handle long press on mobile
                pickerMap.on('contextmenu', function(e) {
                    pickerMarker.setLatLng(e.latlng);
                });
            } else {
                pickerMap.invalidateSize();
            }

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    const p = [pos.coords.latitude, pos.coords.longitude];
                    pickerMap.setView(p, 18);
                    pickerMarker.setLatLng(p);
                }, null, { enableHighAccuracy: true });
            }
        }, 300);
    };

    if (cartBtn) cartBtn.addEventListener('click', () => {
        cartModal.classList.add('active');
        document.body.classList.add('modal-open');
        updateCartUI();
        
        // Add listeners for shipping address input and location button
        const nameInput = document.getElementById('name-input');
        const addressInput = document.getElementById('address-input');
        const referencesInput = document.getElementById('references-input');

        if (nameInput && !nameInput.dataset.listenerAdded) {
            nameInput.addEventListener('input', updateCartUI);
            nameInput.dataset.listenerAdded = "true";
        }

        if (addressInput && !addressInput.dataset.listenerAdded) {
            addressInput.addEventListener('input', updateCartUI);
            addressInput.dataset.listenerAdded = "true";
        }

        if (referencesInput && !referencesInput.dataset.listenerAdded) {
            referencesInput.addEventListener('input', updateCartUI);
            referencesInput.dataset.listenerAdded = "true";
        }

        const getLocationBtn = document.getElementById('get-location-btn');
        if (getLocationBtn && !getLocationBtn.dataset.listenerAdded) {
            getLocationBtn.addEventListener('click', () => {
                const originalText = getLocationBtn.innerHTML;
                getLocationBtn.innerHTML = '<span>GPS...</span>';
                getLocationBtn.disabled = true;

                // Mostrar leyenda de advertencia de precisión
                const locationButtonsContainer = getLocationBtn.closest('.location-buttons');
                let accuracyNote = document.getElementById('location-accuracy-note');
                if (!accuracyNote && locationButtonsContainer) {
                    const fallbackEs = 'La ubicación obtenida por GPS podría no ser exacta. Te recomendamos verificarla en el mapa.';
                    const translated = (window.siteTranslator && window.siteTranslator.translations)
                        ? (window.siteTranslator.translations['cart.location_accuracy_note'] || fallbackEs)
                        : fallbackEs;
                    accuracyNote = document.createElement('p');
                    accuracyNote.id = 'location-accuracy-note';
                    accuracyNote.className = 'location-accuracy-note';
                    accuracyNote.innerHTML = `⚠️ <span data-i18n="cart.location_accuracy_note">${translated}</span>`;
                    locationButtonsContainer.after(accuracyNote);
                }

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                        if (addressInput) {
                            fillAddressFromCoords(lat, lng, addressInput);
                            updateMapPreview(lat, lng);
                        }
                        
                        getLocationBtn.innerHTML = originalText;
                        getLocationBtn.disabled = false;
                    }, (error) => {
                        console.error('Error getting location:', error);
                        // Fallback: try again without high accuracy if first attempt failed
                        if (error.code === 3 || error.code === 1) { // Timeout or Permission
                             alert('No se pudo obtener la ubicación exacta. Por favor, asegúrate de dar permisos de GPS o elige en el mapa.');
                        } else {
                             alert('Error al obtener ubicación. Intenta elegir directamente en el mapa.');
                        }
                        getLocationBtn.innerHTML = originalText;
                        getLocationBtn.disabled = false;
                        const note = document.getElementById('location-accuracy-note');
                        if (note) note.remove();
                    }, { enableHighAccuracy: false, timeout: 15000 });
                } else {
                    alert('Tu navegador no soporta geolocalización.');
                    getLocationBtn.innerHTML = originalText;
                    getLocationBtn.disabled = false;
                    const note = document.getElementById('location-accuracy-note');
                    if (note) note.remove();
                }
            });
            getLocationBtn.dataset.listenerAdded = "true";
        }

        const pickMapBtn = document.getElementById('pick-map-btn');
        if (pickMapBtn && !pickMapBtn.dataset.listenerAdded) {
            pickMapBtn.addEventListener('click', openMapPicker);
            pickMapBtn.dataset.listenerAdded = "true";
        }

        // Map Modal Listeners
        const mapModal = document.getElementById('map-modal');
        const confirmMapBtn = document.getElementById('confirm-map-btn');
        const cancelMapBtn = document.getElementById('cancel-map-btn');

        if (confirmMapBtn && !confirmMapBtn.dataset.listenerAdded) {
            confirmMapBtn.addEventListener('click', () => {
                if (pickerMarker && addressInput) {
                    const pos = pickerMarker.getLatLng();
                    fillAddressFromCoords(pos.lat, pos.lng, addressInput);
                    updateMapPreview(pos.lat, pos.lng);
                }
                mapModal.classList.remove('active');
            });
            confirmMapBtn.dataset.listenerAdded = "true";
        }

        if (cancelMapBtn && !cancelMapBtn.dataset.listenerAdded) {
            cancelMapBtn.addEventListener('click', () => {
                mapModal.classList.remove('active');
            });
            cancelMapBtn.dataset.listenerAdded = "true";
        }
    });

    if (emptyCartBtn) emptyCartBtn.addEventListener('click', () => {
        showCustomConfirm(
            window.siteTranslator ? window.siteTranslator.getValue('cart.confirm_clear_title') : '¿Vaciar Carrito?',
            window.siteTranslator ? window.siteTranslator.getValue('cart.confirm_clear') : '¿Estás seguro de <b>vaciar el carrito</b>?',
            (dialog) => {
                // Success feedback animation (2 seconds)
                const dialogContent = dialog.querySelector('div');
                dialogContent.innerHTML = `
                    <div style="margin-bottom: 20px;">
                        <img src="assets/crying_pineapple.png" style="height: 120px; object-fit: contain; animation: bounce 0.8s infinite alternate;">
                    </div>
                    <h3 style="margin: 0 0 10px; color: var(--logo-brown); font-size: 1.6rem; font-weight: 700;">¡Carrito vaciado!</h3>
                    <p style="color: var(--text-light); margin-bottom: 0; line-height: 1.5;">Hemos limpiado tu selección para ti.</p>
                `;
                
                // Perform the clear
                cart = [];
                saveCart();
                updateCartUI();

                // Wait 2 seconds before removing the dialog
                setTimeout(() => {
                    dialog.remove();
                    if (cartModal) {
                        cartModal.classList.remove('active');
                        document.body.classList.remove('modal-open');
                    }
                }, 2000);
            }
        );
    });

    const showCustomConfirm = (title, msg, onConfirm, icon = 'assets/sad_pineapple.png', confirmBtnStyle = 'background: #ff5252; color: white;') => {
        const dialog = document.createElement('div');
        dialog.style = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100000000; backdrop-filter: blur(5px); animation: fadeIn 0.3s;';
        dialog.innerHTML = `
            <div style="background: white; padding: 40px; border-radius: 24px; max-width: 400px; width: 90%; text-align: center; box-shadow: 0 20px 70px rgba(0,0,0,0.25);">
                <div style="margin-bottom: 20px;">
                    <img src="${icon}" style="height: 120px; object-fit: contain; animation: float 3s ease-in-out infinite;">
                </div>
                <h3 style="margin: 0 0 10px; color: var(--logo-brown); font-size: 1.6rem; font-weight: 700;">${title}</h3>
                <p style="color: var(--text-light); margin-bottom: 30px; line-height: 1.5;">${msg}</p>
                <div style="display: flex; gap: 12px;">
                    <button id="cancel-confirm" style="flex: 1; padding: 12px; border-radius: 12px; border: 2px solid #eee; background: none; font-weight: 600; cursor: pointer;">${window.siteTranslator ? window.siteTranslator.getValue('common.cancel') : 'Cancelar'}</button>
                    <button id="ok-confirm" style="flex: 1; padding: 12px; border-radius: 12px; border: none; ${confirmBtnStyle} font-weight: 700; cursor: pointer;">${window.siteTranslator ? window.siteTranslator.getValue('common.confirm') : 'Confirmar'}</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);
        document.getElementById('cancel-confirm').onclick = () => dialog.remove();
        document.getElementById('ok-confirm').onclick = () => {
            // If the callback takes a parameter, it handles the dialog removal (animation)
            if (onConfirm.length > 0) {
                onConfirm(dialog);
            } else {
                onConfirm();
                dialog.remove();
            }
        };
    };

    // Empty cart alert — shown when user tries to order with empty cart
    const showEmptyCartAlert = () => {
        const t = (key, fallback) => window.siteTranslator ? window.siteTranslator.getValue(key) || fallback : fallback;
        const alertTitle   = t('cart.empty_alert_title', '¡Carrito vacío!');
        const alertMsg     = t('cart.empty_alert_msg', 'No puedes realizar un pedido con el carrito vacío. Explora nuestros deliciosos productos y agrega tus favoritos.');
        const btnOk        = t('common.ok', 'OK');
        const btnProducts  = t('cart.empty_alert_go_products', 'Ver Productos');

        const dialog = document.createElement('div');
        dialog.style = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100000001; backdrop-filter: blur(5px); animation: fadeIn 0.3s;';
        dialog.innerHTML = `
            <div style="background: white; padding: 40px; border-radius: 24px; max-width: 400px; width: 90%; text-align: center; box-shadow: 0 20px 70px rgba(0,0,0,0.25);">
                <div style="margin-bottom: 20px;">
                    <img src="assets/sad_pineapple.png" style="height: 110px; object-fit: contain; animation: float 3s ease-in-out infinite;">
                </div>
                <h3 style="margin: 0 0 10px; color: var(--logo-brown); font-size: 1.6rem; font-weight: 700;">${alertTitle}</h3>
                <p style="color: var(--text-light); margin-bottom: 30px; line-height: 1.6;">${alertMsg}</p>
                <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
                    <button id="empty-alert-ok" style="flex: 1; min-width: 100px; padding: 12px 18px; border-radius: 12px; border: 2px solid #ddd; background: none; color: var(--text-dark); font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.2s ease;">${btnOk}</button>
                    <button id="empty-alert-products" style="flex: 2; min-width: 140px; padding: 12px 18px; border-radius: 12px; border: none; background: var(--logo-orange); color: white; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s ease;">${btnProducts}</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);

        const dismiss = () => dialog.remove();

        document.getElementById('empty-alert-ok').onclick = dismiss;

        document.getElementById('empty-alert-products').onclick = () => {
            dismiss();
            // Close cart modal too
            if (cartModal) {
                cartModal.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
            // Navigate to productos.html if not already there, otherwise scroll to top of products
            if (!window.location.pathname.includes('productos')) {
                window.location.href = 'productos.html';
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };

        // Hover effect on OK button via JS (no CSS class needed)
        const okBtn = document.getElementById('empty-alert-ok');
        okBtn.addEventListener('mouseenter', () => { okBtn.style.background = '#f5f5f5'; });
        okBtn.addEventListener('mouseleave', () => { okBtn.style.background = 'none'; });
    };

    // Product Modal Logic
    if (modalOverlay) {
        const modalClose = document.querySelector('.modal-close:not(.cart-close)');
        const modalImg = document.getElementById('modal-img');
        const modalTitle = document.getElementById('modal-title');
        const modalDesc = document.getElementById('modal-desc');
        const modalPrice = document.getElementById('modal-price');
        const qtyInput = document.getElementById('product-quantity');
        const addToCartBtn = document.getElementById('add-to-cart-btn');

        let currentProduct = null;



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
            });
        });

        const updateModalUI = () => {
            if (!currentProduct) return;
            // The price should remain fixed (unit price) regardless of quantity
            modalPrice.textContent = `$${currentProduct.price.toFixed(2)}`;
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

    // Event Modal Logic
    const eventModal = document.getElementById('event-modal');
    const openEventBtn = document.getElementById('open-event-modal');
    const eventModalClose = document.querySelector('.event-modal-close');

    if (openEventBtn && eventModal) {
        openEventBtn.addEventListener('click', () => {
            eventModal.classList.add('active');
            document.body.classList.add('modal-open');
        });
    }

    if (eventModalClose) {
        eventModalClose.addEventListener('click', () => {
            eventModal.classList.remove('active');
            document.body.classList.remove('modal-open');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal(modalOverlay);
        if (e.target === cartModal) closeModal(cartModal);
        if (e.target === eventModal) closeModal(eventModal);
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

    // === 6. Product Presentation Filter ===
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filterValue = btn.getAttribute('data-filter');
                
                // Update active button
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter cards
                const productsSection = document.getElementById('productos');
                const viewLinks = productsSection.querySelector('.view-links-container');
                const cards = productsSection.querySelectorAll('.product-card');
                const isExpanded = productsSection.querySelector('.view-all-link').style.display === 'none';
                
                if (filterValue === 'all') {
                    // Show/Hide view links based on state
                    if (viewLinks) viewLinks.style.display = 'block';
                    
                    cards.forEach(card => {
                        const isExtra = card.classList.contains('extra-card');
                        if (isExtra) {
                            if (isExpanded) {
                                card.classList.remove('hidden');
                                card.style.display = 'flex';
                            } else {
                                card.classList.add('hidden');
                                card.style.display = 'none';
                            }
                        } else {
                            card.classList.remove('hidden');
                            card.style.display = 'flex';
                        }
                    });
                } else {
                    // Specific filter: Hide view links and show ALL matching items
                    if (viewLinks) viewLinks.style.display = 'none';
                    
                    cards.forEach(card => {
                        const presentation = card.getAttribute('data-presentation');
                        if (presentation === filterValue) {
                            card.classList.remove('hidden');
                            card.style.display = 'flex';
                        } else {
                            card.classList.add('hidden');
                            card.style.display = 'none';
                        }
                    });
                }
            });
        });
    }

    updateCartUI();

    // === 7. Product Search Logic ===
    function initSearchBar(inputId, clearBtnId, noResultsId, sectionId) {
        const searchInput = document.getElementById(inputId);
        const clearBtn    = document.getElementById(clearBtnId);
        const noResults   = document.getElementById(noResultsId);
        const section     = document.getElementById(sectionId);
        if (!searchInput || !section) return;

        function runSearch() {
            const query = searchInput.value.trim().toLowerCase();
            const cards = section.querySelectorAll('.product-card');
            clearBtn.style.display = query.length ? 'block' : 'none';
            let visibleCount = 0;

            cards.forEach(card => {
                const title = (card.getAttribute('data-title') || '').toLowerCase();
                const shortDesc = (card.getAttribute('data-short') || '').toLowerCase();
                const matches = !query || title.includes(query) || shortDesc.includes(query);

                if (matches) {
                    card.style.display = 'flex';
                    card.style.opacity = '1';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            if (noResults) {
                noResults.style.display = visibleCount === 0 && query ? 'block' : 'none';
            }

            // Hide/show view-all links when searching
            const viewLinks = section.querySelector('.view-links-container');
            if (viewLinks) {
                viewLinks.style.display = query ? 'none' : 'block';
            }
        }

        searchInput.addEventListener('input', runSearch);
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            runSearch();
            searchInput.focus();
        });
    }

    // Init for helados section
    initSearchBar('product-search-input', 'search-clear-btn', 'search-no-results', 'productos');
    // Init for paletas section
    initSearchBar('paletas-search-input', 'paletas-search-clear-btn', 'paletas-no-results', 'paletas');

    // Contact form setup
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputs = contactForm.querySelectorAll('input, textarea');
            const name = inputs[0] ? inputs[0].value.trim() : '';
            const email = inputs[1] ? inputs[1].value.trim() : '';
            const message = inputs[2] ? inputs[2].value.trim() : '';
            
            if (name && email && message) {
                const waNumber = "5219993960148";
                const text = `Hola, soy ${name} (${email}).\n\nMensaje:\n${message}`;
                window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, '_blank');
                contactForm.reset();
            }
        });
    }
    
    // === 7. Location Zones Logic ===
    const zoneModal = document.getElementById('zone-modal');
    const openZoneBtns = document.querySelectorAll('.open-zone-btn');
    const zoneModalClose = document.querySelector('.zone-modal-close');
    const zoneModalTitle = document.getElementById('zone-modal-title');
    const zoneLocationsContainer = document.getElementById('zone-locations-container');

    const locationsData = {
        merida: [
            { nameKey: 'locations.l1_name', descKey: 'locations.l1_desc', map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3370.1873290728013!2d-89.57604542528566!3d21.0255534878898!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f567169c903a37%3A0x3b4164eab4b6a8b7!2sCarnitas%20-%20Oasis%20Mexicano!5e1!3m2!1ses-419!2smx!4v1775669073886!5m2!1ses-419!2smx', link: 'https://www.google.com/maps/search/?api=1&query=Carnitas+-+Oasis+Mexicano' },
            { nameKey: 'locations.l2_name', descKey: 'locations.l2_desc', map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3369.8229778401064!2d-89.62622382528524!3d21.041662687336373!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f567681bcf3df63%3A0x3667b0273fc2d732!2sEL%20CORRAL%20DEL%20CARNERO!5e1!3m2!1ses-419!2smx!4v1775669308703!5m2!1ses-419!2smx', link: 'https://www.google.com/maps/search/?api=1&query=EL+CORRAL+DEL+CARNERO+Merida' },
            { nameKey: 'locations.l3_name', descKey: 'locations.l3_desc', map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3370.4444639874705!2d-89.61113142528599!3d21.014177588280337!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f56776afaf05c1b%3A0x123c8066639fc4f3!2sFuego%20Real%20-%20Restaurante%20Buffet!5e1!3m2!1ses-419!2smx!4v1775669430399!5m2!1ses-419!2smx', link: 'https://www.google.com/maps/search/?api=1&query=Fuego+Real+-+Restaurante+Buffet+Merida' },
            { nameKey: 'locations.l4_name', descKey: 'locations.l4_desc', map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d8017.425705838287!2d-89.57773297501085!3d20.99346639775598!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f56715f9b9151b3%3A0xc52979547887c24e!2sLa%20Casita%20Mariskera!5e1!3m2!1ses-419!2smx!4v1775669488822!5m2!1ses-419!2smx', link: 'https://www.google.com/maps/search/?api=1&query=La+Casita+Mariskera+Merida' },
            { nameKey: 'locations.l6_name', descKey: 'locations.l6_desc', map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3370.9582356353335!2d-89.66369619999999!3d20.991430200000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f567378b3f8da01%3A0x2399c0082ccc6665!2sLas%20Jaibas%20Canek!5e1!3m2!1ses-419!2smx!4v1777334616505!5m2!1ses-419!2smx', link: 'https://www.google.com/maps/search/?api=1&query=Las+Jaibas+Canek' },
            { nameKey: 'locations.l7_name', descKey: 'locations.l7_desc', map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3371.005628080421!2d-89.65099529999999!3d20.989330700000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f56738efef32817%3A0xc400b8661113089e!2sLA%20CASITA%20DEL%20CHEVICHE%20DORADA!5e1!3m2!1ses-419!2smx!4v1777334745238!5m2!1ses-419!2smx', link: 'https://www.google.com/maps/search/?api=1&query=LA+CASITA+DEL+CHEVICHE+DORADA' }
        ],
        progreso: [
            { nameKey: 'locations.l5_name', descKey: 'locations.l5_desc', map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3364.3430076152863!2d-89.67396495541546!3d21.282546600000018!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f55dd2d6b1cb1f7%3A0x1b41a691ceca9ae4!2sYum%20Ixpu!5e1!3m2!1ses-419!2smx!4v1775669817007!5m2!1ses-419!2smx', link: 'https://www.google.com/maps/search/?api=1&query=Yum+Ixpu+Progreso' },
            { nameKey: 'locations.l8_name', descKey: 'locations.l8_desc', map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3364.211064114857!2d-89.6590882!3d21.288314399999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f55c38aaeda2481%3A0x4fdfcbc0d721fa90!2sLos%20Mariscos%20de%20Chich%C3%AD!5e1!3m2!1ses-419!2smx!4v1777334723482!5m2!1ses-419!2smx', link: 'https://www.google.com/maps/search/?api=1&query=Los+Mariscos+de+Chichi+Progreso' }
        ]
    };

    if (openZoneBtns.length > 0 && zoneModal) {
        openZoneBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const zone = btn.getAttribute('data-zone');
                const locations = locationsData[zone] || [];
                
                // Set Title
                const zoneLabelKey = `locations.zone_${zone}`;
                zoneModalTitle.textContent = window.siteTranslator ? window.siteTranslator.getValue(zoneLabelKey) : (zone.charAt(0).toUpperCase() + zone.slice(1));
                zoneModalTitle.setAttribute('data-i18n', zoneLabelKey);

                // Populate Locations
                zoneLocationsContainer.innerHTML = '';
                locations.forEach(loc => {
                    const name = window.siteTranslator ? window.siteTranslator.getValue(loc.nameKey) : loc.nameKey;
                    const desc = window.siteTranslator ? window.siteTranslator.getValue(loc.descKey) : loc.descKey;
                    const openMaps = window.siteTranslator ? window.siteTranslator.getValue('locations.open_maps') : 'Abrir en Maps';

                    const locHtml = `
                        <div class="location-item-premium">
                            <div class="map-wrapper">
                                <iframe src="${loc.map}" width="100%" height="220" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
                            </div>
                            <div class="location-info-premium">
                                <h4 data-i18n="${loc.nameKey}" style="display: block !important; visibility: visible !important;">${name}</h4>
                                <p data-i18n="${loc.descKey}" style="display: block !important; visibility: visible !important;">${desc}</p>
                            </div>
                        </div>
                    `;
                    zoneLocationsContainer.insertAdjacentHTML('beforeend', locHtml);
                });

                if (window.siteTranslator) {
                    window.siteTranslator.translatePage();
                }

                zoneModal.classList.add('active');
                document.body.classList.add('modal-open');
            });
        });

        zoneModalClose.addEventListener('click', () => {
            zoneModal.classList.remove('active');
            document.body.classList.remove('modal-open');
        });

        window.addEventListener('click', (e) => {
            if (e.target === zoneModal) {
                zoneModal.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        });
    }
});
