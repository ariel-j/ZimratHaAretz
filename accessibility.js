// ===== ACCESSIBILITY MENU (required by Israeli accessibility regulations) =====
(function () {
  var STORAGE_KEY = 'a11yPrefs';
  var TOGGLE_CLASSES = ['contrast', 'grayscale', 'underline-links', 'readable-font', 'stop-animations', 'big-cursor'];
  var FONT_STEPS = [100, 112, 125, 137, 150];

  var state = {
    fontStep: 0,
    toggles: {}
  };

  function loadState() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && typeof saved === 'object') {
        state.fontStep = FONT_STEPS.indexOf(saved.fontSize) !== -1 ? FONT_STEPS.indexOf(saved.fontSize) : 0;
        state.toggles = saved.toggles || {};
      }
    } catch (e) {
      state = { fontStep: 0, toggles: {} };
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        fontSize: FONT_STEPS[state.fontStep],
        toggles: state.toggles
      }));
    } catch (e) {
      // localStorage unavailable; preferences won't persist across visits
    }
  }

  function applyFontSize() {
    document.documentElement.style.fontSize = FONT_STEPS[state.fontStep] + '%';
    var resetBtn = document.getElementById('a11yFontReset');
    if (resetBtn) resetBtn.textContent = FONT_STEPS[state.fontStep] + '%';
  }

  function applyToggles() {
    TOGGLE_CLASSES.forEach(function (name) {
      var isOn = !!state.toggles[name];
      document.documentElement.classList.toggle('a11y-' + name, isOn);
      var btn = document.querySelector('[data-a11y-toggle="' + name + '"]');
      if (btn) btn.classList.toggle('active', isOn);
    });
  }

  function applyAll() {
    applyFontSize();
    applyToggles();
  }

  function togglePanel(forceState) {
    var panel = document.getElementById('a11yPanel');
    var toggleBtn = document.getElementById('a11yToggle');
    var isHidden = panel.classList.contains('hidden');
    var shouldOpen = forceState !== undefined ? forceState : isHidden;
    panel.classList.toggle('hidden', !shouldOpen);
    toggleBtn.setAttribute('aria-expanded', String(shouldOpen));
  }

  function initFontControls() {
    document.getElementById('a11yFontIncrease').addEventListener('click', function () {
      state.fontStep = Math.min(state.fontStep + 1, FONT_STEPS.length - 1);
      applyFontSize();
      saveState();
    });
    document.getElementById('a11yFontDecrease').addEventListener('click', function () {
      state.fontStep = Math.max(state.fontStep - 1, 0);
      applyFontSize();
      saveState();
    });
    document.getElementById('a11yFontReset').addEventListener('click', function () {
      state.fontStep = 0;
      applyFontSize();
      saveState();
    });
  }

  function initToggleButtons() {
    document.querySelectorAll('[data-a11y-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var name = btn.getAttribute('data-a11y-toggle');
        state.toggles[name] = !state.toggles[name];
        applyToggles();
        saveState();
      });
    });
  }

  function initResetAll() {
    document.getElementById('a11yResetAll').addEventListener('click', function () {
      state = { fontStep: 0, toggles: {} };
      applyAll();
      saveState();
    });
  }

  function initPanelToggle() {
    var toggleBtn = document.getElementById('a11yToggle');
    var closeBtn = document.getElementById('closeA11yPanel');
    var panel = document.getElementById('a11yPanel');

    toggleBtn.addEventListener('click', function () {
      togglePanel();
    });
    closeBtn.addEventListener('click', function () {
      togglePanel(false);
    });
    document.addEventListener('click', function (event) {
      if (!panel.classList.contains('hidden') && !panel.contains(event.target) && !toggleBtn.contains(event.target)) {
        togglePanel(false);
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        togglePanel(false);
      }
    });
  }

  function initStatementModal() {
    var modal = document.getElementById('a11yStatementModal');
    var openButtons = [
      document.getElementById('openA11yStatement'),
      document.getElementById('openA11yStatementFromPanel')
    ];
    openButtons.forEach(function (btn) {
      if (btn) {
        btn.addEventListener('click', function () {
          modal.classList.remove('hidden');
          togglePanel(false);
        });
      }
    });
    document.getElementById('closeA11yStatement').addEventListener('click', function () {
      modal.classList.add('hidden');
    });
    modal.addEventListener('click', function (event) {
      if (event.target === modal) {
        modal.classList.add('hidden');
      }
    });
  }

  window.initAccessibilityWidget = function () {
    loadState();
    applyAll();
    initFontControls();
    initToggleButtons();
    initResetAll();
    initPanelToggle();
    initStatementModal();
  };

  document.addEventListener('DOMContentLoaded', window.initAccessibilityWidget);
})();
