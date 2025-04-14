//-----------------------------------------------Users------------------------------------------------------
//Add User Modal
function addUseropenModal() {
    document.getElementById("addUserModal").style.display = "block";
  }

  function addUsercloseModal() {
    document.getElementById("addUserModal").style.display = "none";
  }

  // Optional: Close when clicking outside the modal content
  window.onclick = function(event) {
    const modal = document.getElementById("addUserModal");
    if (event.target === modal) {
      modal.style.display = "none";
    }
  }
  
 //Edit User Modal
 
 function editUseropenModal() {
  document.getElementById("editUserModal").style.display = "block";
}

function editUsercloseModal() {
  document.getElementById("editUserModal").style.display = "none";
}

// Optional: Close when clicking outside the modal content

window.onclick = function(event) {
  const modal = document.getElementById("editUserModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
}

 //Delete User Modal
 
 function deleteUseropenModal() {
  document.getElementById("deleteUserModal").style.display = "block";
}

function deleteUsercloseModal() {
  document.getElementById("deleteUserModal").style.display = "none";
}

// Optional: Close when clicking outside the modal content

window.onclick = function(event) {
  const modal = document.getElementById("deleteUserModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
}

 //-----------------------------------------------Cars------------------------------------------------------
//Add Car Modal
function addCaropenModal() {
  document.getElementById("addCarModal").style.display = "block";
}

function addCarcloseModal() {
  document.getElementById("addCarModal").style.display = "none";
}

// Optional: Close when clicking outside the modal content
window.onclick = function(event) {
  const modal = document.getElementById("addCarModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
}

//Edit Car Modal

function editCaropenModal() {
document.getElementById("editCarModal").style.display = "block";
}

function editCarcloseModal() {
document.getElementById("editCarModal").style.display = "none";
}

// Optional: Close when clicking outside the modal content

window.onclick = function(event) {
const modal = document.getElementById("editCarModal");
if (event.target === modal) {
  modal.style.display = "none";
}
}

//Delete Car Modal

function deleteCaropenModal() {
document.getElementById("deleteCarModal").style.display = "block";
}

function deleteCarcloseModal() {
document.getElementById("deleteCarModal").style.display = "none";
}

// Optional: Close when clicking outside the modal content

window.onclick = function(event) {
const modal = document.getElementById("deleteCarModal");
if (event.target === modal) {
  modal.style.display = "none";
}
}

