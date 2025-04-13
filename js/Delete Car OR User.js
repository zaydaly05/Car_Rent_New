function submitDeleteCar(event) {
  event.preventDefault();

  const carCategory = document.getElementById("carCategory").value;
  const carName = document.getElementById("carName").value;
  const carColor = document.getElementById("carColor").value;

  if (!carCategory || !carName || !carColor) {
      alert("All fields are required.");
      return;
  }

  alert(`Car Deleted:\nCategory: ${carCategory}\nName: ${carName}\nColor: ${carColor}`);
  document.querySelector("form").reset();
}

function submitDeleteUser(event) {
  event.preventDefault();

  const userName = document.getElementById("userName");
  const userEmail = document.getElementById("userEmail");

  if (!userName || !userEmail) return;

  const name = userName.value;
  const email = userEmail.value;

  if (!name || !email) {
      alert("All fields are required.");
      return;
  }

  alert(`User Deleted:\nName: ${name}\nEmail: ${email}`);
  document.querySelector("form").reset();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const deleteButtons = document.querySelectorAll(".btn");

  deleteButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
          if (document.getElementById("carCategory")) {
              submitDeleteCar(e);
          } else if (document.getElementById("userEmail")) {
              submitDeleteUser(e);
          }
      });
  });
});