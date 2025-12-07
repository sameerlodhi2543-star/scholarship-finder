let yojanas = [];

document.addEventListener("DOMContentLoaded", () => {
    const stateSelect = document.getElementById("yStateSelect");
    const beneficiarySelect = document.getElementById("yBeneficiarySelect");
    const incomeSelect = document.getElementById("yIncomeSelect");
    const filterBtn = document.getElementById("yFilterBtn");
    const resultsList = document.getElementById("yojResultsList");
    const countEl = document.getElementById("yojResultsCount");

    // Agar ye elements hi nahi mile to matlab hum yojana.html par nahi hain
    if (!stateSelect || !filterBtn || !resultsList) return;

    // JSON se data load karo
    fetch("data/yojanas.json")
        .then(res => res.json())
        .then(data => {
            yojanas = data;
            populateYojanaStates(data, stateSelect);
            renderYojanaResults(data, resultsList, countEl);
        })
        .catch(err => {
            console.error("Error loading yojanas:", err);
            resultsList.innerHTML = "<p>Data load karne me problem aa rahi hai.</p>";
        });

    function applyFilters() {
        const state = stateSelect.value;
        const beneficiary = beneficiarySelect.value;
        const incomeMax = incomeSelect.value ? parseInt(incomeSelect.value, 10) : null;

        const filtered = yojanas.filter(y => {
            // State filter
            if (state && y.state !== state && y.state !== "All India") return false;

            // Beneficiary type filter
            if (beneficiary && Array.isArray(y.beneficiaries) && !y.beneficiaries.includes(beneficiary)) {
                return false;
            }

            // Income filter (0 ka matlab "no fixed limit")
            if (incomeMax !== null && typeof y.incomeMax === "number" && y.incomeMax > 0 && y.incomeMax > incomeMax) {
                return false;
            }

            return true;
        });

        renderYojanaResults(filtered, resultsList, countEl);
    }

    filterBtn.addEventListener("click", applyFilters);
});

// ---- Helper functions ----

function populateYojanaStates(data, selectEl) {
    const states = new Set();
    data.forEach(y => {
        if (y.state && y.state !== "All India") {
            states.add(y.state);
        }
    });

    [...states].sort().forEach(state => {
        const opt = document.createElement("option");
        opt.value = state;
        opt.textContent = state;
        selectEl.appendChild(opt);
    });
}

function renderYojanaResults(list, container, countEl) {
    if (countEl) {
        if (!list || list.length === 0) {
            countEl.textContent = "No yojanas found for selected filters.";
        } else {
            countEl.textContent = `${list.length} yojana${list.length > 1 ? "s" : ""} found`;
        }
    }

    if (!list || list.length === 0) {
        container.innerHTML = "<p>Koi yojana match nahi hui. Filters change karke try karein.</p>";
        return;
    }

    container.innerHTML = "";
    list.forEach(y => {
        const div = document.createElement("div");
        div.className = "scholarship-card"; // same style reuse

        const imageUrl = y.image || "images/default-scholarship.jpg";
        const incomeText =
            y.incomeMax && y.incomeMax > 0
                ? "Up to ₹" + y.incomeMax.toLocaleString("en-IN")
                : "As per scheme rules / no fixed limit";

        const beneficiariesText = Array.isArray(y.beneficiaries)
            ? y.beneficiaries.join(", ")
            : "N/A";

        div.innerHTML = `
            <div class="card-image">
                <img src="${imageUrl}" alt="${y.name}">
            </div>
            <div class="card-body">
                <h3>${y.name}</h3>
                <div class="scholarship-meta">
                    <span><strong>State:</strong> ${y.state}</span>
                    <span><strong>Beneficiaries:</strong> ${beneficiariesText}</span>
                    <span><strong>Income limit:</strong> ${incomeText}</span>
                </div>
                <div class="scholarship-desc">
                    ${y.description}
                </div>
                <div class="scholarship-link">
                    <a href="${y.officialLink}" target="_blank" rel="noopener noreferrer">
                        Official Website / Details
                    </a>
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    // Agar scholarship wala setupScrollAnimation function defined ho to use kar lo
    if (typeof setupScrollAnimation === "function") {
        setupScrollAnimation(container);
    }
}
