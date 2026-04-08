/**
 * footer.js — Componente de Footer compartido
 * Inserta el footer en el elemento #footer-placeholder de cada página.
 */
(function () {
    const footerHTML = `
    <footer style="background-color: var(--cream, #fdfbf7); padding-top: 80px;">
        <div class="container footer-content" style="gap: 60px;">
            <div class="footer-brand"
                style="display: flex; flex-direction: column; gap: 10px; align-items: center; text-align: center;">
                <img src="assets/logoHelados.png" alt="Logo Casfrela"
                    style="height: 70px; width: 70px; align-self: center; margin-bottom: 5px; object-fit: contain; mix-blend-mode: multiply;">
                <h2 class="logo-text" style="font-size: 1.8rem; margin: 0;">CASFRELA <span
                        class="accent" style="color: var(--logo-orange);">ARTESANALES</span></h2>
                <p style="color: var(--text-dark); line-height: 1.6;" data-i18n="footer.brand_desc">Tradición y
                    sabor natural auténticamente
                    yucateco. Llevando la frescura del campo a tu paladar.</p>
            </div>
            <div class="footer-links">
                <h4 style="color: var(--logo-brown); font-size: 1.2rem; font-weight: 700; margin-bottom: 20px;"
                    data-i18n="footer.nav_title">
                    Navegación</h4>
                <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 12px;">
                    <li><a href="index.html"
                            style="color: var(--text-dark); transition: color 0.3s; display: inline-block;"
                            data-i18n="nav.home">Inicio</a>
                    </li>
                    <li><a href="nosotros.html"
                            style="color: var(--text-dark); transition: color 0.3s; display: inline-block;"
                            data-i18n="nav.about">Nosotros</a>
                    </li>
                    <li><a href="productos.html"
                            style="color: var(--text-dark); transition: color 0.3s; display: inline-block;"
                            data-i18n="nav.products">Productos</a>
                    </li>
                    <li><a href="eventos.html"
                            style="color: var(--text-dark); transition: color 0.3s; display: inline-block;"
                            data-i18n="nav.events">Eventos</a>
                    </li>
                    <li><a href="contacto.html"
                            style="color: var(--text-dark); transition: color 0.3s; display: inline-block;"
                            data-i18n="nav.contact">Contacto</a>
                    </li>
                </ul>
            </div>
            <div class="footer-social">
                <h4 style="color: var(--logo-brown); font-size: 1.2rem; font-weight: 700; margin-bottom: 20px;"
                    data-i18n="footer.social_title">
                    Conecta con nosotros</h4>
                <p style="color: var(--text-dark); margin-bottom: 20px; font-size: 0.95rem;"
                    data-i18n="footer.social_desc">Síguenos y contáctanos
                    para hacer tu pedido o cotizar eventos.</p>
                <div class="social-icons-premium">
                    <a href="https://www.facebook.com/115710801020605/" target="_blank" class="social-icon"
                        aria-label="Facebook">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                        </svg>
                    </a>
                    <a href="https://www.instagram.com/maya_helados_artesanales" target="_blank" class="social-icon"
                        aria-label="Instagram">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </a>
                    <a href="https://wa.me/5219993960148" target="_blank" class="social-icon" aria-label="WhatsApp">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <path
                                d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z">
                            </path>
                        </svg>
                    </a>
                    <a href="mailto:casfrelaheladosartesanales@gmail.com" class="social-icon" aria-label="Gmail">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z">
                            </path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
        <div class="footer-bottom"
            style="text-align: center; padding: 25px 0; border-top: 1px solid rgba(0, 0, 0, 0.08); font-size: 0.9rem; color: var(--text-light); margin-top: 20px;">
            <p data-i18n="footer.copyright">&copy; 2026 Helados Casfrela. Todos los derechos reservados.</p>
        </div>
    </footer>`;

    const placeholder = document.getElementById('footer-placeholder');
    if (placeholder) {
        placeholder.outerHTML = footerHTML;
    }
})();
