// ============================================
// 1-DARTS PRO - Navbar Component
// ============================================

function loadNavbar() {
    // Detect base path based on current page location
    const path = window.location.pathname;
    const inSubfolder = path.includes('/produits/');
    const base = inSubfolder ? '../' : '';

    const nav = document.createElement('nav');
    nav.innerHTML = `
        <div class="nav-container">
            <a href="${base}index.html" class="logo"><img src="${base}images/logo-1darts-white.svg" alt="1-DARTS" class="logo-img"></a>
            <ul class="nav-links">
                <li><a href="${base}index.html#services">Qui sommes-nous</a></li>
                <li><a href="${base}index.html#services">Services</a></li>
                <li><a href="${base}index.html#contact">Animations &amp; Comp\u00e9titions</a></li>
                <li class="has-dropdown">
                    <a href="${base}index.html#products" class="nav-dropdown">Produits <span class="arrow">&#9660;</span></a>
                    <ul class="dropdown-menu">
                        <li><a href="${base}produits/d-one.html">D-ONE</a></li>
                        <li><a href="${base}produits/d-two.html">D-TWO</a></li>
                        <li><a href="${base}produits/d-wall.html">D-WALL</a></li>
                        <li><a href="${base}accessoires.html">Accessoires</a></li>
                        <li><a href="${base}pieces-detachees.html">Pi\u00e8ces D\u00e9tach\u00e9es</a></li>
                    </ul>
                </li>
                <li><a href="${base}index.html#advantages">Avantages</a></li>
                <li class="has-dropdown">
                    <a href="#" class="nav-dropdown">Aide <span class="arrow">&#9660;</span></a>
                    <ul class="dropdown-menu">
                        <li><a href="#">Support Blog</a></li>
                        <li><a href="#">FAQ</a></li>
                        <li><a href="#">Documentation</a></li>
                        <li><a href="#">Vid\u00e9os</a></li>
                        <li><a href="#">Assistance Technique</a></li>
                        <li><a href="${base}index.html#contact">Contact</a></li>
                    </ul>
                </li>
            </ul>
            <a href="${base}index.html#contact" class="nav-cta">Demander un devis</a>
            <button class="mobile-menu-btn" aria-label="Menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    `;

    const target = document.getElementById('navbar-placeholder');
    if (target) {
        target.replaceWith(nav);
    } else {
        document.body.insertBefore(nav, document.body.firstChild);
    }

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const mobileMenuBtn = nav.querySelector('.mobile-menu-btn');
    const navLinks = nav.querySelector('.nav-links');

    function isMobile() {
        return window.innerWidth <= 768;
    }

    function openMobileMenu() {
        mobileMenuBtn.classList.add('active');
        navLinks.classList.add('active');
        document.body.classList.add('menu-open');
    }

    function closeMobileMenu() {
        mobileMenuBtn.classList.remove('active');
        navLinks.classList.remove('active');
        // Close all open dropdowns
        navLinks.querySelectorAll('.dropdown-menu.open').forEach(menu => {
            menu.classList.remove('open');
        });
        navLinks.querySelectorAll('.nav-dropdown.dropdown-open').forEach(link => {
            link.classList.remove('dropdown-open');
        });
        document.body.classList.remove('menu-open');
    }

    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (navLinks.classList.contains('active')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    // Mobile dropdown toggle (tap to open/close submenus)
    navLinks.querySelectorAll('.nav-dropdown').forEach(dropdownLink => {
        dropdownLink.addEventListener('click', (e) => {
            if (isMobile()) {
                e.preventDefault();
                e.stopPropagation();
                const dropdownMenu = dropdownLink.parentElement.querySelector('.dropdown-menu');
                if (dropdownMenu) {
                    const isOpen = dropdownMenu.classList.contains('open');
                    // Close all other dropdowns first
                    navLinks.querySelectorAll('.dropdown-menu.open').forEach(menu => {
                        menu.classList.remove('open');
                    });
                    navLinks.querySelectorAll('.nav-dropdown.dropdown-open').forEach(link => {
                        link.classList.remove('dropdown-open');
                    });
                    // Toggle current one
                    if (!isOpen) {
                        dropdownMenu.classList.add('open');
                        dropdownLink.classList.add('dropdown-open');
                    }
                }
            }
        });
    });

    // Close mobile menu on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('nav') && navLinks.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // Smooth scroll for anchor links on same page
    // IMPORTANT: exclude .nav-dropdown links — those toggle dropdowns on mobile
    nav.querySelectorAll('a[href*="#"]:not(.nav-dropdown)').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const hashIndex = href.indexOf('#');
            if (hashIndex === -1) return;

            const hash = href.substring(hashIndex);
            const targetEl = document.querySelector(hash);

            if (targetEl) {
                e.preventDefault();
                closeMobileMenu();
                setTimeout(() => {
                    targetEl.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 50);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', loadNavbar);
