/**
 * navbar.js — Componente de Navbar compartido
 * Inserta el navbar en el elemento #navbar-placeholder de cada página
 * y marca automáticamente el enlace activo según la URL actual.
 */
(function () {
    const pages = [
        { href: 'index.html', key: 'nav.home', default: 'Inicio' },
        { href: 'nosotros.html', key: 'nav.about', default: 'Nosotros' },
        { href: 'productos.html', key: 'nav.products', default: 'Productos' },
        { href: 'galeria.html', key: 'nav.gallery', default: 'Galería' },
        { href: 'contacto.html', key: 'nav.contact', default: 'Contacto' },
    ];

    // Determine current page
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';

    const links = pages.map(p => {
        const isActive = currentFile === p.href ? ' class="active"' : '';
        return `<li><a href="${p.href}"${isActive} data-i18n="${p.key}">${p.default}</a></li>`;
    }).join('\n                    ');

    const navHTML = `
    <nav id="main-nav">
        <div class="container nav-content">
            <div class="logo">
                <a href="index.html">
                    <img src="assets/logoHelados.png" alt="Helados Casfrela Logo"
                        style="height: 50px; margin-right: 10px; vertical-align: middle; border-radius: 5px;">
                    <span class="logo-text">CASFRELA</span>
                </a>
            </div>
            <div class="nav-actions" style="display: flex; align-items: center; gap: 20px;">
                <ul class="nav-links">
                    ${links}
                </ul>
                <div class="cart-nav-container">
                    <button id="cart-btn" class="cart-btn-nav">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2"
                            fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <span id="cart-count" class="cart-badge">0</span>
                    </button>
                </div>
                <div class="lang-selector-modern">
                    <button class="lang-btn" data-lang="es">ES</button>
                    <div class="lang-divider"></div>
                    <button class="lang-btn" data-lang="en">EN</button>
                </div>
            </div>
            <div class="mobile-menu-btn">
                <span></span><span></span><span></span>
            </div>
        </div>
    </nav>`;

    const placeholder = document.getElementById('navbar-placeholder');
    if (placeholder) {
        placeholder.outerHTML = navHTML;
    }
})();
