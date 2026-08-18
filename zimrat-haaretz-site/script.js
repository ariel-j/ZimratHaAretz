// ===== CONFIG =====
// Swap these two placeholders for the real personal payment links once
// your friend generates them in the Bit and PayBox apps. See README.
const BIT_PAYMENT_LINK = '';
const PAYBOX_PAYMENT_LINK = '';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzr6AGn4g936I1iND97vvocOFvtvZqITLurAjRHLOU8j_Mxv7vY6jK9iFmqKMRlZOSS/exec';

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

  document.getElementById('langToggle').textContent = dict.toggleLabel;
  currentLang = langCode;
}

function translate(key) {
  return TRANSLATIONS[currentLang].strings[key] || key;
}

function initLanguageToggle() {
  const toggleButton = document.getElementById('langToggle');
  toggleButton.addEventListener('click', function () {
    applyLanguage(currentLang === 'he' ? 'en' : 'he');
  });
}

// ===== DISTRIBUTOR / PICKUP LOCATION / CASH OPTION =====
function initDistributorLogic() {
  const distributorSelect = document.getElementById('distributor');
  const pickupLocationField = document.getElementById('pickupLocationField');
  const pickupLocationSelect = document.getElementById('pickupLocation');
  const paymentMethodSelect = document.getElementById('paymentMethod');
  const cashOption = document.getElementById('cashOption');

  distributorSelect.addEventListener('change', function () {
    const isPickup = distributorSelect.value === 'pickup';

    pickupLocationField.hidden = !isPickup;
    pickupLocationSelect.required = isPickup;
    if (!isPickup) {
      pickupLocationSelect.value = '';
    }

    cashOption.hidden = !isPickup;
    if (!isPickup && paymentMethodSelect.value === 'cash') {
      paymentMethodSelect.value = '';
    }
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
  if (!formData.distributorChoice) {
    return translate('order.errorDistributor');
  }
  if (formData.distributorChoice === 'pickup' && !formData.pickupLocation) {
    return translate('order.errorPickupLocation');
  }
  if (!formData.paymentMethod) {
    return translate('order.errorPayment');
  }
  return null;
}

const PICKUP_LOCATION_LABELS = {
  elazar: { he: 'אלעזר', en: 'Elazar' },
  beersheva: { he: 'באר שבע', en: 'Beer Sheva' }
};

function buildDistributorText(distributorChoice, pickupLocation) {
  if (distributorChoice === 'delivery') {
    return translate('order.delivery');
  }
  const locationLabel = PICKUP_LOCATION_LABELS[pickupLocation]
    ? PICKUP_LOCATION_LABELS[pickupLocation][currentLang]
    : pickupLocation;
  return translate('order.pickup') + ' - ' + locationLabel;
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
    distributorChoice: document.getElementById('distributor').value,
    pickupLocation: document.getElementById('pickupLocation').value,
    paymentMethod: document.getElementById('paymentMethod').value,
    notes: document.getElementById('notes').value.trim()
  };
}

function showFormMessage(text, type) {
  const messageEl = document.getElementById('formMessage');
  messageEl.textContent = text;
  messageEl.className = 'form-message ' + type;
}

function showPaymentPanel(paymentMethod) {
  const panel = document.getElementById('paymentPanel');
  const bitButton = document.getElementById('bitPayBtn');
  const payboxButton = document.getElementById('payboxPayBtn');
  const cashNote = document.getElementById('cashNote');
  const instructions = document.getElementById('paymentInstructions');

  const isCash = paymentMethod === 'cash';

  bitButton.style.display = paymentMethod === 'bit' ? 'inline-block' : 'none';
  payboxButton.style.display = paymentMethod === 'paybox' ? 'inline-block' : 'none';
  cashNote.classList.toggle('hidden', !isCash);
  instructions.classList.toggle('hidden', isCash);

  bitButton.href = BIT_PAYMENT_LINK || '#';
  payboxButton.href = PAYBOX_PAYMENT_LINK || '#';

  panel.classList.remove('hidden');
  panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function submitOrder(formData) {
  const payload = {
    fullName: formData.fullName,
    email: formData.email,
    phone: formData.phone,
    qty1kg: formData.qty1kg,
    qty500g: formData.qty500g,
    qty350g: formData.qty350g,
    distributor: buildDistributorText(formData.distributorChoice, formData.pickupLocation),
    paymentMethod: formData.paymentMethod,
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
        showPaymentPanel(formData.paymentMethod);
        form.reset();
        updateTotalPrice();
        document.getElementById('pickupLocationField').hidden = true;
        document.getElementById('cashOption').hidden = true;
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

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function () {
  applyLanguage('he');
  initLanguageToggle();
  initQuantitySteppers();
  initDistributorLogic();
  initOrderForm();
});
