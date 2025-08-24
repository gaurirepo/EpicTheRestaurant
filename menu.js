(function () {
  const CATEGORIES = [
    { id: 'mains', name: 'MAINS' },
    { id: 'addons', name: 'ADD ONs' },
    { id: 'desserts', name: 'DESSERTS' },
    { id: 'beverages', name: 'BEVERAGES' },
  ];

  const PRODUCTS = [
    { id: 'bread-basket', name: 'Bread Basket', price: 5.5, image: 'images/coffeeshop.jpg', diet: 'veg', category: 'addons' },
    { id: 'granola', name: 'Honey Almond Granola with Fruits', price: 7.0, image: 'images/coffeehouse2.jpg', diet: 'veg', category: 'addons' },
    { id: 'waffle', name: 'Belgian Waffle', price: 7.5, image: 'images/coffeehouse.jpg', diet: 'veg', category: 'addons' },
    { id: 'scrambled-eggs', name: 'Scrambled eggs', price: 7.5, image: 'images/coffeehouse2.jpg', diet: 'nonveg', category: 'addons' },
    { id: 'pancakes', name: 'Blueberry Pancakes', price: 8.5, image: 'images/coffeehouse.jpg', diet: 'veg', category: 'addons' },
    { id: 'pigaliciouspig', name: 'Pigalicious Pig', price: 25.5, image: 'images/pig.jpg', diet: 'nonveg', category: 'mains' },
    { id: 'goldencow', name: 'Golden Cow', price: 27.0, image: 'images/golden_cow.jpeg', diet: 'nonveg', category: 'mains' },
    { id: 'lotusstem', name: 'Lotus Stem', price: 17.5, image: 'images/lotusfruit.jpg', diet: 'veg', category: 'mains' },
    { id: 'farmburger', name: 'The Farm Burger', price: 17.5, image: 'images/farmburger.jpg', diet: 'veg', category: 'mains' },
    { id: 'suitordish', name: 'A Suitors Dish', price: 37.5, image: 'images/suitor.jpg', diet: 'nonveg', category: 'mains' },
    { id: 'pinnacolada', name: 'Pinnacolada', price: 12.5, image: 'images/pinncolada.jpg', diet: 'veg', category: 'beverages' },
    { id: 'fruittriangle', name: 'Fruit Triangle', price: 18.5, image: 'images/fruittriangle.jpg', diet: 'veg', category: 'beverages' },
    { id: 'paradisepunch', name: 'Paradise Punch', price: 15.5, image: 'images/paradisepunch.jpg', diet: 'veg', category: 'beverages' },
    { id: 'redvelvet', name: 'Red Velvet Bundt Cake', price: 18.5, image: 'images/redvelvet.jpg', diet: 'veg', category: 'desserts' },
    { id: 'moussewreath', name: 'Mint Chocolate Mousse Wreath', price: 15.0, image: 'images/moussewreath.jpg', diet: 'veg', category: 'desserts' },
    { id: 'mousecrunch', name: ' Mouse Crunch', price: 12.5, image: 'images/moussewreath.jpg', diet: 'veg', category: 'desserts' },
    { id: 'pannacotta', name: 'Panna cotta', price: 15.5, image: 'images/pannacotta.jpg', diet: 'veg', category: 'desserts' }
  ];

  const dietIcon = (diet) => (diet === 'veg' ? 'images/veg.svg' : 'images/nonveg.svg');
  const format = (n) => `$${n.toFixed(2)}`;

  const state = { category: CATEGORIES[0].id, cart: new Map() };

  function renderCategories() {
    const list = document.getElementById('categoryList');
    list.innerHTML = '';
    CATEGORIES.forEach((c) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.textContent = c.name;
      btn.className = c.id === state.category ? 'active' : '';
      btn.addEventListener('click', () => {
        state.category = c.id;
        renderCategories();
        renderProducts();
        document.getElementById('categoryTitle').textContent = c.name;
      });
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  function getQty(productId) {
    return state.cart.get(productId) || 0;
  }

  function setQty(productId, qty) {
    if (qty <= 0) state.cart.delete(productId);
    else state.cart.set(productId, qty);
    renderCart();
  }

  function renderProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';
    PRODUCTS.filter((p) => p.category === state.category).forEach((p) => {
      const card = document.createElement('article');
      card.className = 'menu-card';
      card.innerHTML = `
        <img class="media" src="${p.image}" alt="${p.name}" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;">
        <div class="row">
          <span class="name">${p.name}</span>
          <img class="diet-dot" src="${dietIcon(p.diet)}" alt="${p.diet === 'veg' ? 'Veg' : 'Non-Veg'}">
        </div>
        <div class="row">
          <span class="price">${format(p.price)}</span>
          <button class="add-btn" data-id="${p.id}">Add</button>
          <div class="qty" data-id="${p.id}">
            <button class="dec" aria-label="decrease">-</button>
            <span class="count">0</span>
            <button class="inc" aria-label="increase">+</button>
          </div>
        </div>
      `;
      grid.appendChild(card);

      const addBtn = card.querySelector('.add-btn');
      const qtyBox = card.querySelector('.qty');
      const count = qtyBox.querySelector('.count');
      const id = p.id;

      function sync() {
        const q = getQty(id);
        if (q > 0) {
          addBtn.style.display = 'none';
          qtyBox.style.display = 'flex';
          count.textContent = String(q);
        } else {
          addBtn.style.display = 'inline-block';
          qtyBox.style.display = 'none';
        }
      }

      addBtn.addEventListener('click', () => {
        setQty(id, getQty(id) + 1);
        sync();
      });
      qtyBox.querySelector('.inc').addEventListener('click', () => {
        setQty(id, getQty(id) + 1);
        sync();
      });
      qtyBox.querySelector('.dec').addEventListener('click', () => {
        setQty(id, getQty(id) - 1);
        sync();
      });
      sync();
    });
  }

  function renderCart() {
    const itemsEl = document.getElementById('cartItems');
    const summaryEl = document.getElementById('cartSummary');
    itemsEl.innerHTML = '';
    let total = 0;
    for (const [id, qty] of state.cart.entries()) {
      const p = PRODUCTS.find((x) => x.id === id);
      if (!p) continue;
      const line = qty * p.price;
      total += line;
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <span>${p.name}</span>
        <span class="qty">x${qty}</span>
        <span>${format(line)}</span>
      `;
      itemsEl.appendChild(row);
    }
    summaryEl.innerHTML = `<span>Total</span><span>${format(total)}</span>`;
  }

  function init() {
    renderCategories();
    renderProducts();
    renderCart();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();


