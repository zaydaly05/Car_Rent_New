// Get references to the popup and its elements
const popup = document.getElementById('popup');
const popupContent = document.getElementById('popupContent');
const closePopupButton = document.getElementById('closePopup');

// Function to open the popup and load content
function openPopup(formPath) {
    // Fetch the form HTML and load it into the popup
    fetch(formPath)
        .then(response => response.text())
        .then(html => {
            popupContent.innerHTML = html; // Insert the form into the popup
            popup.style.display = 'flex'; // Show the popup
        })
        .catch(error => console.error('Error loading form:', error));
}

// Function to close the popup
function closePopup() {
    popup.style.display = 'none'; // Hide the popup
    popupContent.innerHTML = ''; // Clear the popup content
}

/////////////////// admin dashboard popup ///////////////////
document.getElementById('addUserBtn').addEventListener('click', () => openPopup('../html/add user.html'));
document.getElementById('editUserBtn').addEventListener('click', () => openPopup('../html/admin_edit_user.html'));
document.getElementById('deleteUserBtn').addEventListener('click', () => openPopup('../html/Delete User.html'));
document.getElementById('displayUsersBtn').addEventListener('click', () => openPopup('../html/display_users.html')); // Add this file if needed

document.getElementById('addCarBtn').addEventListener('click', () => openPopup('../html/add car.html'));
document.getElementById('editCarBtn').addEventListener('click', () => openPopup('../html/edit_car.html')); // Add this file if needed
document.getElementById('deleteCarBtn').addEventListener('click', () => openPopup('../html/Delete Car.html'));
document.getElementById('displayCarsBtn').addEventListener('click', () => openPopup('../html/display_cars.html')); // Add this file if needed
////////////////////////////////////////////////////////////////////////////

closePopupButton.addEventListener('click', closePopup);
