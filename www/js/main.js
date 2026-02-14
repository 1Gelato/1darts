// ============================================
// 1-DARTS PRO - Main JS (Security, Form, Animations)
// ============================================

// Security Utilities
const Security = {
    sqlPatterns: [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|UNION|DECLARE)\b)/gi,
        /(-{2}|\/\*|\*\/|;|\bOR\b\s+\d+=\d+|\bAND\b\s+\d+=\d+)/gi,
        /(["'])\s*(OR|AND)\s*\1?\s*[=<>]/gi,
        /\b(CHAR|NCHAR|VARCHAR|NVARCHAR)\s*\(/gi,
        /(\%27)|(\')|(\-\-)|(\%23)|(#)/gi
    ],
    xssPatterns: [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<\s*img[^>]+onerror/gi,
        /<\s*svg[^>]+onload/gi,
        /data:\s*text\/html/gi
    ],
    escapeHtml(str) {
        const htmlEscapes = {
            '&': '&amp;', '<': '&lt;', '>': '&gt;',
            '"': '&quot;', "'": '&#x27;', '/': '&#x2F;',
            '`': '&#x60;', '=': '&#x3D;'
        };
        return String(str).replace(/[&<>"'`=/]/g, char => htmlEscapes[char]);
    },
    sanitize(input) {
        if (typeof input !== 'string') return '';
        let sanitized = input.trim();
        sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
        sanitized = this.escapeHtml(sanitized);
        return sanitized;
    },
    containsDangerousPatterns(input) {
        const allPatterns = [...this.sqlPatterns, ...this.xssPatterns];
        return allPatterns.some(pattern => pattern.test(input));
    },
    validateInput(input, fieldName) {
        const errors = [];
        if (this.containsDangerousPatterns(input)) {
            errors.push(`Le champ ${fieldName} contient des caractères non autorisés.`);
        }
        return errors;
    },
    generateToken() {
        const array = new Uint32Array(4);
        crypto.getRandomValues(array);
        return Array.from(array, x => x.toString(16)).join('');
    }
};

// Contact Form
const ContactForm = {
    form: null,
    submitBtn: null,
    lastSubmitTime: 0,
    minSubmitInterval: 3000,
    formLoadTime: Date.now(),

    init() {
        this.form = document.getElementById('contactForm');
        this.submitBtn = document.getElementById('submitBtn');
        if (!this.form) return;

        const tokenEl = document.getElementById('formToken');
        const timestampEl = document.getElementById('formTimestamp');
        if (tokenEl) tokenEl.value = Security.generateToken();
        if (timestampEl) timestampEl.value = this.formLoadTime;

        this.setupValidation();
        this.setupCharacterCount();
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    },

    setupValidation() {
        const inputs = this.form.querySelectorAll('input[required], input[pattern]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => {
                const errorEl = document.getElementById(`${input.id}-error`);
                if (errorEl) errorEl.textContent = '';
            });
        });
    },

    setupCharacterCount() {
        const messageField = document.getElementById('message');
        const countEl = document.getElementById('message-count');
        if (messageField && countEl) {
            messageField.addEventListener('input', () => {
                const count = messageField.value.length;
                const max = messageField.maxLength;
                countEl.textContent = `${count} / ${max}`;
                countEl.classList.remove('warning', 'danger');
                if (count > max * 0.9) countEl.classList.add('danger');
                else if (count > max * 0.75) countEl.classList.add('warning');
            });
        }
    },

    validateField(input) {
        const errorEl = document.getElementById(`${input.id}-error`);
        if (!errorEl) return true;
        let isValid = true;
        let errorMsg = '';

        const securityErrors = Security.validateInput(input.value, input.name);
        if (securityErrors.length > 0) {
            isValid = false;
            errorMsg = securityErrors[0];
        }
        if (isValid && !input.validity.valid) {
            isValid = false;
            if (input.validity.valueMissing) errorMsg = 'Ce champ est obligatoire.';
            else if (input.validity.typeMismatch) errorMsg = 'Format invalide.';
            else if (input.validity.patternMismatch) errorMsg = input.title || 'Format incorrect.';
            else if (input.validity.tooLong) errorMsg = `Maximum ${input.maxLength} caractères.`;
        }
        errorEl.textContent = errorMsg;
        return isValid;
    },

    validateAllFields() {
        const inputs = this.form.querySelectorAll('input:not([type="hidden"]), textarea, select');
        let isValid = true;
        inputs.forEach(input => {
            if (input.id === 'website') return;
            if (!this.validateField(input)) isValid = false;
        });
        return isValid;
    },

    checkHoneypot() {
        const honeypot = document.getElementById('website');
        return honeypot && honeypot.value === '';
    },

    checkRateLimit() {
        const now = Date.now();
        if (now - this.lastSubmitTime < this.minSubmitInterval) return false;
        this.lastSubmitTime = now;
        return true;
    },

    checkTimestamp() {
        return (Date.now() - this.formLoadTime) > 2000;
    },

    setLoading(loading) {
        const btnText = this.submitBtn.querySelector('.btn-text');
        const btnLoading = this.submitBtn.querySelector('.btn-loading');
        if (loading) {
            this.submitBtn.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'inline-flex';
        } else {
            this.submitBtn.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    },

    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        formData.forEach((value, key) => {
            if (key === 'website') return;
            data[key] = Security.sanitize(value);
        });
        return data;
    },

    showSuccess() {
        this.form.innerHTML = `
            <div class="form-success">
                <h3>&#10004; Demande envoy\u00e9e avec succ\u00e8s !</h3>
                <p>Merci pour votre int\u00e9r\u00eat. Notre \u00e9quipe commerciale vous contactera dans les plus brefs d\u00e9lais.</p>
            </div>
        `;
    },

    showError(message) {
        const existingError = this.form.querySelector('.form-global-error');
        if (existingError) existingError.remove();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-global-error';
        errorDiv.style.cssText = 'background: rgba(255,59,74,0.1); border: 1px solid var(--accent-red); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; color: var(--accent-red);';
        errorDiv.textContent = message;
        this.form.insertBefore(errorDiv, this.form.firstChild);
    },

    async handleSubmit(e) {
        e.preventDefault();
        if (!this.checkHoneypot()) {
            setTimeout(() => this.showSuccess(), 1500);
            return;
        }
        if (!this.checkTimestamp()) {
            this.showError('Veuillez patienter quelques secondes avant de soumettre.');
            return;
        }
        if (!this.checkRateLimit()) {
            this.showError('Veuillez patienter avant de renvoyer le formulaire.');
            return;
        }
        if (!this.validateAllFields()) {
            this.showError('Veuillez corriger les erreurs dans le formulaire.');
            return;
        }

        this.setLoading(true);
        const data = this.getFormData();

        try {
            const formData = new FormData(this.form);
            const response = await fetch('contact.php', { method: 'POST', body: formData });
            const result = await response.json();
            this.setLoading(false);
            if (result.success) this.showSuccess();
            else this.showError(result.message || 'Une erreur est survenue. Veuillez r\u00e9essayer.');
        } catch (error) {
            this.setLoading(false);
            this.showError('Une erreur est survenue. Veuillez r\u00e9essayer ou nous contacter par t\u00e9l\u00e9phone.');
        }
    }
};

// Intersection Observer for animations
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.service-card, .product-card, .advantage-card, .accessories-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease-out';
        observer.observe(card);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    ContactForm.init();
    initAnimations();
});
