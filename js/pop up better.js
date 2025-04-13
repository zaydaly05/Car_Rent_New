function openModal() {
    document.getElementById("addUserModal").style.display = "block";
  }

  function closeModal() {
    document.getElementById("addUserModal").style.display = "none";
  }

  // Optional: Close when clicking outside the modal content
  window.onclick = function(event) {
    const modal = document.getElementById("addUserModal");
    if (event.target === modal) {
      modal.style.display = "none";
    }
  }
  
 




 