
    (() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()


// review page funtionality

document.addEventListener('DOMContentLoaded', function() {
  // Thumbnail image switching
  const thumbnails = document.querySelectorAll('.thumbnail');
  const mainImage = document.querySelector('.main-image img');
  
  if (thumbnails.length && mainImage) {
    thumbnails.forEach(thumb => {
      thumb.addEventListener('click', function() {
        // Remove active class from all thumbnails
        thumbnails.forEach(t => t.classList.remove('active'));
        // Add active class to clicked thumbnail
        this.classList.add('active');
        // Update main image
        mainImage.src = this.querySelector('img').src;
      });
    });
  }
  
  // Star rating functionality
  const stars = document.querySelectorAll('.star');
  const ratingInput = document.getElementById('rating');
  
  if (stars.length && ratingInput) {
    stars.forEach((star, index) => {
      star.addEventListener('click', function() {
        // Update hidden input value
        ratingInput.value = index + 1;
        // Update star display
        stars.forEach((s, i) => {
          if (i <= index) {
            s.classList.add('active');
          } else {
            s.classList.remove('active');
          }
        });
      });
    });
  }
  
  // Quantity selector
  const minusBtn = document.querySelector('.quantity-btn.minus');
  const plusBtn = document.querySelector('.quantity-btn.plus');
  const quantityInput = document.querySelector('.quantity-input');
  
  if (minusBtn && plusBtn && quantityInput) {
    minusBtn.addEventListener('click', function() {
      let value = parseInt(quantityInput.value) || 1;
      if (value > 1) {
        quantityInput.value = value - 1;
      }
    });
    
    plusBtn.addEventListener('click', function() {
      let value = parseInt(quantityInput.value) || 1;
      quantityInput.value = value + 1;
    });
  }
  
  // Add to cart button
  const addToCartBtn = document.querySelector('.add-to-cart');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', function() {
      const productId = this.dataset.productId;
      const quantity = document.querySelector('.quantity-input').value || 1;
      
      fetch('/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          productId: productId,
          quantity: quantity
        })
      })
      .then(response => response.json())
      .then(data => {
        if(data.success) {
          showToast('Product added to cart!');
          updateCartCount(data.cartCount);
        } else {
          showToast(data.message || 'Failed to add to cart', 'error');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showToast('An error occurred', 'error');
      });
    });
  }
});

// Helper function to show toast messages
function showToast(message, type = 'success') {
  // You can implement a custom toast or use a library
  alert(message);
}

// Helper function to update cart count
function updateCartCount(count) {
  const cartBadge = document.querySelector('.cart-count');
  if (cartBadge) {
    cartBadge.textContent = count;
  }
}
