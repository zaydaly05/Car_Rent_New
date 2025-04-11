const openPopupButton = document.getElementById('openPopup');
const popup = document.getElementById('popup');
const closePopupButton = document.getElementById('closePopup');

openPopupButton.addEventListener('click', () => {
    popup.style.display = 'flex';
});

closePopupButton.addEventListener('click', (event) => {
    event.preventDefault();
    popup.style.display = 'none';
});
