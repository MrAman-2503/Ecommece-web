document.addEventListener('DOMContentLoaded', () => {
  // Sticky header and footer transition effect
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');

  window.addEventListener('scroll', () => {
    if(window.scrollY > 50) {
      header.classList.add('sticky');
      footer.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
      footer.classList.remove('sticky');
    }
  });

  // Navigation links
  const navLinks = document.querySelectorAll('.navigation a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      if(href.startsWith('#')) {
        const target = document.querySelector(href);
        if(target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      } else if(href !== '#') {
        window.location.href = href;
      }
    });
  });

  // Add to Cart buttons
  const addToCartButtons = document.querySelectorAll('button.add-to-cart, button.button');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const productData = button.getAttribute('data-product');
      if(productData) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const product = JSON.parse(productData);
        const existingIndex = cart.findIndex(item => item.title === product.title);
        if(existingIndex !== -1) {
          cart[existingIndex].quantity += 1;
        } else {
          product.quantity = 1;
          cart.push(product);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        alert('Item added to cart!');
      }
    });
  });

  // Buy Now buttons
  const buyNowButtons = document.querySelectorAll('button.buy-now, button.button.buy-now');
  buyNowButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const productData = button.getAttribute('data-product');
      if(productData) {
        localStorage.setItem('selectedProduct', productData);
      }
      window.location.href = 'Buynow.html';
    });
  });

  // Upload product form
  const uploadForm = document.getElementById('upload-form');
  if(uploadForm) {
    uploadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const imageInput = document.getElementById('product-image-upload');
      const titleInput = document.getElementById('product-title-upload');
      const priceInput = document.getElementById('product-price-upload');
      const descriptionInput = document.getElementById('product-description-upload');

      if(imageInput.files.length === 0 || !titleInput.value || !priceInput.value || !descriptionInput.value) {
        alert('Please fill in all fields and select an image.');
        return;
      }

      const reader = new FileReader();
      reader.onload = function(event) {
        const imageUrl = event.target.result;
        const newProduct = {
          image: imageUrl,
          title: titleInput.value,
          price: priceInput.value,
          description: descriptionInput.value,
          quantity: 1
        };

        // Save new product to localStorage or send to server (here we just alert)
        alert('Product uploaded successfully! You can now add it to the cart.');

        // Optionally, add product to cart or display dynamically
        // Reset form
        uploadForm.reset();
      };
      reader.readAsDataURL(imageInput.files[0]);
    });
  }

  // Cart functionality
  const cartItemsContainer = document.querySelector('.cart-items');
  const cartTotalElement = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');

  function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if(!cartItemsContainer || !cartTotalElement || !checkoutBtn) return;

    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <img src="${item.image}" alt="${item.title}" width="80" height="80" />
        <div class="item-details">
          <h4>${item.title}</h4>
          <p>Price: ${item.price}</p>
          <label>Quantity: <input type="number" min="1" value="${item.quantity}" data-index="${index}" class="quantity-input" /></label>
          <button class="remove-btn" data-index="${index}">Remove</button>
        </div>
      `;
      cartItemsContainer.appendChild(li);

      const priceNumber = parseFloat(item.price.replace(/[^\d\.]/g, ''));
      total += priceNumber * item.quantity;
    });

    cartTotalElement.textContent = `₹ ${total.toFixed(2)}`;
    checkoutBtn.disabled = cart.length === 0;

    const quantityInputs = document.querySelectorAll('.quantity-input');
    quantityInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = e.target.getAttribute('data-index');
        const newQty = parseInt(e.target.value);
        if(newQty > 0) {
          cart[idx].quantity = newQty;
          localStorage.setItem('cart', JSON.stringify(cart));
          loadCart();
        }
      });
    });

    const removeButtons = document.querySelectorAll('.remove-btn');
    removeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const idx = e.target.getAttribute('data-index');
        cart.splice(idx, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart();
      });
    });
  }

  if(cartItemsContainer && cartTotalElement && checkoutBtn) {
    loadCart();
  }

  // Product detail modal for ecommerce.html
  const productDetailModal = document.createElement('div');
  productDetailModal.id = 'product-detail-modal';
  productDetailModal.style.display = 'none';
  productDetailModal.style.position = 'fixed';
  productDetailModal.style.zIndex = '10000';
  productDetailModal.style.left = '0';
  productDetailModal.style.top = '0';
  productDetailModal.style.width = '100%';
  productDetailModal.style.height = '100%';
  productDetailModal.style.overflow = 'auto';
  productDetailModal.style.backgroundColor = 'rgba(0,0,0,0.5)';
  productDetailModal.innerHTML = `
    <div style="background:#fff; margin:5% auto; padding:20px; border-radius:12px; max-width:600px; position:relative;">
      <span id="close-product-detail" style="position:absolute; top:10px; right:15px; font-size:28px; font-weight:bold; cursor:pointer;">&times;</span>
      <img id="detail-image" src="" alt="Product Image" style="width:100%; border-radius:12px; margin-bottom:15px;" />
      <h2 id="detail-title"></h2>
      <p id="detail-description"></p>
      <p><strong>Price: </strong><span id="detail-price"></span></p>
      <label for="detail-size">Select Size:</label>
      <select id="detail-size" style="width:100%; padding:8px; margin-bottom:15px; border-radius:6px; border:1px solid #ccc;">
        <option value="S">S</option>
        <option value="M">M</option>
        <option value="L">L</option>
        <option value="XL">XL</option>
        <option value="XXL">XXL</option>
      </select>
      <label for="detail-color">Select Color:</label>
      <select id="detail-color" style="width:100%; padding:8px; margin-bottom:15px; border-radius:6px; border:1px solid #ccc;">
        <option value="Black">Black</option>
        <option value="White">White</option>
        <option value="Blue">Blue</option>
        <option value="Red">Red</option>
      </select>
      <button id="detail-buy-now" style="background:#388e3c; color:#fff; padding:12px 20px; border:none; border-radius:8px; cursor:pointer; font-size:1rem;">Buy Now</button>
    </div>
  `;
  document.body.appendChild(productDetailModal);

  const closeDetailBtn = document.getElementById('close-product-detail');
  closeDetailBtn.addEventListener('click', () => {
    productDetailModal.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
    if(event.target == productDetailModal) {
      productDetailModal.style.display = 'none';
    }
  });

  // Add click event to product images in ecommerce.html
  const productImages = document.querySelectorAll('.t-shirts img, .printed-tshirts img, .sneakers img, .hoodies img');
  productImages.forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
      const src = img.src;
      const title = img.alt || 'Product Detail';
      const description = 'Detailed description of the product goes here.';
      const price = 'Price info here';

      document.getElementById('detail-image').src = src;
      document.getElementById('detail-title').textContent = title;
      document.getElementById('detail-description').textContent = description;
      document.getElementById('detail-price').textContent = price;

      productDetailModal.style.display = 'block';
    });
  });

  // Buy now button in product detail modal
  const detailBuyNowBtn = document.getElementById('detail-buy-now');
  detailBuyNowBtn.addEventListener('click', () => {
    alert('Proceeding to buy this product.');
    productDetailModal.style.display = 'none';
  });

  // Slider functionality for multiple sliders
  const sliders = document.querySelectorAll('.slider');
  sliders.forEach(slider => {
    const slides = slider.querySelector('.slides');
    const slideImages = slides.querySelectorAll('img');
    const prevBtn = slider.querySelector('.prev');
    const nextBtn = slider.querySelector('.next');
    const slideCount = slideImages.length;
    let currentIndex = 0;

    function updateSlider() {
      slides.style.transform = `translateX(-${currentIndex * 100}%)`;
      const slideNumber = slider.querySelector('h5');
      if(slideNumber) {
        slideNumber.textContent = currentIndex + 1;
      }
    }

    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + slideCount) % slideCount;
      updateSlider();
    });

    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % slideCount;
      updateSlider();
    });

    updateSlider();
  });

  // Payment option selection
  const paymentOptions = document.querySelectorAll('.payment-option');
  paymentOptions.forEach(option => {
    option.addEventListener('click', () => {
      paymentOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      // Optionally store selected payment method
      // localStorage.setItem('selectedPaymentMethod', option.dataset.method);
    });
  });
});
