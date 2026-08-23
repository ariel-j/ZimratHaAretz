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

  document.getElementById('langToggle').textContent = dict.toggleLabel;
  currentLang = langCode;

  renderPickupOptions(langCode);
  updateSellPointsLanguage(langCode);
  renderSellPointsList();
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

// ===== SELL POINTS MAP =====
const sellPointsState = {
  map: null,
  markers: {},
  userLocation: null,
  distancesById: {}
};

function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const earthRadiusKm = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function setSellPointsStatus(text) {
  document.getElementById('sellpointsStatus').textContent = text;
}

function nearestSellPointId() {
  if (!sellPointsState.userLocation) return null;
  let nearestId = null;
  let nearestDistance = Infinity;
  Object.keys(sellPointsState.distancesById).forEach(function (id) {
    if (sellPointsState.distancesById[id] < nearestDistance) {
      nearestDistance = sellPointsState.distancesById[id];
      nearestId = id;
    }
  });
  return nearestId;
}

function updateSellPointsLanguage(langCode) {
  Object.keys(sellPointsState.markers).forEach(function (id) {
    const point = SELL_POINTS.find(function (p) { return p.id === id; });
    if (point) sellPointsState.markers[id].setPopupContent(point[langCode]);
  });
  if (sellPointsState.userMarker) {
    sellPointsState.userMarker.setPopupContent(translate('sellpoints.you'));
  }
}

function renderSellPointsList() {
  const list = document.getElementById('sellPointsList');
  if (!list) return;
  list.innerHTML = '';

  if (SELL_POINTS.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'sellpoint-empty';
    emptyItem.textContent = translate('sellpoints.empty');
    list.appendChild(emptyItem);
    return;
  }

  const hasDistances = !!sellPointsState.userLocation;
  const nearestId = hasDistances ? nearestSellPointId() : null;

  const points = SELL_POINTS.slice().sort(function (a, b) {
    if (!hasDistances) return 0;
    return sellPointsState.distancesById[a.id] - sellPointsState.distancesById[b.id];
  });

  points.forEach(function (point) {
    const item = document.createElement('li');
    item.className = 'sellpoint-item' + (point.id === nearestId ? ' nearest' : '');

    const name = document.createElement('span');
    name.className = 'sellpoint-name';
    name.textContent = point[currentLang];
    item.appendChild(name);

    if (hasDistances) {
      const distance = document.createElement('span');
      distance.className = 'sellpoint-distance';
      const distanceText = translate('sellpoints.distanceAway')
        .replace('{distance}', sellPointsState.distancesById[point.id].toFixed(1));
      distance.textContent = point.id === nearestId
        ? translate('sellpoints.nearest') + ' · ' + distanceText
        : distanceText;
      item.appendChild(distance);
    }

    item.addEventListener('click', function () {
      if (sellPointsState.map && sellPointsState.markers[point.id]) {
        sellPointsState.map.setView([point.lat, point.lng], 12);
        sellPointsState.markers[point.id].openPopup();
      }
    });

    list.appendChild(item);
  });
}

function updateUserLocationOnMap() {
  if (!sellPointsState.map || !sellPointsState.userLocation) return;

  const { lat, lng } = sellPointsState.userLocation;

  if (sellPointsState.userMarker) {
    sellPointsState.userMarker.setLatLng([lat, lng]);
  } else {
    sellPointsState.userMarker = L.circleMarker([lat, lng], {
      radius: 8,
      color: '#E0BC4B',
      fillColor: '#E0BC4B',
      fillOpacity: 0.9
    }).addTo(sellPointsState.map).bindPopup(translate('sellpoints.you'));
  }

  const bounds = L.latLngBounds(SELL_POINTS.map(function (p) { return [p.lat, p.lng]; }));
  bounds.extend([lat, lng]);
  sellPointsState.map.fitBounds(bounds, { padding: [30, 30] });
}

function handleGeolocationSuccess(position) {
  sellPointsState.userLocation = {
    lat: position.coords.latitude,
    lng: position.coords.longitude
  };

  sellPointsState.distancesById = {};
  SELL_POINTS.forEach(function (point) {
    sellPointsState.distancesById[point.id] = haversineDistanceKm(
      sellPointsState.userLocation.lat, sellPointsState.userLocation.lng,
      point.lat, point.lng
    );
  });

  setSellPointsStatus('');
  updateUserLocationOnMap();
  renderSellPointsList();
  resetFindMeButton();
}

function handleGeolocationError(error) {
  const message = error.code === error.PERMISSION_DENIED
    ? translate('sellpoints.geoDenied')
    : translate('sellpoints.geoError');
  setSellPointsStatus(message);
  resetFindMeButton();
}

function resetFindMeButton() {
  const button = document.getElementById('findNearMeBtn');
  button.disabled = false;
  button.textContent = translate('sellpoints.findMe');
}

function initFindNearMeButton() {
  const button = document.getElementById('findNearMeBtn');

  if (!('geolocation' in navigator)) {
    button.disabled = true;
    setSellPointsStatus(translate('sellpoints.geoUnsupported'));
    return;
  }

  button.addEventListener('click', function () {
    button.disabled = true;
    button.textContent = translate('sellpoints.locating');
    setSellPointsStatus('');
    navigator.geolocation.getCurrentPosition(handleGeolocationSuccess, handleGeolocationError, {
      enableHighAccuracy: true,
      timeout: 10000
    });
  });
}

function initSellPointsMap() {
  const mapContainer = document.getElementById('sellPointsMap');
  if (!mapContainer || typeof L === 'undefined' || SELL_POINTS.length === 0) return;

  const map = L.map(mapContainer, { scrollWheelZoom: false });
  sellPointsState.map = map;

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);

  SELL_POINTS.forEach(function (point) {
    const marker = L.marker([point.lat, point.lng])
      .addTo(map)
      .bindPopup(point[currentLang]);
    sellPointsState.markers[point.id] = marker;
  });

  const bounds = L.latLngBounds(SELL_POINTS.map(function (p) { return [p.lat, p.lng]; }));
  map.fitBounds(bounds, { padding: [30, 30] });

  initFindNearMeButton();
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function () {
  initSellPointsMap();
  applyLanguage('he');
  initLanguageToggle();
  initQuantitySteppers();
  initOrderForm();
  initPaymentPopup();
  initProductGallery();
});
