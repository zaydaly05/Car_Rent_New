const menu_btn = document.querySelector(".menubtn");
const navigation = document.querySelector(".navigation");

menu_btn.addEventListener("click", () => {
   // Only toggle for smaller screens
        menu_btn.classList.toggle("active");
        navigation.classList.toggle("active");
    
});
////slider
const btns = document.querySelectorAll(".navbtn");

var sliderNav = function (manual){
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