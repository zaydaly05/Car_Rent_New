

// script.js
const cars = [
  { name: "ElAntra", model: "2022", brand: "Hyundai", status: "Available", image: "https://github.com/zaydaly05/Car_Rent_New/blob/main/Images/ElAntra.jpg" },
  { name: "Ferrari", model: "2023", brand: "Ferrari", status: "Unavailable", image: "https://github.com/zaydaly05/Car_Rent_New/blob/main/Images/Ferrari.jpg" },
  { name: "Jeep Grand", model: "2022", brand: "Jeep", status: "Available", image: "https://github.com/zaydaly05/Car_Rent_New/blob/main/Images/Jeep%20Grand.jpg" },

  { name: "McLaren 720S", model: "2023", brand: "McLaren", status: "Unavailable", image: "https://github.com/zaydaly05/Car_Rent_New/blob/main/Images/McLaren-720S.jpeg" },
  { name: "Optera", model: "2021", brand: "Optera", status: "Available", image: "https://github.com/zaydaly05/Car_Rent_New/blob/main/Images/Optera.jpg" },
  { name: "Porsche", model: "2022", brand: "Porsche", status: "Unavailable", image: "https://github.com/zaydaly05/Car_Rent_New/blob/main/Images/Porshe.jpg" },
];

const container = document.getElementById("carContainer");

function displayCars() {
  container.innerHTML = "";
  cars.forEach(car => {
    const card = document.createElement("div");
    card.className = "car-card";
    card.innerHTML = `
      <img src="${car.image}" alt="${car.name}">
      <div class="car-info">
        <h3>${car.name}</h3>
        <p>Model: ${car.model}</p>
        <p>Brand: ${car.brand}</p>
        <p>Status: ${car.status}</p>
        <button class="details-btn" onclick='showPopup(${JSON.stringify(car)})'>View Details</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function showPopup(car) {
  document.getElementById("popupImage").src = car.image;
  document.getElementById("popupTitle").textContent = car.name;
  document.getElementById("popupModel").textContent = "Model: " + car.model;
  document.getElementById("popupBrand").textContent = "Brand: " + car.brand;
  document.getElementById("popupStatus").textContent = "Status: " + car.status;
  document.getElementById("popupOverlay").style.display = "flex";
}

function closePopup() {
  document.getElementById("popupOverlay").style.display = "none";
}

displayCars();