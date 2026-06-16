// Functie om cookie consent te checken
function checkCookieConsent() {
  return localStorage.getItem('cookieConsent');
}

// Accepteer cookies en laad Google Analytics
function acceptCookies() {
  localStorage.setItem('cookieConsent', 'true');
  document.getElementById('cookie-banner').style.display = 'none';
  loadGoogleAnalytics();
}

// Weiger cookies (geen GA laden)
function rejectCookies() {
  localStorage.setItem('cookieConsent', 'false');
  document.getElementById('cookie-banner').style.display = 'none';
}

// Laat cookie banner zien indien nodig
window.addEventListener('DOMContentLoaded', () => {
  const consent = checkCookieConsent();

  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('accept-cookies');
  const rejectBtn = document.getElementById('reject-cookies');

  if (!banner) return; // veiligheid

  if (!consent) {
    banner.style.display = 'block';
  } else if (consent === 'true') {
    loadGoogleAnalytics();
  }

  if (acceptBtn) acceptBtn.onclick = acceptCookies;
  if (rejectBtn) rejectBtn.onclick = rejectCookies;
});

// Laad Google Analytics pas na toestemming
function loadGoogleAnalytics() {
  if (window.gtag) return; // voorkom dubbele tracking

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }

  gtag('js', new Date());
  gtag('config', 'G-KPWCX00EK8'); // <-- vervang met jouw echte tracking-ID

  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-KPWCX00EK8'; // <-- vervang met jouw echte tracking-ID
  document.head.appendChild(gaScript);
}
