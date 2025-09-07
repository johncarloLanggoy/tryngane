const plusBtns = document.querySelectorAll(".plus");
const minusBtns = document.querySelectorAll(".minus");
const counts = document.querySelectorAll(".count");
const totalPriceEl = document.getElementById("totalPrice");
const orderBtn = document.getElementById("orderBtn");
const orderPopup = document.getElementById("orderPopup");
const closePopup = document.getElementById("closePopup");
const orderDate = document.getElementById("orderDate");
const orderSummary = document.getElementById("orderSummary");
const cards = document.querySelectorAll(".card");

const items = ["Tapsilog","Longsilog","Maling silog","Hotsilog","Silog","Bangus silog","Pork silog"];
const prices = [120,80,50,60,60,90,70];

let quantities = Array(prices.length).fill(0);

// Check if user is logged in
const isLoggedIn = document.body.dataset.loggedIn === 'true';

function updateTotal() {
    let total = 0;
    quantities.forEach((q,i) => total += q * prices[i]);
    totalPriceEl.textContent = total.toFixed(2);
    orderBtn.disabled = total === 0;

    totalPriceEl.style.transform = "scale(1.2)";
    setTimeout(() => totalPriceEl.style.transform = "scale(1)", 150);
}

function updateSummary() {
    let html = "";
    let hasItems = false;
    quantities.forEach((q,i) => {
        if(q > 0){
            html += `<p>${items[i]} x ${q} = ₱${q * prices[i]}</p>`;
            hasItems = true;
        }
    });
    if(!hasItems) html = "<p>No items selected yet.</p>";
    orderSummary.innerHTML = html;
}

// Plus button event
plusBtns.forEach((btn,i) => btn.addEventListener("click", () => {
    const card = cards[i];
    if(card.classList.contains("unavailable")) return;

    quantities[i]++;
    counts[i].textContent = quantities[i];

    counts[i].style.transform = "scale(1.4)";
    setTimeout(() => counts[i].style.transform = "scale(1)", 150);

    updateTotal();
    updateSummary();
}));

// Minus button event
minusBtns.forEach((btn,i) => btn.addEventListener("click", () => {
    const card = cards[i];
    if(card.classList.contains("unavailable")) return;

    if(quantities[i] > 0){
        quantities[i]--;
        counts[i].textContent = quantities[i];

        counts[i].style.transform = "scale(1.4)";
        setTimeout(() => counts[i].style.transform = "scale(1)", 150);

        updateTotal();
        updateSummary();
    }
}));

// Global auth modal function (used for guest modal)
window.openForm = function(formType) {
    const authModal = document.getElementById('authModal');
    if(!authModal) return; // in case page has no auth modal
    const loginBox = document.getElementById('loginBox');
    const registerBox = document.getElementById('registerBox');

    authModal.style.display = 'flex';
    if (formType === 'login') {
        loginBox.style.display = 'block';
        registerBox.style.display = 'none';
    } else {
        loginBox.style.display = 'none';
        registerBox.style.display = 'block';
    }
};

// Order button click
orderBtn.addEventListener("click", () => {
    if(isLoggedIn){
        orderPopup.style.display = "flex";
        orderDate.value = new Date().toLocaleString();
        updateSummary();
        document.getElementById("custName").focus();
    } else {
        // Guest user: open landing page auth modal if exists
        if(document.getElementById('authModal')){
            openForm('login');
        } else {
            // fallback: inline guest popup
            const guestModal = document.createElement('div');
            guestModal.classList.add('popup');
            guestModal.id = 'guestModal';
            guestModal.style.justifyContent = "center";
            guestModal.style.alignItems = "center";
            guestModal.innerHTML = `
                <div class="popup-content" style="text-align:center; padding:25px; border-radius:12px; max-width:400px; background: #1b1b1b; color:#fff; box-shadow:0 0 20px rgba(0,0,0,0.5);">
                    <span class="close-btn" id="closeGuestPopup" style="position:absolute; top:10px; right:12px; cursor:pointer; font-size:22px;">&times;</span>
                    <h2 style="color: #ffb347; margin-bottom:10px;">Hello, Guest!</h2>
                    <p>
                    To place an order, please 
                    <a href="${homeUrl}?form=login" style="color:#ff8000; font-weight:bold;">Log In</a> 
                    or 
                    <a href="${homeUrl}?form=register" style="color:#ff8000; font-weight:bold;">Register</a>.
                    </p>
                </div>
            `;
            document.body.appendChild(guestModal);
            guestModal.style.display = 'flex';

            const closeBtn = document.getElementById('closeGuestPopup');
            closeBtn.onclick = () => guestModal.remove();
            guestModal.onclick = (e) => { if(e.target == guestModal) guestModal.remove(); };
        }
    }
});

// Close order popup
closePopup.addEventListener("click", () => orderPopup.style.display = "none");
window.addEventListener("keydown", e => { if(e.key === "Escape") orderPopup.style.display = "none"; });

// Order form submission
document.getElementById("orderForm").addEventListener("submit", e => {
    e.preventDefault();
    const hiddenDiv = document.getElementById("hiddenInputs");
    hiddenDiv.innerHTML = "";

    quantities.forEach((q,i) => {
        const card = cards[i];
        if(q > 0 && !card.classList.contains("unavailable")) {
            const foodInput = document.createElement("input");
            foodInput.type = "hidden";
            foodInput.name = "food";
            foodInput.value = items[i];

            const qtyInput = document.createElement("input");
            qtyInput.type = "hidden";
            qtyInput.name = "quantity";
            qtyInput.value = q;

            hiddenDiv.appendChild(foodInput);
            hiddenDiv.appendChild(qtyInput);
        }
    });

    orderPopup.querySelector('.popup-content').style.transform = "scale(0.8)";
    setTimeout(() => e.target.submit(), 200);
});

document.addEventListener("DOMContentLoaded", function () {
  // All nav dropdowns
  const navDropdowns = document.querySelectorAll(".nav-dropdown");
  // Profile dropdown
  const profileDropdown = document.querySelector(".profile-dropdown");
  const profileBtn = profileDropdown.querySelector(".profile-btn");

  // Handle nav dropdowns
  navDropdowns.forEach(dropdown => {
    const button = dropdown.querySelector(".dropdown-btn");

    button.addEventListener("click", function (e) {
      e.stopPropagation();

      // Close other nav dropdowns and profile dropdown
      navDropdowns.forEach(d => {
        if (d !== dropdown) d.classList.remove("active");
      });
      profileDropdown.classList.remove("active");
      profileBtn.classList.remove("active");

      // Toggle current dropdown
      dropdown.classList.toggle("active");
    });
  });

  // Handle profile dropdown
  profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    // Close all nav dropdowns
    navDropdowns.forEach(d => d.classList.remove("active"));

    // Toggle profile dropdown
    profileDropdown.classList.toggle("active");
    profileBtn.classList.toggle("active");
  });

  // Close everything if clicking outside
  document.addEventListener("click", () => {
    navDropdowns.forEach(d => d.classList.remove("active"));
    profileDropdown.classList.remove("active");
    profileBtn.classList.remove("active");
  });
});