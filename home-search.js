/* home-search.js */

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('home-search-input');
    const resultsDropdown = document.getElementById('search-results-dropdown');
    const searchForm = document.getElementById('home-search-form');
    
    // Using your Google Sheet URL
    const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRe476Q6ntGtSXrRN4FyWRsdtb_nlTC4zcxKER2AZqKssyiclKA4IQlKH_3GqhDFm-rpj9-zUBJm62/pub?output=csv';

    let allProducts = [];

    // Fetch data from Google Sheets
    async function fetchProducts() {
        try {
            const response = await fetch(sheetURL);
            const data = await response.text();
            // Split by rows and skip header, then handle potential CSV issues
            const rows = data.split('\n').slice(1);
            
            allProducts = rows.map(row => {
                // This simple split works if your data doesn't have commas inside quotes
                const cols = row.split(',');
                return {
                    name: cols[0]?.trim(),
                    price: cols[1]?.trim(),
                    category: cols[2]?.trim(),
                    image: cols[3]?.trim()
                };
            }).filter(p => p.name);
        } catch (err) {
            console.error("Search failed to load products", err);
        }
    }

    // Filter products as user types
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            resultsDropdown.innerHTML = '';

            if (query.length < 1) {
                resultsDropdown.style.display = 'none';
                return;
            }

            const matches = allProducts.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.category.toLowerCase().includes(query)
            ).slice(0, 6);

            if (matches.length > 0) {
                matches.forEach(p => {
                    const item = document.createElement('div');
                    item.className = 'search-item';
                    item.innerHTML = `
                        <img src="${p.image}" onerror="this.src='https://via.placeholder.com/40'">
                        <div>
                            <h4>${p.name}</h4>
                            <p>RM ${p.price}</p>
                        </div>
                    `;
                    item.onclick = () => {
                        window.location.href = `details.html?name=${encodeURIComponent(p.name)}`;
                    };
                    resultsDropdown.appendChild(item);
                });
                resultsDropdown.style.display = 'block';
            } else {
                resultsDropdown.style.display = 'none';
            }
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (searchForm && !searchForm.contains(e.target)) {
            resultsDropdown.style.display = 'none';
        }
    });

    // Handle "Enter" or Button Click
    if (searchForm) {
        searchForm.onsubmit = (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `product.html?search=${encodeURIComponent(query)}`;
            }
        };
    }

    fetchProducts();
});