// ===== CONFIG =====
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzApj4-EIPYwXn5-XLkSg7hqxM__WAOa9-X5XYJL207-r2tpQphsF7hD_Df2reWBG_C/exec';

const PRICES = { qty1kg: 65, qty500g: 35, qty350g: 25 };

// ===== LANGUAGE =====
let currentLang = 'he';

function applyLanguage(langCode) {
  const dict = TRANSLATIONS[langCode];
  document.documentElement.lang = dict.lang;
  document.documentElement.dir = dict.dir;

  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    const key = el.getAttribute('data-i18n');
    const value = dict.strings[key];
    if (value !== undefined) {
      el.textContent = value;
    }
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach(function (el) {
    const key = el.getAttribute('data-i18n-aria-label');
    const value = dict.strings[key];
    if (value !== undefined) {
      el.setAttribute('aria-label', value);
    }
  });

  currentLang = langCode;

  document.querySelectorAll('#langSwitcher .lang-option').forEach(function (button) {
    button.classList.toggle('active', button.getAttribute('data-lang') === langCode);
  });

  renderPickupOptions(langCode);
}

function translate(key) {
  return TRANSLATIONS[currentLang].strings[key] || key;
}

function initLanguageToggle() {
  document.querySelectorAll('#langSwitcher .lang-option').forEach(function (button) {
    button.addEventListener('click', function () {
      applyLanguage(button.getAttribute('data-lang'));
    });
  });
}

// ===== QUANTITY STEPPERS =====
function initQuantitySteppers() {
  document.querySelectorAll('.qty-btn').forEach(function (button) {
    button.addEventListener('click', function () {
      const targetId = button.getAttribute('data-target');
      const delta = parseInt(button.getAttribute('data-delta'), 10);
      const input = document.getElementById(targetId);
      const newValue = Math.max(0, (parseInt(input.value, 10) || 0) + delta);
      input.value = newValue;
      updateTotalPrice();
    });
  });

  ['qty1kg', 'qty500g', 'qty350g'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', updateTotalPrice);
  });
}

function updateTotalPrice() {
  const qty1kg = parseInt(document.getElementById('qty1kg').value, 10) || 0;
  const qty500g = parseInt(document.getElementById('qty500g').value, 10) || 0;
  const qty350g = parseInt(document.getElementById('qty350g').value, 10) || 0;

  const total = (qty1kg * PRICES.qty1kg) + (qty500g * PRICES.qty500g) + (qty350g * PRICES.qty350g);
  document.getElementById('totalPrice').textContent = '₪' + total;
  return total;
}

// ===== VALIDATION =====
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidIsraeliPhone(phone) {
  const digitsOnly = phone.replace(/[-\s]/g, '');
  return /^0\d{8,9}$/.test(digitsOnly);
}

function validateOrderForm(formData) {
  if (!formData.fullName || formData.fullName.trim().length < 2) {
    return translate('order.errorFullName');
  }
  if (!isValidEmail(formData.email)) {
    return translate('order.errorEmail');
  }
  if (!isValidIsraeliPhone(formData.phone)) {
    return translate('order.errorPhone');
  }
  if (formData.qty1kg + formData.qty500g + formData.qty350g === 0) {
    return translate('order.errorProducts');
  }
  if (!formData.pickupLocation) {
    return translate('order.errorPickupLocation');
  }
  return null;
}

function getSellPointLabel(sellPointId, langCode) {
  const point = SELL_POINTS.find(function (p) { return p.id === sellPointId; });
  return point ? point[langCode] : sellPointId;
}

function buildDistributorText(pickupLocation) {
  return translate('order.collectionPoint') + ' - ' + getSellPointLabel(pickupLocation, currentLang);
}

// ===== PICKUP DROPDOWN (rendered from SELL_POINTS) =====
function renderPickupOptions(langCode) {
  const select = document.getElementById('pickupLocation');
  const previousValue = select.value;

  select.querySelectorAll('option[data-sell-point]').forEach(function (option) {
    option.remove();
  });

  SELL_POINTS.forEach(function (point) {
    const option = document.createElement('option');
    option.value = point.id;
    option.textContent = point[langCode];
    option.setAttribute('data-sell-point', '');
    select.appendChild(option);
  });

  if (SELL_POINTS.some(function (p) { return p.id === previousValue; })) {
    select.value = previousValue;
  }
}

// ===== FORM SUBMISSION =====
function collectFormData() {
  return {
    fullName: document.getElementById('fullName').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    qty1kg: parseInt(document.getElementById('qty1kg').value, 10) || 0,
    qty500g: parseInt(document.getElementById('qty500g').value, 10) || 0,
    qty350g: parseInt(document.getElementById('qty350g').value, 10) || 0,
    pickupLocation: document.getElementById('pickupLocation').value,
    notes: document.getElementById('notes').value.trim()
  };
}

function showFormMessage(text, type) {
  const messageEl = document.getElementById('formMessage');
  messageEl.textContent = text;
  messageEl.className = 'form-message ' + type;
}

function showPaymentPopup() {
  document.getElementById('paymentModal').classList.remove('hidden');
}

function hidePaymentPopup() {
  document.getElementById('paymentModal').classList.add('hidden');
}

function initPaymentPopup() {
  const modal = document.getElementById('paymentModal');
  document.getElementById('closePaymentModal').addEventListener('click', hidePaymentPopup);
  modal.addEventListener('click', function (event) {
    if (event.target === modal) {
      hidePaymentPopup();
    }
  });
}

async function submitOrder(formData) {
  const payload = {
    fullName: formData.fullName,
    email: formData.email,
    phone: formData.phone,
    qty1kg: formData.qty1kg,
    qty500g: formData.qty500g,
    qty350g: formData.qty350g,
    distributor: buildDistributorText(formData.pickupLocation),
    paymentMethod: translate('order.prepay'),
    notes: formData.notes
  };

  // Sent as text/plain to avoid a CORS preflight request, which Apps Script
  // Web Apps do not handle. The backend still parses it as JSON.
  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });
  return response.json();
}

function initOrderForm() {
  const form = document.getElementById('orderForm');
  const submitButton = document.getElementById('submitBtn');

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = collectFormData();
    const validationError = validateOrderForm(formData);

    if (validationError) {
      showFormMessage(validationError, 'error');
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = translate('order.sending');
    showFormMessage('', '');

    try {
      const result = await submitOrder(formData);

      if (result.success) {
        showFormMessage(translate('order.success'), 'success');
        showPaymentPopup();
        form.reset();
        updateTotalPrice();
      } else {
        showFormMessage(result.error || translate('order.error'), 'error');
      }
    } catch (err) {
      showFormMessage(translate('order.error'), 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = translate('order.submit');
    }
  });
}

// ===== PRODUCT GALLERY =====
function initProductGallery() {
  const images = document.querySelectorAll('.header-gallery .gallery-img');
  if (images.length < 2) return;

  let activeIndex = 0;
  setInterval(function () {
    images[activeIndex].classList.remove('active');
    activeIndex = (activeIndex + 1) % images.length;
    images[activeIndex].classList.add('active');
  }, 5000);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function () {
  applyLanguage('he');
  initLanguageToggle();
  initQuantitySteppers();
  initOrderForm();
  initPaymentPopup();
  initProductGallery();
});
