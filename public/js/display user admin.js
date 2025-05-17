const users = [
  {
    name: "John Doe",
    email: "johndoe@gmail.com",
    status: "Active",
    image: "https://via.placeholder.com/150",
    rentalHistory: [
      { car: "Honda Civic", date: "2024-03-10", issue: "None" },
      { car: "Toyota Corolla", date: "2024-01-15", issue: "Gas problem" },
    ],
    cashDeposit: "$500",
    rating: 4,
  },
  {
    name: "Jane Smith",
    email: "janesmith@gmail.com",
    status: "Inactive",
    image: "https://via.placeholder.com/150",
    rentalHistory: [
      { car: "BMW 3 Series", date: "2024-02-05", issue: "Minor scratches" },
    ],
    cashDeposit: "$300",
    rating: 3,
  },
];

const userContainer = document.getElementById("userContainer");

users.forEach((user, index) => {
  const card = document.createElement("div");
  card.className = "user-card";
  card.innerHTML = `
    <img src="${user.image}" alt="${user.name}" />
    <div class="user-info">
      <h3>${user.name}</h3>
      <p>Email: ${user.email}</p>
      <p>Status: ${user.status}</p>
      <button class="details-btn" onclick="openPopup(${index})">View Details</button>
    </div>
  `;
  userContainer.appendChild(card);
});

function openPopup(index) {
  const user = users[index];
  document.getElementById("popupImage").src = user.image;
  document.getElementById("popupName").innerText = user.name;
  document.getElementById("popupEmail").innerText = `Email: ${user.email}`;
  document.getElementById("popupStatus").innerText = `Status: ${user.status}`;

  // Rental History
  const historyList = document.getElementById("historyList");
  historyList.innerHTML = ""; // Clear previous list
  user.rentalHistory.forEach(history => {
    const listItem = document.createElement("li");
    listItem.innerText = `${history.car} (Date: ${history.date}) - Issue: ${history.issue}`;
    historyList.appendChild(listItem);
  });

  // Cash Deposit
  document.getElementById("popupDeposit").innerText = `Cash Deposit: ${user.cashDeposit}`;

  // Rating
  document.getElementById("popupRating").innerText = user.rating;

  document.getElementById("popupOverlay").style.display = "flex";
}

function closePopup() {
  document.getElementById("popupOverlay").style.display = "none";
}