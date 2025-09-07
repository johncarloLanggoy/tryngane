const ordersTableBody = document.getElementById("ordersTableBody");
const paidOrdersTableBody = document.getElementById("paidOrdersTableBody");
const servedOrdersTableBody = document.getElementById("servedOrdersTableBody"); // NEW
const modal = document.getElementById("editModal");
const editForm = document.getElementById("editOrderForm");

function openEditModal(order) {
    modal.style.display = "flex";
    editForm.action = `/edit_order/${order.id}`;
    document.getElementById("cust_name").value = order.cust_name;
    document.getElementById("cust_contact").value = order.cust_contact;
    document.getElementById("order_date").value = order.order_date;
    document.getElementById("food").value = order.food;
    document.getElementById("quantity").value = order.quantity;
    document.getElementById("price").value = order.price;
}

function closeEditModal() {
    modal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == modal) closeEditModal();
};

// Populate Orders via API
function populateOrders(orders) {
    ordersTableBody.innerHTML = '';
    paidOrdersTableBody.innerHTML = '';
    servedOrdersTableBody.innerHTML = ''; // Clear served table

    if (orders.length === 0) {
        ordersTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No orders found.</td></tr>`;
        paidOrdersTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No paid orders found.</td></tr>`;
        servedOrdersTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No served orders found.</td></tr>`;
        return;
    }

    orders.forEach(order => {
        if(order.payment_status === "Served") {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${order.order_date}</td>
                <td>${order.cust_name}</td>
                <td>${order.cust_contact}</td>
                <td>${order.food}</td>
                <td>${order.quantity}</td>
                <td>${order.payment_status}</td>
            `;
            servedOrdersTableBody.appendChild(tr);

        } else if(order.payment_status === "Paid") {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${order.order_date}</td>
                <td>${order.cust_name}</td>
                <td>${order.cust_contact}</td>
                <td>${order.food}</td>
                <td>${order.quantity}</td>
                <td>${order.payment_status}</td>
            `;
            paidOrdersTableBody.appendChild(tr);

        } else {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${order.order_date}</td>
                <td>${order.cust_name}</td>
                <td>${order.cust_contact}</td>
                <td>${order.food}</td>
                <td>${order.quantity}</td>
                <td>${order.payment_status}</td>
                <td>
                    <div class="actions">
                        <button class="action-btn edit-btn" onclick='openEditModal(${JSON.stringify(order)})'>Edit</button>
                        <form method="POST" action="/delete_order/${order.id}" style="display:inline;">
                            <button type="submit" class="action-btn delete-btn" onclick="return confirm('Are you sure?');">Delete</button>
                        </form>
                    </div>
                </td>
            `;
            ordersTableBody.appendChild(tr);
        }
    });
}

window.onload = () => {
    fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
            populateOrders(data.orders);
        })
        .catch(err => console.error(err));
};

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