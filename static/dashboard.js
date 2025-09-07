/* ===== Show Message Box ===== */
function showMessage(msg, type="success") {
    const box = document.createElement('div');
    box.textContent = msg;
    box.className = `message-box ${type}`;
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 3000);
}

/* ===== Toggle Availability ===== */
document.querySelectorAll('.dashboard-container input[type="checkbox"]').forEach(switchBtn => {
    const label = switchBtn.closest('.switch-container').querySelector('.status-label');

    // Initialize label text
    label.textContent = switchBtn.checked ? "Available" : "Not Available";

    switchBtn.addEventListener('change', function() {
        const status = this.checked ? "Available" : "Not Available";
        label.textContent = status;

        const food = this.dataset.food;
        if (!food) return showMessage("Food item missing", "error");

        fetch('/update_status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ food: food, status: status })
        })
        .then(res => res.json())
        .then(data => showMessage(data.message, "success"))
        .catch(err => {
            console.error(err);
            showMessage("Failed to update status", "error");
        });
    });
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
      const isActive = dropdown.classList.contains("active");
      dropdown.classList.toggle("active", !isActive); // stay active when clicked
    });
  });

  // Handle profile dropdown
  profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();

    // Close all nav dropdowns
    navDropdowns.forEach(d => d.classList.remove("active"));

    // Toggle profile dropdown
    const isActive = profileDropdown.classList.contains("active");
    profileDropdown.classList.toggle("active", !isActive);
    profileBtn.classList.toggle("active", !isActive);
  });

  // Close everything if clicking outside
  document.addEventListener("click", () => {
    navDropdowns.forEach(d => d.classList.remove("active"));
    profileDropdown.classList.remove("active");
    profileBtn.classList.remove("active");
  });
});
