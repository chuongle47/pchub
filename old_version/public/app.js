// State Management
const state = {
  categories: [],
  brands: [],
  selectedCategoryId: '',
  selectedBrandIds: new Set(),
  searchQuery: '',
  minPrice: '',
  maxPrice: '',
  sortBy: 'price_asc',
  currentPage: 1,
  limit: 16,
  totalPages: 1,
  totalProducts: 0,
  compareList: new Map(), // Map of product_id -> product object
  dbConnected: false
};

// Product data cache for compare button click safety
const productCache = new Map();

// DOM Elements
const dbStatusBadge = document.getElementById('dbStatusBadge');
const categoryTabs = document.getElementById('categoryTabs');
const categorySelect = document.getElementById('categorySelect');
const brandList = document.getElementById('brandList');
const brandSearchInput = document.getElementById('brandSearchInput');
const selectedBrandCount = document.getElementById('selectedBrandCount');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const minPriceInput = document.getElementById('minPriceInput');
const maxPriceInput = document.getElementById('maxPriceInput');
const sortSelect = document.getElementById('sortSelect');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');
const productGrid = document.getElementById('productGrid');
const resultsCount = document.getElementById('resultsCount');
const activeFilterChips = document.getElementById('activeFilterChips');
const pagination = document.getElementById('pagination');

// Compare DOM
const compareBar = document.getElementById('compareBar');
const compareCount = document.getElementById('compareCount');
const compareItemsPreview = document.getElementById('compareItemsPreview');
const clearCompareBtn = document.getElementById('clearCompareBtn');
const openCompareModalBtn = document.getElementById('openCompareModalBtn');
const compareModal = document.getElementById('compareModal');
const closeCompareModalBtn = document.getElementById('closeCompareModalBtn');
const compareModalBody = document.getElementById('compareModalBody');

// Currency Formatter
function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  loadCompareFromStorage();
  await checkSystemStatus();
  await loadCategories();
  await loadBrands();
  await fetchProducts();

  setupEventListeners();
  updateCompareBarUI();

  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

// Check Server & DB Status
async function checkSystemStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    state.dbConnected = data.db_connected;

    if (data.db_connected) {
      dbStatusBadge.innerHTML = `
        <span class="status-indicator connected"></span>
        <span class="status-text">PostgreSQL: <strong>${data.product_count}</strong> sản phẩm</span>
      `;
    } else {
      dbStatusBadge.innerHTML = `
        <span class="status-indicator fallback"></span>
        <span class="status-text">${data.source} (${data.product_count} SP)</span>
      `;
    }
  } catch (err) {
    dbStatusBadge.innerHTML = `
      <span class="status-indicator fallback"></span>
      <span class="status-text">Offline Mode</span>
    `;
  }
}

// Fetch & Render Categories
async function loadCategories() {
  try {
    const res = await fetch('/api/categories');
    state.categories = await res.json();

    // Render Quick Tabs
    let tabsHTML = `
      <div class="category-tab ${state.selectedCategoryId === '' ? 'active' : ''}" data-id="">
        <i data-lucide="grid"></i> Tất cả
      </div>
    `;

    state.categories.forEach(cat => {
      tabsHTML += `
        <div class="category-tab ${state.selectedCategoryId === cat.id ? 'active' : ''}" data-id="${cat.id}">
          <span>${cat.name}</span>
          <span class="tab-badge">${cat.product_count}</span>
        </div>
      `;
    });
    categoryTabs.innerHTML = tabsHTML;

    // Render Select Dropdown
    let selectHTML = '<option value="">Tất cả danh mục</option>';
    state.categories.forEach(cat => {
      selectHTML += `<option value="${cat.id}" ${state.selectedCategoryId === cat.id ? 'selected' : ''}>${cat.name} (${cat.product_count})</option>`;
    });
    categorySelect.innerHTML = selectHTML;

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
}

// Fetch & Render Brands Filter List
async function loadBrands() {
  try {
    let url = '/api/brands';
    if (state.selectedCategoryId) {
      url += `?category_id=${state.selectedCategoryId}`;
    }
    const res = await fetch(url);
    state.brands = await res.json();
    renderBrandList();
  } catch (err) {
    console.error('Failed to load brands:', err);
  }
}

function renderBrandList(filterTerm = '') {
  let filtered = state.brands;
  if (filterTerm) {
    filtered = filtered.filter(b => b.name.toLowerCase().includes(filterTerm.toLowerCase()));
  }

  if (filtered.length === 0) {
    brandList.innerHTML = `<div class="text-dim" style="padding: 10px; font-size: 0.8rem;">Không tìm thấy brand nào</div>`;
    return;
  }

  let html = '';
  filtered.forEach(b => {
    const isChecked = state.selectedBrandIds.has(b.id);
    html += `
      <div class="brand-checkbox-item">
        <label>
          <input type="checkbox" value="${b.id}" ${isChecked ? 'checked' : ''} class="brand-checkbox">
          <span>${b.name}</span>
        </label>
        <span class="brand-count">${b.product_count || 0}</span>
      </div>
    `;
  });
  brandList.innerHTML = html;

  // Update brand counter label
  if (state.selectedBrandIds.size === 0) {
    selectedBrandCount.textContent = 'All';
  } else {
    selectedBrandCount.textContent = `${state.selectedBrandIds.size} chọn`;
  }
}

// Main Fetch Products Function
async function fetchProducts() {
  renderSkeletons();

  const params = new URLSearchParams({
    page: state.currentPage,
    limit: state.limit,
    sort: state.sortBy
  });

  if (state.selectedCategoryId) params.append('category_id', state.selectedCategoryId);
  if (state.selectedBrandIds.size > 0) params.append('brand_id', Array.from(state.selectedBrandIds).join(','));
  if (state.searchQuery) params.append('search', state.searchQuery);
  if (state.minPrice) params.append('min_price', state.minPrice);
  if (state.maxPrice) params.append('max_price', state.maxPrice);

  try {
    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();

    state.totalProducts = data.pagination.total;
    state.totalPages = data.pagination.totalPages;

    resultsCount.textContent = `Hiển thị ${data.products.length} / ${data.pagination.total} sản phẩm`;

    renderProducts(data.products);
    renderPagination();
  } catch (err) {
    console.error('Error fetching products:', err);
    productGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
        <i data-lucide="alert-circle" style="width: 48px; height: 48px; margin-bottom: 12px; color: #ef4444;"></i>
        <p>Lỗi kết nối khi tải danh sách sản phẩm.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }
}

function renderSkeletons() {
  let html = '';
  for (let i = 0; i < 8; i++) {
    html += `<div class="skeleton-card"></div>`;
  }
  productGrid.innerHTML = html;
}

function renderProducts(products) {
  if (products.length === 0) {
    productGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <i data-lucide="package-x" style="width: 54px; height: 54px; margin-bottom: 16px; color: var(--text-dim);"></i>
        <h3>Không tìm thấy linh kiện phù hợp</h3>
        <p style="font-size: 0.9rem; margin-top: 6px;">Thử thay đổi hoặc đặt lại bộ lọc danh mục và thương hiệu.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  // Cache product data for safe compare
  products.forEach(p => productCache.set(p.id, p));

  let html = '';
  products.forEach(p => {
    const isComparing = state.compareList.has(p.id);

    // Format top spec highlights
    let specChips = '';
    if (p.specs && typeof p.specs === 'object') {
      const specEntries = Object.entries(p.specs).slice(0, 4);
      specEntries.forEach(([k, v]) => {
        let val = v;
        if (Array.isArray(val)) val = val.join(', ');
        if (typeof val === 'boolean') val = val ? 'Có' : 'Không';
        const label = k.replace(/_/g, ' ');
        specChips += `<span class="spec-chip"><strong>${label}:</strong> ${val}</span>`;
      });
    }

    const stockBadge = p.stock > 0
      ? `<span style="font-size:0.72rem;background:rgba(16,185,129,0.15);color:#34d399;padding:2px 8px;border-radius:6px;">Còn hàng</span>`
      : `<span style="font-size:0.72rem;background:rgba(239,68,68,0.15);color:#f87171;padding:2px 8px;border-radius:6px;">Hết hàng</span>`;

    html += `
      <div class="product-card" data-id="${p.id}">
        <div>
          <div class="product-badges">
            <span class="category-badge">${p.category_name || 'Linh kiện'}</span>
            ${stockBadge}
          </div>

          <h4 class="product-title" title="${p.name}">${p.name}</h4>
          <div class="product-sku">Brand: <strong>${p.brand_name || 'N/A'}</strong> &nbsp;|&nbsp; SKU: ${p.sku || 'N/A'}</div>

          <div class="product-specs-preview">
            ${specChips}
          </div>
        </div>

        <div class="product-footer">
          <div class="product-price">${formatVND(p.price)}</div>
          <button class="compare-check-btn ${isComparing ? 'selected' : ''}" data-product-id="${p.id}">
            <i data-lucide="${isComparing ? 'check-square' : 'plus-square'}"></i>
            <span>${isComparing ? 'Đã chọn' : 'So sánh'}</span>
          </button>
        </div>
      </div>
    `;
  });

  productGrid.innerHTML = html;
  if (window.lucide) window.lucide.createIcons();

  // Attach compare click events after render
  productGrid.querySelectorAll('.compare-check-btn[data-product-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = btn.dataset.productId;
      const prod = productCache.get(pid);
      if (prod) toggleCompareItem(pid, prod);
    });
  });
}

function renderPagination() {
  if (state.totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  let html = '';
  // Prev button
  html += `
    <button class="page-btn" ${state.currentPage === 1 ? 'disabled' : ''} onclick="changePage(${state.currentPage - 1})">
      <i data-lucide="chevron-left"></i>
    </button>
  `;

  // Page numbers
  const maxButtons = 5;
  let startPage = Math.max(1, state.currentPage - 2);
  let endPage = Math.min(state.totalPages, startPage + maxButtons - 1);

  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    html += `
      <button class="page-btn ${i === state.currentPage ? 'active' : ''}" onclick="changePage(${i})">
        ${i}
      </button>
    `;
  }

  // Next button
  html += `
    <button class="page-btn" ${state.currentPage === state.totalPages ? 'disabled' : ''} onclick="changePage(${state.currentPage + 1})">
      <i data-lucide="chevron-right"></i>
    </button>
  `;

  pagination.innerHTML = html;
  if (window.lucide) window.lucide.createIcons();
}

function changePage(page) {
  state.currentPage = page;
  fetchProducts();
  window.scrollTo({ top: 350, behavior: 'smooth' });
}

// Compare System Logic
function toggleCompareItem(id, productObj) {
  if (state.compareList.has(id)) {
    state.compareList.delete(id);
  } else {
    if (state.compareList.size >= 4) {
      alert('Bạn chỉ có thể chọn tối đa 4 linh kiện để so sánh cùng lúc.');
      return;
    }
    state.compareList.set(id, productObj);
  }

  saveCompareToStorage();
  updateCompareBarUI();
  fetchProducts(); // Re-render grid buttons state
}

function updateCompareBarUI() {
  const count = state.compareList.size;
  compareCount.textContent = count;

  if (count > 0) {
    compareBar.classList.add('visible');
    openCompareModalBtn.disabled = false;

    let pillsHTML = '';
    state.compareList.forEach((p, id) => {
      pillsHTML += `
        <div class="compare-pill">
          <span>${p.name.substring(0, 24)}...</span>
          <button class="compare-pill-remove" onclick="toggleCompareItem('${id}', null)">
            <i data-lucide="x" style="width: 14px; height: 14px;"></i>
          </button>
        </div>
      `;
    });
    compareItemsPreview.innerHTML = pillsHTML;
    if (window.lucide) window.lucide.createIcons();
  } else {
    compareBar.classList.remove('visible');
    openCompareModalBtn.disabled = true;
  }
}

function saveCompareToStorage() {
  const arr = Array.from(state.compareList.entries());
  localStorage.setItem('techspecs_compare', JSON.stringify(arr));
}

function loadCompareFromStorage() {
  try {
    const data = localStorage.getItem('techspecs_compare');
    if (data) {
      const arr = JSON.parse(data);
      state.compareList = new Map(arr);
    }
  } catch (e) {
    state.compareList = new Map();
  }
}

// Render Comparison Matrix inside Modal
async function openCompareModal() {
  if (state.compareList.size === 0) return;

  compareModal.classList.add('active');
  compareModalBody.innerHTML = `
    <div style="text-align: center; padding: 40px; color: var(--text-muted);">
      <div class="status-indicator loading" style="width: 24px; height: 24px; margin: 0 auto 16px auto;"></div>
      <p>Đang đối chiếu thông số kĩ thuật từ PostgreSQL...</p>
    </div>
  `;

  const ids = Array.from(state.compareList.keys()).join(',');
  try {
    const res = await fetch(`/api/products/compare?ids=${ids}`);
    const data = await res.json();

    renderCompareMatrix(data.products, data.specKeys);
  } catch (err) {
    compareModalBody.innerHTML = `
      <div style="text-align: center; color: #ef4444; padding: 30px;">Lỗi tải dữ liệu so sánh</div>
    `;
  }
}

function renderCompareMatrix(products, specKeys) {
  if (products.length === 0) {
    compareModalBody.innerHTML = '<div>Không có dữ liệu so sánh.</div>';
    return;
  }

  let html = `
    <div class="matrix-table-wrapper">
      <table class="matrix-table">
        <thead>
          <tr>
            <th class="spec-label-col">Linh Kiện</th>
            ${products.map(p => `
              <th>
                <div class="matrix-product-header">
                  <span class="matrix-prod-brand">${p.brand_name || 'Brand'}</span>
                  <h4 class="matrix-prod-title">${p.name}</h4>
                  <div class="matrix-prod-price">${formatVND(p.price)}</div>
                  <div style="font-size: 0.75rem; color: var(--text-dim);">SKU: ${p.sku || 'N/A'}</div>
                </div>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          <!-- Danh mục -->
          <tr>
            <th class="spec-label-col">Danh mục</th>
            ${products.map(p => `<td><strong>${p.category_name || ''}</strong></td>`).join('')}
          </tr>
          <!-- Giá bán -->
          <tr>
            <th class="spec-label-col">Giá bán</th>
            ${products.map(p => `<td><span class="matrix-prod-price" style="font-size: 1rem;">${formatVND(p.price)}</span></td>`).join('')}
          </tr>
  `;

  // Specification Rows
  specKeys.forEach(key => {
    // Check if values differ across products
    const values = products.map(p => (p.specs && p.specs[key] !== undefined) ? p.specs[key] : '-');
    const isDifferent = new Set(values.map(v => JSON.stringify(v))).size > 1;

    html += `
      <tr>
        <th class="spec-label-col">
          ${key.replace(/_/g, ' ')}
          ${isDifferent ? '<span class="spec-diff-badge">Khác biệt</span>' : ''}
        </th>
        ${values.map(val => {
          let displayVal = val;
          if (Array.isArray(val)) displayVal = val.join(', ');
          if (typeof val === 'boolean') displayVal = val ? 'Có' : 'Không';
          return `<td>${displayVal}</td>`;
        }).join('')}
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  compareModalBody.innerHTML = html;
}

// Event Listeners Setup
function setupEventListeners() {
  // Quick Category Tabs
  categoryTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.category-tab');
    if (!tab) return;

    state.selectedCategoryId = tab.dataset.id;
    categorySelect.value = state.selectedCategoryId;
    state.currentPage = 1;

    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    loadBrands();
    fetchProducts();
  });

  // Category Select
  categorySelect.addEventListener('change', (e) => {
    state.selectedCategoryId = e.target.value;
    state.currentPage = 1;

    // Update Quick Tabs
    document.querySelectorAll('.category-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.id === state.selectedCategoryId);
    });

    loadBrands();
    fetchProducts();
  });

  // Brand Search Box
  brandSearchInput.addEventListener('input', (e) => {
    renderBrandList(e.target.value);
  });

  // Brand Checkboxes Delegation
  brandList.addEventListener('change', (e) => {
    if (e.target.classList.contains('brand-checkbox')) {
      const val = e.target.value;
      if (e.target.checked) {
        state.selectedBrandIds.add(val);
      } else {
        state.selectedBrandIds.delete(val);
      }
      state.currentPage = 1;
      fetchProducts();
      renderBrandList(brandSearchInput.value);
    }
  });

  // Search input with debounce
  let searchDebounce;
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    clearSearchBtn.classList.toggle('hidden', query === '');

    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      state.searchQuery = query;
      state.currentPage = 1;
      fetchProducts();
    }, 350);
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    state.searchQuery = '';
    state.currentPage = 1;
    fetchProducts();
  });

  // Price range inputs
  let priceDebounce;
  const onPriceChange = () => {
    clearTimeout(priceDebounce);
    priceDebounce = setTimeout(() => {
      state.minPrice = minPriceInput.value;
      state.maxPrice = maxPriceInput.value;
      state.currentPage = 1;
      fetchProducts();
    }, 400);
  };
  minPriceInput.addEventListener('input', onPriceChange);
  maxPriceInput.addEventListener('input', onPriceChange);

  // Sorting
  sortSelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    state.currentPage = 1;
    fetchProducts();
  });

  // Reset Filters
  resetFiltersBtn.addEventListener('click', () => {
    state.selectedCategoryId = '';
    state.selectedBrandIds.clear();
    state.searchQuery = '';
    state.minPrice = '';
    state.maxPrice = '';
    state.sortBy = 'price_asc';
    state.currentPage = 1;

    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    minPriceInput.value = '';
    maxPriceInput.value = '';
    sortSelect.value = 'price_asc';
    categorySelect.value = '';

    document.querySelectorAll('.category-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.id === '');
    });

    loadBrands();
    fetchProducts();
  });

  // Compare Actions
  clearCompareBtn.addEventListener('click', () => {
    state.compareList.clear();
    saveCompareToStorage();
    updateCompareBarUI();
    fetchProducts();
  });

  openCompareModalBtn.addEventListener('click', openCompareModal);

  closeCompareModalBtn.addEventListener('click', () => {
    compareModal.classList.remove('active');
  });

  compareModal.addEventListener('click', (e) => {
    if (e.target === compareModal) {
      compareModal.classList.remove('active');
    }
  });
}

function escapeHtml(str) {
  return str.replace(/'/g, "&apos;").replace(/"/g, "&quot;");
}
