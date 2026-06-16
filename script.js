document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       0. HAMBURGER MENU
       ========================================================= */
    const hamburgerToggle = document.getElementById('hamburger-toggle');
    const navMenu = document.getElementById('nav-menu');
    const iconBurger = document.querySelector('.icon-burger');
    const iconClose = document.querySelector('.icon-close');

    // Controleer of de elementen wel echt bestaan op de pagina
    if (hamburgerToggle && navMenu) {
        hamburgerToggle.addEventListener('click', () => {
            // Schakel de 'active' class in/uit
            const isOpened = navMenu.classList.toggle('active');

            hamburgerToggle.setAttribute('aria-expanded', isOpened);

            // Wissel de Font Awesome icoontjes
            if (isOpened) {
                iconBurger.style.display = 'none';
                iconClose.style.display = 'block';
            } else {
                iconBurger.style.display = 'block';
                iconClose.style.display = 'none';
            }
        });

        // Sluit menu bij klik op een link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburgerToggle.setAttribute('aria-expanded', 'false');
                iconBurger.style.display = 'block';
                iconClose.style.display = 'none';
            });
        });
    }

    /* =========================================================
       1. THEME TOGGLE
       ========================================================= */
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
    }

    if (themeToggle) {
        themeToggle.checked = body.classList.contains("light-mode");

        themeToggle.addEventListener("change", () => {
            const isLight = themeToggle.checked;

            body.classList.toggle("light-mode", isLight);
            localStorage.setItem("theme", isLight ? "light" : "dark");
        });
    }

    /* =========================================================
       2. LANGUAGE DROPDOWN
       ========================================================= */
    const langBtn = document.getElementById("lang-btn-text");
    const langMenu = document.getElementById("lang-menu");

    if (langBtn && langMenu) {
        langBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            langMenu.classList.toggle("open");
        });

        document.addEventListener("click", () => {
            langMenu.classList.remove("open");
        });
    }

    /* =========================================================
       3. LANGUAGE INIT
       ========================================================= */
    const savedLang = localStorage.getItem("preferred-lang") || "nl";
    window.setLang(savedLang);

    /* =========================================================
       4. REVEAL ANIMATIONS
       ========================================================= */
    const revealElements = document.querySelectorAll(
        ".reveal, .reveal-left, .reveal-right, .reveal-center"
    );

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    revealElements.forEach(el => observer.observe(el));

    /* =========================================================
       5. TIMELINE AUTO LEFT/RIGHT ASSIGN
       ========================================================= */
    const items = Array.from(document.querySelectorAll(".timeline-item"));

    // Sorteer op jaar
    items.sort((a, b) => {
        const yearA = parseInt(a.querySelector(".year")?.textContent || "0");
        const yearB = parseInt(b.querySelector(".year")?.textContent || "0");
        return yearA - yearB;
    });

    // Herplaats + wissel links/rechts
    const timeline = document.querySelector(".timeline");

    if (timeline) {
        items.forEach((item, index) => {
            item.classList.remove("left", "right");
            item.classList.add(index % 2 === 0 ? "left" : "right");
            timeline.appendChild(item);
        });
    }

    /* =========================================================
       6. ESC CLOSE OVERLAYS
       ========================================================= */
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            document.querySelectorAll(".timeline-overlay.active")
                .forEach(el => el.classList.remove("active"));
        }
    });

    /* =========================================================
       7. CLICK OUTSIDE CLOSE OVERLAY
       ========================================================= */
    document.querySelectorAll(".timeline-overlay").forEach(overlay => {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                overlay.classList.remove("active");
            }
        });
    });

    /* =========================================================
       AANVULLING: GECORRIGEERDE TAG OBSERVER
       ========================================================= */
    const tagObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll(".tag").forEach(el => tagObserver.observe(el));

    // Azure Function demo initialiseren
    setupAzureFunctionDemo();

    setupRankingList();

}); // Sluit de DOMContentLoaded listener


/* =========================================================
   8. LANGUAGE FUNCTION (GLOBAL)
   ========================================================= */
window.setLang = function (lang) {
    const html = document.documentElement;
    const langBtnText = document.getElementById("lang-btn-text");
    const menu = document.getElementById("lang-menu");

    html.setAttribute("lang", lang);
    localStorage.setItem("preferred-lang", lang);

    if (langBtnText) {
        langBtnText.innerHTML =
            lang === "nl"
                ? "🇧🇪 NL <span class='chevron'>▾</span>"
                : "🇬🇧 EN <span class='chevron'>▾</span>";
    }

    document.querySelectorAll("[data-lang-nl]").forEach(el => {
        const translated = el.getAttribute(`data-lang-${lang}`);

        if (translated && translated.trim() !== "") {
            el.innerHTML = translated;
        }
    });

    if (menu) menu.classList.remove("open");
};

window.openTimeline = function (id) {
    const el = document.getElementById(`overlay-${id}`);
    if (!el) return;

    el.classList.add("active");
};

window.closeTimeline = function (id) {
    const el = document.getElementById(`overlay-${id}`);
    if (!el) return;

    el.classList.remove("active");
};

document.querySelectorAll(".timeline-card").forEach(card => {
    card.addEventListener("click", () => {
        const id = card.dataset.id;
        const overlay = document.getElementById(`overlay-${id}`);
        if (overlay) overlay.classList.add("active");
    });
});

function animateCount(el, target, duration = 1200) {
    const startTime = performance.now();

    function update(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const value = Math.floor(progress * target);

        el.textContent = value + "+";

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            if (el.dataset.infinite === "true") {
                setTimeout(() => {
                    el.textContent = "∞";
                    el.classList.add("pulse-infinite");
                }, 300);
            } else {
                el.textContent = target + "+";
            }
        }
    }

    requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        if (el.dataset.infinite === "true") {
            animateCount(el, 1000, 1200);
        } else {
            const target = parseInt(el.dataset.target);
            if (!isNaN(target)) {
                animateCount(el, target);
            }
        }
        obs.unobserve(el);
    });
}, { threshold: 0.6 });

document.querySelectorAll(".stat-number").forEach(el => statsObserver.observe(el));




function setupAzureFunctionDemo() {
    const btn = document.getElementById('callFunctionBtn');
    const input = document.getElementById('nameInput');
    const resultText = document.getElementById('resultText');

    if (!btn || !input || !resultText) return;

    btn.addEventListener('click', async () => {
        const name = input.value.trim();
        if (!name) {
            alert('Typ eerst je naam in het invoerveld');
            return;
        }
        resultText.textContent = 'Bezig met laden...';

        try {
            const functionUrl = 'https://svenportfoliofunc-hza4b7fhgcg6d3gd.westeurope-01.azurewebsites.net/api/HttpTrigger1?name=' + encodeURIComponent(name);
            const response = await fetch(functionUrl);
            if (!response.ok) throw new Error('Status ' + response.status);
            const text = await response.text();
            resultText.textContent = text;
        } catch (error) {
            console.error('Azure function error:', error);
            resultText.textContent = 'Er is iets misgegaan: ' + error.message;
        }
    });
}

// ✨ Aangepaste ranking list functie met nette layout
function setupRankingList() {
    const rankingList = document.getElementById('ranking-list');
    if (!rankingList) {
        console.warn('[ranking-list] Element #ranking-list niet gevonden.');
        return;
    }

    const apiUrl = 'https://memorygamefunc-sven-e7abhug3gra6cnfs.westeurope-01.azurewebsites.net/api/getScores?code=YM_K4pwyacs7fw7xe21R4IJwRekNnIjmPcyzeAcCDEFkAzFu_0HXwQ==';

    // Laad placeholder
    rankingList.innerHTML = '<li class="ranking-item"><span class="name">Laden...</span></li>';

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            data.sort((a, b) => a.turns - b.turns);
            const topScores = data.slice(0, 10);

            rankingList.innerHTML = ''; // Clear loading state

            topScores.forEach((score, index) => {
                const date = new Date(score.date).toLocaleDateString('nl-BE', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                });

                let medal = '';
                if (index === 0) medal = '🥇';
                else if (index === 1) medal = '🥈';
                else if (index === 2) medal = '🥉';

                const li = document.createElement('li');
                li.classList.add('ranking-item');

                li.innerHTML = `
          <span class="rank">#${index + 1}${medal ? ' ' + medal : ''}</span>
          <span class="name">${score.playername}</span>
          <span class="turns">${score.turns} beurten</span>
          <span class="date">${date}</span>
        `;

                rankingList.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Fout bij laden scores:', error);
            rankingList.innerHTML = '<li class="ranking-item"><span class="name">Fout bij het laden van de scores.</span></li>';
        });
}
