const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRe476Q6ntGtSXrRN4FyWRsdtb_nlTC4zcxKER2AZqKssyiclKA4IQlKH_3GqhDFm-rpj9-zUBJm62/pub?output=csv';

async function loadBrandProducts() {
    const params = new URLSearchParams(window.location.search);
    const brandName = params.get('brand');
    
    const titleElement = document.getElementById('brand-title');
    const container = document.getElementById('brand-catalog-container');

    if (!brandName) {
        titleElement.innerText = "All Brands";
        return;
    }

    titleElement.innerText = brandName;

    try {
        const response = await fetch(sheetURL);
        const data = await response.text();
        const rows = data.split('\n').slice(1);

        // Map the columns based on your new sheet structure
        const brandProducts = rows.map(row => {
            const cols = row.split(',');
            return {
                name: cols[0]?.trim(),
                price: cols[1]?.trim(),
                category: cols[2]?.trim(),
                image: cols[3]?.trim(),
                brand: cols[6]?.trim() // Column G (Index 6) is your Brand column
            };
        }).filter(p => p.name && p.brand && p.brand.toLowerCase() === brandName.toLowerCase());

        if (brandProducts.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                    <p>Currently no products available for ${brandName}.</p>
                    <a href="product.html" style="color: var(--orange);">View all products</a>
                </div>`;
            return;
        }

        container.innerHTML = brandProducts.map(product => `
            <div class="product-card" onclick="window.location.href='details.html?name=${encodeURIComponent(product.name)}'">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300'">
                <div class="product-info">
                    <span class="tag">${product.category}</span>
                    <h3>${product.name}</h3>
                    <p class="price">RM ${product.price}</p>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error("Error loading brand products:", error);
        container.innerHTML = "<p>Error loading products. Please try again later.</p>";
    }
}

loadBrandProducts();