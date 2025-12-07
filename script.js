let scholarships = [];

document.addEventListener("DOMContentLoaded", () => {
    const stateSelect = document.getElementById("stateSelect");
    const classSelect = document.getElementById("classSelect");
    const categorySelect = document.getElementById("categorySelect");
    const incomeSelect = document.getElementById("incomeSelect");
    const filterBtn = document.getElementById("filterBtn");
    const resultsList = document.getElementById("resultsList");

    // Footer year (sab pages ke liye)
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Sirf index page pe scholarship logic chale
    if (stateSelect && resultsList && filterBtn) {
        setupAnimatedWords();

        fetch("data/scholarships.json")
            .then(res => res.json())
            .then(data => {
                scholarships = data;
                populateStateOptions(data, stateSelect);
                renderResults(data, resultsList);
            })
            .catch(err => {
                console.error("Error loading scholarships:", err);
                resultsList.innerHTML = "<p>Data load karne me problem aa rahi hai.</p>";
            });

        function applyFilters() {
            const state = stateSelect.value;
            const classLevel = classSelect.value;
            const category = categorySelect.value;
            const incomeMax = incomeSelect.value ? parseInt(incomeSelect.value, 10) : null;

            const filtered = scholarships.filter(s => {
                // State filter
                if (state && s.state !== state && s.state !== "All India") return false;

                // Class / course filter (multiple classes support)
                if (classLevel) {
                    const levels = Array.isArray(s.classLevels)
                        ? s.classLevels
                        : (s.classLevel ? [s.classLevel] : []);
                    if (!levels.includes(classLevel)) return false;
                }

                // Category filter
                if (category && Array.isArray(s.category) && !s.category.includes(category)) return false;

                // Income filter
                if (incomeMax !== null && typeof s.incomeMax === "number" && s.incomeMax > 0 && s.incomeMax > incomeMax) {
                    return false;
                }

                return true;
            });

            renderResults(filtered, resultsList);
        }

        filterBtn.addEventListener("click", applyFilters);
    }
});

// ------------------ SCHOLARSHIP HELPERS ------------------

function populateStateOptions(data, selectEl) {
    if (!selectEl) return;
    const states = new Set();
    data.forEach(s => {
        if (s.state && s.state !== "All India") {
            states.add(s.state);
        }
    });

    [...states].sort().forEach(state => {
        const opt = document.createElement("option");
        opt.value = state;
        opt.textContent = state;
        selectEl.appendChild(opt);
    });
}

function renderResults(list, container) {
    if (!container) return;

    const countEl = document.getElementById("resultsCount");
    if (countEl) {
        if (!list || list.length === 0) {
            countEl.textContent = "No scholarships found for selected filters.";
        } else {
            countEl.textContent = `${list.length} scholarship${list.length > 1 ? "s" : ""} found`;
        }
    }

    if (!list || list.length === 0) {
        container.innerHTML = "<p>Koi scholarship match nahi huyi. Filters change karke try karo.</p>";
        return;
    }

    container.innerHTML = "";
    list.forEach(s => {
        const div = document.createElement("div");
        div.className = "scholarship-card";

        const imageUrl = s.image || "images/default-scholarship.jpg";
        const incomeText =
            s.incomeMax && s.incomeMax > 0
                ? "₹" + s.incomeMax.toLocaleString("en-IN")
                : "As per scheme rules / no fixed limit";
        const lastDateText = formatDate(s.lastDate);

        const levels = Array.isArray(s.classLevels)
            ? s.classLevels.join(", ")
            : (s.classLevel || "N/A");

        div.innerHTML = `
            <div class="card-image">
                <img src="${imageUrl}" alt="${s.name}">
            </div>
            <div class="card-body">
                <h3>${s.name}</h3>
                <div class="scholarship-meta">
                    <span><strong>State:</strong> ${s.state}</span>
                    <span><strong>Class / Course:</strong> ${levels}</span>
                    <span><strong>Category:</strong> ${Array.isArray(s.category) ? s.category.join(", ") : "N/A"}</span>
                    <span><strong>Max Income:</strong> ${incomeText}</span>
                    <span><strong>Last Date:</strong> ${lastDateText}</span>
                </div>
                <div class="scholarship-desc">
                    ${s.description}
                </div>
                <div class="scholarship-link">
                    <a href="${s.officialLink}"
                       target="_blank"
                       rel="noopener noreferrer">
                        Official Website / Apply
                    </a>
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    setupScrollAnimation(container);
}

function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

// Hero animated words (sirf index pe dikhenge)
function setupAnimatedWords() {
    const words = [
        "school scholarships",
        "college funding",
        "government schemes",
        "hostel fee support",
        "merit-based awards",
        "need-based support"
    ];

    const el = document.getElementById("animatedWord");
    if (!el) return;

    let index = 0;

    const changeWord = () => {
        el.classList.remove("fade-text");
        void el.offsetWidth; // reflow
        el.textContent = words[index];
        el.classList.add("fade-text");
        index = (index + 1) % words.length;
    };

    changeWord();
    setInterval(changeWord, 2600);
}

function setupScrollAnimation(container) {
    const cards = container.querySelectorAll(".scholarship-card");
    if (!cards.length) return;

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.18 }
    );

    cards.forEach(card => observer.observe(card));
}