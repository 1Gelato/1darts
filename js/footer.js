// ============================================
// 1-DARTS PRO - Footer Component
// ============================================

function loadFooter() {
    // Detect base path based on current page location
    const path = window.location.pathname;
    const inSubfolder = path.includes('/produits/');
    const base = inSubfolder ? '../' : '';

    const footer = document.createElement('footer');
    footer.innerHTML = `
        <div class="footer-container">
            <div class="footer-brand">
                <a href="${base}index.html" class="logo">1-DARTS <span>PRO</span></a>
                <p>Leader fran\u00e7ais de la vente, location et exploitation de jeux de fl\u00e9chettes \u00e9lectroniques professionnels. 28 ans d'exp\u00e9rience.</p>
                <div class="social-links">
                    <a href="#" aria-label="Facebook">f</a>
                    <a href="#" aria-label="Instagram">ig</a>
                    <a href="#" aria-label="LinkedIn">in</a>
                    <a href="#" aria-label="YouTube">yt</a>
                </div>
            </div>
            <div class="footer-column">
                <h4>Services</h4>
                <ul>
                    <li><a href="${base}index.html#services">Vente</a></li>
                    <li><a href="${base}index.html#services">Location</a></li>
                    <li><a href="${base}index.html#services">Exploitation</a></li>
                    <li><a href="${base}index.html#contact">Animations</a></li>
                </ul>
            </div>
            <div class="footer-column">
                <h4>Produits</h4>
                <ul>
                    <li><a href="${base}produits/d-one.html">D-ONE</a></li>
                    <li><a href="${base}produits/d-two.html">D-TWO</a></li>
                    <li><a href="${base}produits/d-wall.html">D-WALL</a></li>
                    <li><a href="${base}accessoires.html">Accessoires</a></li>
                    <li><a href="${base}pieces-detachees.html">Pi\u00e8ces d\u00e9tach\u00e9es</a></li>
                </ul>
            </div>
            <div class="footer-column">
                <h4>Support</h4>
                <ul>
                    <li><a href="#">FAQ</a></li>
                    <li><a href="#">Documentation</a></li>
                    <li><a href="#">Assistance technique</a></li>
                    <li><a href="#">Vid\u00e9os</a></li>
                    <li><a href="${base}index.html#contact">Contact</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <span>\u00a9 2026 1-Darts Pro \u2014 Soci\u00e9t\u00e9 Ogelato. Tous droits r\u00e9serv\u00e9s.</span>
            <span>
                <a href="#">Mentions l\u00e9gales</a>
                <a href="#">Politique de confidentialit\u00e9</a>
            </span>
        </div>
    `;

    const target = document.getElementById('footer-placeholder');
    if (target) {
        target.replaceWith(footer);
    } else {
        document.body.appendChild(footer);
    }
}

document.addEventListener('DOMContentLoaded', loadFooter);
