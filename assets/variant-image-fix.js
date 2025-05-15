document.addEventListener('DOMContentLoaded', function() {
  // Function to update product image
  function updateProductImage(variant) {
    if (!variant || !variant.featured_image) return;
    
    const mainImage = document.querySelector('.product-image');
    const flickitySlider = document.querySelector('.product-gallery');
    
    if (mainImage) {
      mainImage.src = variant.featured_image.src;
    }
    
    if (flickitySlider && window.Flickity) {
      const flkty = Flickity.data(flickitySlider);
      if (flkty) {
        // Find the slide with the matching image
        const slides = flkty.slides;
        for (let i = 0; i < slides.length; i++) {
          const slideImg = slides[i].querySelector('img');
          if (slideImg && slideImg.src === variant.featured_image.src) {
            flkty.select(i);
            break;
          }
        }
      }
    }
  }

  function updateMainImageFromSwatch(optionValue) {
    // Find the swatch image for the selected option
    const swatchImg = document.querySelector('.swatch_option[data-variant-option-value="' + optionValue + '"] img.swatch_image');
    if (!swatchImg) return;

    // Find the main product image
    const mainImg = document.querySelector('img.zoomImg');
    if (mainImg) {
      mainImg.src = swatchImg.src;
    }
  }

  function handleSwatchClick(event) {
    const swatch = event.target.closest('.swatch_option');
    if (!swatch) return;
    const optionValue = swatch.getAttribute('data-variant-option-value');
    if (!optionValue) return;

    // Update the main image immediately
    updateMainImageFromSwatch(optionValue);

    // Also trigger the input change event if needed
    const input = swatch.querySelector('input[type="radio"]');
    if (input) {
      input.checked = true;
      const changeEvent = new Event('change', { bubbles: true });
      input.dispatchEvent(changeEvent);
    }
  }

  function initializeSwatches() {
    const swatches = document.querySelectorAll('.swatch_option');
    swatches.forEach(swatch => {
      swatch.removeEventListener('click', handleSwatchClick);
      swatch.addEventListener('click', handleSwatchClick);
    });
  }

  // Initialize on page load
  initializeSwatches();

  // Re-initialize when sections are loaded/updated
  document.addEventListener('shopify:section:load', initializeSwatches);
  document.addEventListener('shopify:section:unload', function() {
    const swatches = document.querySelectorAll('.swatch_option');
    swatches.forEach(swatch => {
      swatch.removeEventListener('click', handleSwatchClick);
    });
  });

  // Override the default selectCallback if it exists
  if (typeof window.selectCallback === 'function') {
    const originalSelectCallback = window.selectCallback;
    window.selectCallback = function(variant, selector) {
      // Call the original callback
      originalSelectCallback(variant, selector);
      // Update the product image
      updateProductImage(variant);
    };
  }

  // Add direct event listener to the product form
  const productForm = document.querySelector('form[action="/cart/add"]');
  if (productForm) {
    productForm.addEventListener('change', function(event) {
      // Get the current variant from the form
      const variantId = this.getAttribute('data-variant-id');
      if (!variantId) return;

      // Find the variant option that matches the current selection
      const selectedOptions = Array.from(this.querySelectorAll('select')).map(select => select.value);
      const variantImage = document.querySelector(`.swatch_option[data-variant-option-value="${selectedOptions[0]}"] img.swatch_image`);
      
      if (variantImage) {
        const mainImage = document.querySelector('.product-image');
        const flickitySlider = document.querySelector('.product-gallery');
        
        if (mainImage) {
          mainImage.src = variantImage.src;
        }
        
        if (flickitySlider && window.Flickity) {
          const flkty = Flickity.data(flickitySlider);
          if (flkty) {
            const slides = flkty.slides;
            for (let i = 0; i < slides.length; i++) {
              const slideImg = slides[i].querySelector('img');
              if (slideImg && slideImg.src === variantImage.src) {
                flkty.select(i);
                break;
              }
            }
          }
        }
      }
    });
  }
}); 