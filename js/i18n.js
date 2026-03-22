/**
 * Simple Vanilla JS i18n class
 */
class Translator {
    constructor() {
        this.defaultLang = 'es';
        this.currentLang = localStorage.getItem('site_lang') || this.defaultLang;
        this.translations = {};
        this.fallbackTranslations = {};
    }

    async init() {
        // Cargar idioma español por defecto como fallback (para llenar los vacíos si en inglés falta algo)
        this.fallbackTranslations = await this.fetchTranslations(this.defaultLang);
        
        if (this.currentLang !== this.defaultLang) {
            this.translations = await this.fetchTranslations(this.currentLang);
        } else {
            this.translations = this.fallbackTranslations;
        }

        this.translatePage();
        this.setupSwitcher();
    }

    async fetchTranslations(lang) {
        try {
            const response = await fetch(`lang/${lang}.json`);
            if (!response.ok) {
                console.warn(`No se pudo cargar el idioma: ${lang}`);
                return {};
            }
            return await response.json();
        } catch (error) {
            console.error(`Error de red cargando idioma ${lang}:`, error);
            return {};
        }
    }

    async setLanguage(lang) {
        if (lang === this.currentLang) return;
        
        this.currentLang = lang;
        localStorage.setItem('site_lang', lang);
        document.documentElement.lang = lang;
        
        if (lang !== this.defaultLang) {
            this.translations = await this.fetchTranslations(lang);
        } else {
            this.translations = this.fallbackTranslations;
        }
        
        this.translatePage();
    }

    translatePage() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.getValue(key);
            
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.hasAttribute('placeholder')) el.placeholder = translation;
                else if (el.type === 'button' || el.type === 'submit') el.value = translation;
            } else if (el.tagName === 'BUTTON') {
                el.textContent = translation;
            } else {
                el.textContent = translation;
            }
        });

        // Translate document title
        let titleKey = 'page.home';
        const path = window.location.pathname;
        if (path.includes('nosotros')) titleKey = 'page.about';
        else if (path.includes('productos')) titleKey = 'page.products';
        else if (path.includes('galeria')) titleKey = 'page.gallery';
        else if (path.includes('contacto')) titleKey = 'page.contact';

        const pageTitle = this.getValue(titleKey);
        if (pageTitle && pageTitle !== titleKey) {
            document.title = pageTitle;
        }

        // Translate specific attributes if any (like data-title, data-desc for products)
        const attrElements = document.querySelectorAll('[data-i18n-attr]');
        attrElements.forEach(el => {
            const mapping = el.getAttribute('data-i18n-attr'); // Format: attr1:key1,attr2:key2
            mapping.split(',').forEach(pair => {
                const [attr, key] = pair.split(':');
                if (attr && key) {
                    const translation = this.getValue(key);
                    el.setAttribute(attr, translation);
                }
            });
        });
    }

    getValue(key) {
        return this.translations[key] || this.fallbackTranslations[key] || key;
    }

    setupSwitcher() {
        const switchers = document.querySelectorAll('select.language-switcher');
        switchers.forEach(switcher => {
            switcher.value = this.currentLang;
            switcher.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        });

        const langBtns = document.querySelectorAll('.lang-btn');
        langBtns.forEach(btn => {
            if (btn.getAttribute('data-lang') === this.currentLang) {
                btn.classList.add('active');
            }
            btn.addEventListener('click', (e) => {
                const lang = e.target.getAttribute('data-lang');
                this.setLanguage(lang);
                // Update active state
                document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll(`.lang-btn[data-lang="${lang}"]`).forEach(b => b.classList.add('active'));
            });
        });
    }
}

// Iniciar traductor al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    window.siteTranslator = new Translator();
    window.siteTranslator.init();
});
