/* ===== Toggle Password Visibility ===== */
function togglePassword(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (input.type === "password") {
    input.type = "text";
    icon.classList.replace('bx-show', 'bx-hide');
  } else {
    input.type = "password";
    icon.classList.replace('bx-hide', 'bx-show');
  }
}

document.getElementById('toggleLoginPass')?.addEventListener('click', () => {
  togglePassword('loginPassword', 'toggleLoginPass');
});
document.getElementById('toggleRegPass')?.addEventListener('click', () => {
  togglePassword('regPassword', 'toggleRegPass');
});
document.getElementById('toggleRegConfirmPass')?.addEventListener('click', () => {
  togglePassword('regConfirmPassword', 'toggleRegConfirmPass');
});

/* ===== Open/Close Modal (fixed for inline display) ===== */
function openForm(form) {
  const modal = document.getElementById('authModal');
  modal.style.display = 'flex';
  requestAnimationFrame(() => {
    modal.classList.add('show');
  });
  switchAuth(form);
}

function closeForm() {
  const modal = document.getElementById('authModal');
  modal.classList.remove('show');
  const onEnd = () => {
    modal.style.display = 'none';
    modal.removeEventListener('transitionend', onEnd);
  };
  modal.addEventListener('transitionend', onEnd, { once: true });
}

window.addEventListener('click', (event) => {
  const modal = document.getElementById('authModal');
  if (event.target === modal) closeForm();
});

/* ===== Smooth Switch Login/Register ===== */
function switchAuth(form) {
  const loginBox = document.getElementById('loginBox');
  const registerBox = document.getElementById('registerBox');
  const showBox = form === 'login' ? loginBox : registerBox;
  const hideBox = form === 'login' ? registerBox : loginBox;
  if (showBox === hideBox) return;
  hideBox.classList.remove('active');
  setTimeout(() => {
    hideBox.style.display = 'none';
  }, 500);
  showBox.style.display = 'block';
  requestAnimationFrame(() => {
    showBox.classList.add('active');
  });
}

/* ===== Inline Messages Helper ===== */
function showAuthMessage(msg, type = "error", form = "login") {
  const messageBox = form === "login"
    ? document.getElementById('loginMessage')
    : document.getElementById('registerMessage');
  messageBox.textContent = msg;
  messageBox.style.color = type === "error" ? "#ff4d4d" : "#4dff88";
  messageBox.style.fontWeight = "bold";
  messageBox.style.marginBottom = "10px";
}

/* ===== Client-Side Form Validation ===== */
document.getElementById('loginForm')?.addEventListener('submit', function (e) {
  const username = this.username.value.trim();
  const password = this.password.value.trim();
  if (!username || !password) {
    e.preventDefault();
    showAuthMessage("Please fill in all fields", "error", "login");
  }
});

document.getElementById('registerForm')?.addEventListener('submit', function (e) {
  const username = this.username.value.trim();
  const email = this.email.value.trim();
  const password = this.password.value.trim();
  const confirm = this.confirm_password.value.trim();
  const phone = this.phone.value.trim();
  const address = this.address.value.trim();

  if (!username || !email || !password || !confirm || !phone || !address) {
    e.preventDefault();
    showAuthMessage("Please fill in all fields", "error", "register");
  } else if (password !== confirm) {
    e.preventDefault();
    showAuthMessage("Passwords do not match", "error", "register");
  } else if (!/^\d{10,11}$/.test(phone)) {
    e.preventDefault();
    showAuthMessage("Enter a valid phone number (10–11 digits)", "error", "register");
  }
});

function centerModal() {
  const modalContent = document.querySelector('.modal-content');
  if (!modalContent) return;
  const scrollY = window.scrollY || window.pageYOffset;
  const viewportHeight = window.innerHeight;
  const contentHeight = modalContent.offsetHeight;
  const topPos = scrollY + (viewportHeight - contentHeight) / 2;
  modalContent.style.top = `${Math.max(topPos, 20)}px`;
}

window.addEventListener('scroll', centerModal);
window.addEventListener('resize', centerModal);

/* ===== Display server-side messages ===== */
window.addEventListener('DOMContentLoaded', () => {
  const loginMsg = document.getElementById('loginMessage')?.textContent.trim();
  const registerMsg = document.getElementById('registerMessage')?.textContent.trim();
  if (loginMsg) openForm('login');
  if (registerMsg) openForm('register');
});

/* ===== Swiper Slider ===== */
const swiper = new Swiper('.swiper-container', {
  slidesPerView: 3,
  spaceBetween: 30,
  centeredSlides: true,
  loop: true,
  slideToClickedSlide: true,
  effect: 'coverflow',
  coverflowEffect: { rotate: 0, stretch: 0, depth: 100, modifier: 1, slideShadows: false, scale: 0.9 },
  autoplay: { delay: 2500, disableOnInteraction: false },
  pagination: { el: '.swiper-pagination', clickable: true },
  navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
  breakpoints: { 480: { slidesPerView: 1, spaceBetween: 15 }, 768: { slidesPerView: 2, spaceBetween: 20 }, 1024: { slidesPerView: 3, spaceBetween: 30 } },
});

/* ===== About Section Images Fade ===== */
const topLeftImages = ['/static/1.jpg', '/static/3.jpg', '/static/2.jpg'];
const bottomRightImages = ['/static/3.jpg', '/static/2.jpg', '/static/1.jpg'];
let topIndex = 0, bottomIndex = 0;

function fadeImage(imgElement, newSrc) {
  imgElement.style.opacity = 0;
  setTimeout(() => { imgElement.src = newSrc; imgElement.style.opacity = 1; }, 1000);
}

setInterval(() => {
  topIndex = (topIndex + 1) % topLeftImages.length;
  bottomIndex = (bottomIndex + 1) % bottomRightImages.length;
  fadeImage(document.querySelector('.about-img.top-left'), topLeftImages[topIndex]);
  fadeImage(document.querySelector('.about-img.bottom-right'), bottomRightImages[bottomIndex]);
}, 3000);

/* ===== Scroll-to-Top Button ===== */
const scrollBtn = document.getElementById("scrollTopBtn");
window.onscroll = function() {
  if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) scrollBtn.style.display = "block";
  else scrollBtn.style.display = "none";
};
scrollBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* ===== Rating System ===== */
const isLoggedIn = document.body.dataset.loggedIn === 'true';
async function rateFood(food, stars) {
  if (!isLoggedIn) { openForm('login'); showGuestToast(); return; }
  await fetch("/rate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ food, rating: stars }) });
  loadFoodData();
}

function updateStars(food, avg) {
  const starElems = document.querySelectorAll(`.stars[data-food="${food}"] i`);
  starElems.forEach((star, i) => {
    if (i < Math.round(avg)) { star.classList.remove("bx-star"); star.classList.add("bxs-star", "star-checked"); }
    else { star.classList.remove("bxs-star", "star-checked"); star.classList.add("bx-star"); }
  });
}

async function loadFoodData() {
  const res = await fetch("/food_data");
  const data = await res.json();
  for (const food in data) {
    const avg = data[food].avg_rating?.toFixed(1) || 0;
    document.getElementById(`avg-${food}`).innerText = `⭐ Average Rating: ${avg}`;
    updateStars(food, avg);
  }
}
window.addEventListener("DOMContentLoaded", loadFoodData);

async function loadRatings() {
  const res = await fetch("/get_ratings");
  const data = await res.json();
  const foods = ["Tapsilog", "Silog", "Pork silog", "Longsilog", "Malingsilog", "Bangus silog", "Hotsilog"];
  foods.forEach(food => {
    const container = document.getElementById(`ratings-${food}`);
    if (!container) return;
    container.innerHTML = "";
    data.filter(r => r.food === food).forEach(r => {
      const div = document.createElement("div");
      div.textContent = `${r.username}: ${r.rating} ⭐`;
      container.appendChild(div);
    });
  });
}
loadRatings();

/* ===== Global Comment Section ===== */
const commentInput = document.getElementById('global-comment-input');
const commentSubmit = document.getElementById('global-comment-submit');
const commentContainer = document.getElementById('global-comments');

async function loadGlobalComments() {
  const res = await fetch('/get_comments_global');
  const data = await res.json();
  commentContainer.innerHTML = '';
  data.reverse().forEach(c => {
    const div = document.createElement('div');
    div.className = 'comment-item';
    div.innerHTML = `<strong>${c.username}:</strong> ${c.comment}`;
    commentContainer.appendChild(div);
  });
  commentContainer.scrollTop = commentContainer.scrollHeight;
}

// Function to post comment
async function postComment() {
  if (!isLoggedIn) { openForm('login'); showGuestToast(); return; }
  const comment = commentInput.value.trim();
  if (!comment) return;
  await fetch('/add_comment_global', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment })
  });
  commentInput.value = '';
  await loadGlobalComments();
}

// Submit via button click
commentSubmit?.addEventListener('click', postComment);

// Submit via Enter key
commentInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { // shift+enter allows new line
    e.preventDefault();
    postComment();
  }
});

window.addEventListener('DOMContentLoaded', loadGlobalComments);


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

function animateOnScroll() {
  const elements = document.querySelectorAll('.scroll-animate');
  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight - 100) {
      if (!el.classList.contains('visible')) {
        const children = el.children;
        for (let i = 0; i < children.length; i++) {
          children[i].style.transitionDelay = `${i * 0.5}s`; // 0.5s between each child
        }
        el.classList.add('visible');
      }
    }
  });
}

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('DOMContentLoaded', animateOnScroll);
