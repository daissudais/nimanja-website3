const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRe476Q6ntGtSXrRN4FyWRsdtb_nlTC4zcxKER2AZqKssyiclKA4IQlKH_3GqhDFm-rpj9-zUBJm62/pub?output=csv';

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const itemsPerPage = 16; 

async function loadProducts() {
    const response = await fetch(sheetURL);
    const data = await response.text();
    const rows = data.split('\n').slice(1); 
    
    allProducts = rows.map(row => {
        const [name, price, category, image, description, extra] = row.split(',');
        return { 
            name: name?.trim(), 
            price: price?.trim(), 
            category: category?.trim(), 
            image: image?.trim(), 
            description: description?.trim(), 
            extra: extra?.trim() 
        };
    }).filter(p => p.name);

    filteredProducts = [...allProducts];

    // NEW: Check if there's a search or category query in the URL from the Homepage
    const params = new URLSearchParams(window.location.search);
    const urlSearch = params.get('search');
    const urlCat = params.get('category');

    setupFilters(urlSearch, urlCat); // Pass URL values to setup
    // Initial filter application is now handled inside setupFilters
}

function renderPage() {
    const container = document.getElementById('catalog-container');
    container.innerHTML = ""; 

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = filteredProducts.slice(start, end);

    if (paginatedItems.length === 0) {
        container.innerHTML = "<div style='grid-column: 1/-1; text-align: center; padding: 80px 20px;'><h2 style='color: #ccc;'>No products found matching your search.</h2><p>Try a different keyword or category.</p></div>";
    }

    paginatedItems.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300'">
            <div class="product-info">
                <span class="tag">${product.category}</span>
                <h3>${product.name}</h3>
                <p class="price">RM ${product.price}</p>
            </div>
        `;
        card.onclick = () => {
            window.location.href = `details.html?name=${encodeURIComponent(product.name)}`;
        };
        container.appendChild(card);
    });

    renderPagination();
}

function setupFilters(initialSearch, initialCat) {
    const searchForm = document.querySelector('.filter-search');
    const searchInput = searchForm.querySelector('input');
    const categorySelect = document.querySelector('.filter-options select:first-child');
    const sortSelect = document.querySelector('.filter-options select:last-child');

    // Fill search or category if it came from the Homepage
    if (initialSearch) searchInput.value = initialSearch;
    if (initialCat) categorySelect.value = initialCat;

    // Apply filters immediately if URL had params
    applyFilters();

    // 1. Live Search (Type to filter)
    searchInput.oninput = () => applyFilters();

    // 2. Search Bar Form Submit
    searchForm.onsubmit = (e) => {
        e.preventDefault();
        applyFilters();
    };

    // 3. Dropdowns
    categorySelect.onchange = () => applyFilters();
    sortSelect.onchange = () => applyFilters();

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedCat = categorySelect.value;
        const sortOrder = sortSelect.value;

        // IMPROVED FILTER LOGIC (Matches Home Search style)
        filteredProducts = allProducts.filter(p => {
            // Search inside Name AND Category
            const matchesSearch = p.name.toLowerCase().includes(searchTerm) || 
                                 p.category.toLowerCase().includes(searchTerm);
            
            // Match Category Dropdown
            const matchesCategory = (selectedCat === "All Categories") || (p.category === selectedCat);
            
            return matchesSearch && matchesCategory;
        });

        // Sorting Logic
        if (sortOrder === "Price: Low to High") {
            filteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (sortOrder === "Price: High to Low") {
            filteredProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        } else if (sortOrder === "Newest") {
            // Since sheet order is top-to-bottom, we reverse it
            filteredProducts.reverse(); 
        }

        currentPage = 1; 
        renderPage();
    }
}

function renderPagination() {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = ""; 
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    if (totalPages <= 1) return; // Hide pagination if only 1 page

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('a');
        btn.href = "#";
        btn.innerText = i;
        btn.className = i === currentPage ? "page-btn active" : "page-btn";
        btn.onclick = (e) => {
            e.preventDefault();
            currentPage = i;
            renderPage();
            window.scrollTo(0, 0);
        };
        paginationContainer.appendChild(btn);
    }
}

loadProducts();