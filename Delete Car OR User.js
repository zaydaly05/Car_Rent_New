  function submitDeleteCar() {
    const categoryInput = document.getElementById("carCategory");
    const nameInput = document.getElementById("carName");
    const colorInput = document.getElementById("carColor");
    const error = document.getElementById("errorMessage");

    const category = categoryInput.value.trim();
    const name = nameInput.value.trim();
    const color = colorInput.value.trim();

    const lettersOnly = /^[A-Za-z\s]+$/;

    
    if (!category || !name || !color) {
      error.textContent = "All fields are required.";
      error.style.display = "block";
      return;
    }

    if (!lettersOnly.test(category) || !lettersOnly.test(name) || !lettersOnly.test(color)) {
      error.textContent = "Only letters are allowed in all fields.";
      error.style.display = "block";
      return;
    }

    
    error.style.display = "none";

    //alert(`Deleted Car:\nCategory: ${category}\nName: ${name}\nColor: ${color}`);

    
    const form = document.querySelector(".delete-form");
    if (form) {
      form.remove();
    }
  }

  function closeModal() {
    const form = document.querySelector(".delete-form");
    if (form) {
      form.remove();
    }
  }


  function submitDeleteUser() {
    const nameInput = document.getElementById("userName");
    const emailInput = document.getElementById("userEmail");
    const error = document.getElementById("errorMessage");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    const lettersOnly = /^[A-Za-z\s]+$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email) {
      error.textContent = "All fields are required.";
      error.style.display = "block";
      return;
    }

    if (!lettersOnly.test(name)) {
      error.textContent = "Only letters are allowed in the Name field.";
      error.style.display = "block";
      return;
    }

    if (!emailPattern.test(email)) {
      error.textContent = "Please enter a valid email address.";
      error.style.display = "block";
      return;
    }

    error.style.display = "none";

    //alert(`Deleted User:\nName: ${name}\nEmail: ${email}`);

    const form = document.querySelector(".delete-form");
    if (form) {
      form.remove();
    }
}

function closeModal() {
    const form = document.querySelector(".delete-form");
    if (form) {
      form.remove();
    }
}
