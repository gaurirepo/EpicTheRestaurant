(function () {
  function loadCart() {
    try {
      const raw = localStorage.getItem('epic_cart');
      if (!raw) return { items: [], total: 0 };
      return JSON.parse(raw);
    } catch {
      return { items: [], total: 0 };
    }
  }

  function format(n) { return `$${n.toFixed(2)}`; }

  function renderSummary() {
    const { items, total } = loadCart();
    const wrap = document.getElementById('summary');
    if (!wrap) return;
    if (!items.length) {
      wrap.innerHTML = '<p>Your cart is empty.</p>';
      return;
    }
    const rows = items.map((l) => `<div class="cart-item"><span>${l.name}</span><span class="qty">x${l.qty}</span><span>${format(l.line)}</span></div>`).join('');
    wrap.innerHTML = rows + `<div class="cart-summary"><span>Total</span><span>${format(total)}</span></div>`;
  }

  function initPay() {
    const form = document.getElementById('payForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const { total } = loadCart();
      if (total <= 0) { alert('Your cart is empty.'); return; }
      // Simulate payment success
      setTimeout(() => {
        localStorage.removeItem('epic_cart');
        alert('Payment successful! Thank you for your order.');
        window.location.href = 'home.html';
      }, 400);
    });
  }

  function init() { renderSummary(); initPay(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();


