const menu_btn = document.querySelector(".menubtn");
const navigation = document.querySelector(".navigation");

menu_btn.addEventListener("click", () => {
    menu_btn.classList.toggle("active");
    navigation.classList.toggle("active");
});

// Slider functionality
var sliderNav = function (manual) {
    btns.forEach((btn) => {
        btn.classList.remove("active");
    });
    btns[manual].classList.add("active");
} 
btns.forEach((btn, i) => {
    btn.addEventListener("click", () => {
        sliderNav(i);
    });
})