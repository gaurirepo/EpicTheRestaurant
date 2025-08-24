// Main cart and ordering logic for Epic the Restaurant
// Keeps state minimal and uses data attributes for mapping

(function () {
  const ITEMS = [
    { id: 'pigalicious', name: 'Pigalicious Pig', price: 13.0 },
    { id: 'golden-cow', name: 'Golden Cow', price: 15.0 },
  ];

  const TAX_RATE = 0.08; // 8% tax example
  const ADD_ON_PRICES = {
    Ketchup: 0.25,
    Mayo: 0.25,
    Mustard: 0.25,
  };
  const SIDES_PRICES = {
    cry: 1.0,
    travel: 2.0,
    gods: 3.0,
  };

  // Simple coupon setup: percentage or fixed amount
  // SAVE10 => 10% off on taxable (items + addons + sides)
  // EPIC5 => $5 off the total (after tax is applied)
  const COUPONS = {
    SAVE10: { type: 'percent', value: 0.1 },
    EPIC5: { type: 'fixed', value: 5.0 },
  };
  let appliedCoupon = null;

  function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
  }

  function getFormQtyInput(id) {
    return document.getElementById(`${id}-qty`);
  }

  function upsertQuantity(id, delta) {
    const input = getFormQtyInput(id);
    if (!input) return;
    const current = parseInt(input.value || '0', 10) || 0;
    const next = Math.max(0, current + delta);
    input.value = String(next);
  }

  function computeTotals() {
    let subtotal = 0;
    const lines = [];
    for (const item of ITEMS) {
      const input = getFormQtyInput(item.id);
      if (!input) continue;
      const qty = parseInt(input.value || '0', 10) || 0;
      if (qty > 0) {
        const lineTotal = qty * item.price;
        subtotal += lineTotal;
        lines.push({ name: item.name, qty, price: item.price, lineTotal });
      }
    }
    // Add-ons (flat addition if checked)
    let addons = 0;
    for (const [id, price] of Object.entries(ADD_ON_PRICES)) {
      const el = document.getElementById(id);
      if (el && el.checked) addons += price;
    }
    // Sides (radio, only one)
    let sides = 0;
    for (const [id, price] of Object.entries(SIDES_PRICES)) {
      const el = document.getElementById(id);
      if (el && el.checked) {
        sides = price;
        break;
      }
    }
    const taxable = subtotal + addons + sides;
    const tax = taxable * TAX_RATE;
    let total = taxable + tax;

    // Apply coupon if any
    let discount = 0;
    if (appliedCoupon && COUPONS[appliedCoupon]) {
      const c = COUPONS[appliedCoupon];
      if (c.type === 'percent') {
        discount = taxable * c.value;
      } else if (c.type === 'fixed') {
        discount = c.value;
      }
      discount = Math.min(discount, total);
      total -= discount;
    }

    return { subtotal, addons, sides, tax, discount, total, lines };
  }

  function renderSummary() {
    const summaryEl = document.getElementById('order-summary');
    if (!summaryEl) return;
    const { subtotal, addons, sides, tax, discount, total, lines } = computeTotals();
    if (lines.length === 0) {
      summaryEl.innerHTML = '<p>No items added yet.</p>';
      return;
    }
    const rows = lines
      .map(
        (l) =>
          `<div class="summary-row"><span>${l.name} x ${l.qty}</span><span>${formatCurrency(
            l.lineTotal
          )}</span></div>`
      )
      .join('');
    summaryEl.innerHTML = `
      <div class="summary-rows">${rows}</div>
      <hr>
      <div class="summary-row"><span>Add-ons</span><span>${formatCurrency(addons)}</span></div>
      <div class="summary-row"><span>Sides</span><span>${formatCurrency(sides)}</span></div>
      <div class="summary-row"><span>Subtotal</span><span>${formatCurrency(subtotal + addons + sides)}</span></div>
      <div class="summary-row"><span>Tax (8%)</span><span>${formatCurrency(tax)}</span></div>
      ${discount > 0 ? `<div class="summary-row"><span>Discount${
        appliedCoupon ? ` (${appliedCoupon})` : ''
      }</span><span>-${formatCurrency(discount)}</span></div>` : ''}
      <div class="summary-row total"><span>Total</span><span>${formatCurrency(total)}</span></div>
    `;
  }

  function onAddButtonClick(e) {
    const article = e.target.closest('article');
    if (!article) return;
    const itemId = article.getAttribute('data-item-id');
    if (!itemId) return;
    const qtyInput = article.querySelector('input.qty-input');
    const qty = parseInt(qtyInput && qtyInput.value ? qtyInput.value : '1', 10) || 1;
    upsertQuantity(itemId, qty);
    renderSummary();
  }

  function attachHandlers() {
    // Map articles to item ids via data attributes
    const articles = document.querySelectorAll('#products .product-card');
    const idByName = new Map(ITEMS.map((i) => [i.name, i.id]));
    for (const a of articles) {
      const nameEl = a.querySelector('h3');
      if (!nameEl) continue;
      const id = idByName.get(nameEl.textContent.trim());
      if (!id) continue;
      a.setAttribute('data-item-id', id);
      const addBtn = a.querySelector('button.add-btn');
      if (addBtn) addBtn.addEventListener('click', onAddButtonClick);
      const minusBtn = a.querySelector('button.minus-btn');
      if (minusBtn) minusBtn.addEventListener('click', () => {
        const itemId = a.getAttribute('data-item-id');
        if (!itemId) return;
        upsertQuantity(itemId, -1);
        renderSummary();
      });
      const removeBtn = a.querySelector('button.remove-btn');
      if (removeBtn) removeBtn.addEventListener('click', () => {
        const itemId = a.getAttribute('data-item-id');
        if (!itemId) return;
        const input = getFormQtyInput(itemId);
        if (input) input.value = '0';
        renderSummary();
      });
      const qtyEl = a.querySelector('input.qty-input');
      if (qtyEl) qtyEl.addEventListener('change', () => {
        // noop; only used when clicking Add
      });
    }

    // Re-render summary when quantities in the order form change
    for (const item of ITEMS) {
      const input = getFormQtyInput(item.id);
      if (input) input.addEventListener('input', renderSummary);
    }

    // Coupon handling
    const couponInput = document.getElementById('coupon-code');
    const couponBtn = document.getElementById('apply-coupon');
    const couponStatus = document.getElementById('coupon-status');
    if (couponBtn && couponInput && couponStatus) {
      const applyCoupon = () => {
        const code = (couponInput.value || '').trim().toUpperCase();
        if (code && COUPONS[code]) {
          appliedCoupon = code;
          couponStatus.textContent = `Applied ${code}`;
          couponStatus.style.color = '#16a34a';
        } else if (code) {
          appliedCoupon = null;
          couponStatus.textContent = 'Invalid code';
          couponStatus.style.color = '#b91c1c';
        } else {
          appliedCoupon = null;
          couponStatus.textContent = '';
        }
        renderSummary();
      };
      couponBtn.addEventListener('click', applyCoupon);
      couponInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          applyCoupon();
        }
      });
    }

    // Add-ons and sides listeners
    for (const id of Object.keys(ADD_ON_PRICES)) {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', renderSummary);
    }
    for (const id of Object.keys(SIDES_PRICES)) {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', renderSummary);
    }

    renderSummary();

    // Place order click - simple demo handler
    const placeBtn = document.getElementById('place-order-btn');
    if (placeBtn) {
      placeBtn.addEventListener('click', () => {
        const { total, lines } = computeTotals();
        if (!lines.length) {
          alert('Your cart is empty. Add some items first.');
          return;
        }
        alert(`Thank you! Your payable amount is ${formatCurrency(total)}.`);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachHandlers);
  } else {
    attachHandlers();
  }
})();


