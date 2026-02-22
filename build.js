// ============================================
// 1-DARTS PRO - Build Script
// Generates product pages and catalogue cards
// from data/produits.json
// ============================================

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

// Paths
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'data', 'produits.json');
const PRODUCT_TEMPLATE = path.join(ROOT, 'templates', 'product-page.ejs');
const CARD_TEMPLATE = path.join(ROOT, 'templates', 'catalogue-card.ejs');

// BUILD marker regex: matches <!-- BUILD:START:id --> ... <!-- BUILD:END:id -->
const BUILD_MARKER_REGEX = /^(\s*)<!-- BUILD:START:(\S+) -->.*?<!-- BUILD:END:\2 -->/gms;

// ---- Load data and templates ----

console.log('📦 Loading product data...');
const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const { products } = data;

console.log(`   Found ${products.length} products`);

const productTemplateStr = fs.readFileSync(PRODUCT_TEMPLATE, 'utf8');
const cardTemplateStr = fs.readFileSync(CARD_TEMPLATE, 'utf8');

// ---- Validation ----

console.log('\n✅ Validating data...');
let errors = 0;

// Check unique slugs
const slugs = products.map(p => p.slug);
const uniqueSlugs = new Set(slugs);
if (uniqueSlugs.size !== slugs.length) {
    console.error('   ❌ Duplicate slugs found!');
    errors++;
}

// Check required fields
const requiredFields = ['id', 'slug', 'directory', 'name', 'pageTitle', 'badge', 'subtitle', 'description', 'specs', 'features', 'cta', 'related', 'catalogueCard', 'otherProductCard'];
products.forEach(product => {
    requiredFields.forEach(field => {
        if (!product[field]) {
            console.error(`   ❌ Product "${product.slug || product.id}": missing field "${field}"`);
            errors++;
        }
    });
});

// Check related references
products.forEach(product => {
    if (product.related) {
        product.related.forEach(slug => {
            if (!products.find(p => p.slug === slug)) {
                console.error(`   ❌ Product "${product.slug}": related product "${slug}" not found`);
                errors++;
            }
        });
    }
});

if (errors > 0) {
    console.error(`\n❌ ${errors} error(s) found. Aborting build.`);
    process.exit(1);
}

console.log('   All validations passed.');

// ---- Generate product pages ----

console.log('\n📄 Generating product pages...');

products.forEach(product => {
    const outputDir = path.join(ROOT, product.directory);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, `${product.slug}.html`);
    const html = ejs.render(productTemplateStr, {
        product: product,
        allProducts: products
    });

    fs.writeFileSync(outputFile, html, 'utf8');
    console.log(`   ✓ ${product.directory}/${product.slug}.html`);
});

// ---- Build catalogue index ----

console.log('\n🃏 Building catalogue cards...');

// Group cards by page and section
const catalogueIndex = {};

products.forEach(product => {
    const card = product.catalogueCard;
    if (!card) return;

    if (!catalogueIndex[card.page]) {
        catalogueIndex[card.page] = {};
    }
    if (!catalogueIndex[card.page][card.section]) {
        catalogueIndex[card.page][card.section] = [];
    }

    catalogueIndex[card.page][card.section].push({
        product: product,
        card: card
    });
});

// Sort cards within each section by order
Object.keys(catalogueIndex).forEach(page => {
    Object.keys(catalogueIndex[page]).forEach(section => {
        catalogueIndex[page][section].sort((a, b) => a.card.order - b.card.order);
    });
});

// ---- Inject cards into HTML pages ----

const pageFiles = {
    'index': path.join(ROOT, 'index.html')
};

Object.keys(catalogueIndex).forEach(page => {
    const htmlFile = pageFiles[page];
    if (!htmlFile) {
        console.warn(`   ⚠ No HTML file mapped for page "${page}"`);
        return;
    }

    if (!fs.existsSync(htmlFile)) {
        console.warn(`   ⚠ File not found: ${htmlFile}`);
        return;
    }

    let html = fs.readFileSync(htmlFile, 'utf8');
    let replacements = 0;

    html = html.replace(BUILD_MARKER_REGEX, (match, indent, sectionId) => {
        const items = catalogueIndex[page] && catalogueIndex[page][sectionId];
        if (!items || items.length === 0) {
            console.warn(`   ⚠ No cards found for section "${sectionId}" on page "${page}"`);
            return match;
        }

        let cardsHtml = '';
        items.forEach(({ product, card }) => {
            cardsHtml += ejs.render(cardTemplateStr, {
                product: product,
                card: card
            });
        });

        replacements++;
        return `${indent}<!-- BUILD:START:${sectionId} -->\n${cardsHtml}${indent}<!-- BUILD:END:${sectionId} -->`;
    });

    if (replacements > 0) {
        fs.writeFileSync(htmlFile, html, 'utf8');
        console.log(`   ✓ ${path.basename(htmlFile)}: ${replacements} section(s) updated`);
    } else {
        console.warn(`   ⚠ ${path.basename(htmlFile)}: no BUILD markers found`);
    }
});

// ---- Summary ----

console.log('\n🎯 Build complete!');
console.log(`   ${products.length} product pages generated`);
console.log(`   Catalogue cards injected into index.html`);
