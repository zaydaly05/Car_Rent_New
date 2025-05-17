//Login
function loginModal() {
    document.getElementById("loginModal").style.display = "block";
  }

  function loginModal() {
    document.getElementById("loginModal").style.display = "none";
  }

  // Optional: Close when clicking outside the modal content
  window.onclick = function(event) {
    const modal = document.getElementById("loginModal");
    if (event.target === modal) {
      modal.style.display = "none";
    }
  }
  
 //SignUp
 
 function signupopenModal() {
  document.getElementById("signupModal").style.display = "block";
}

function signupcloseModal() {
  document.getElementById("signupModal").style.display = "none";
}

// Optional: Close when clicking outside the modal content

window.onclick = function(event) {
  const modal = document.getElementById("signupModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
}