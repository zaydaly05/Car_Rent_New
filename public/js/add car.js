const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
app.use(express.json());


document.getElementById('addCarForm').addEventListener('submit', function (e) {
    e.preventDefault();
  
    let isValid = true;
  const carid=document.getElementById('carId').value.trim();
    const model = document.getElementById('carModel').value.trim();
    const category = document.getElementById('carCategory').value;
    const enginePower = document.getElementById('enginePower').value.trim();
    const colors = document.getElementById('colorsAvailable').value.trim();
  
    // Clear errors
    document.getElementById('carIdError').textContent = "";
    document.getElementById('modelError').textContent = "";
    document.getElementById('categoryError').textContent = "";
    document.getElementById('powerError').textContent = "";
    document.getElementById('colorsError').textContent = "";
  
    // Validate
    if (!model) {
      document.getElementById('modelError').textContent = "Please enter car model.";
      isValid = false;
    }
  
    if (!category) {
      document.getElementById('categoryError').textContent = "Please select a category.";
      isValid = false;
    }
  
    if (!enginePower) {
      document.getElementById('powerError').textContent = "Please enter engine power.";
      isValid = false;
    } else if (isNaN(enginePower) || parseInt(enginePower) <= 0) {
      document.getElementById('powerError').textContent = "Engine power must be a valid positive number.";
      isValid = false;
    }
  
    if (!colors) {
      document.getElementById('colorsError').textContent = "Please enter available colors.";
      isValid = false;
    }
    if(!carid) {
      document.getElementById('carIdError').textContent = "Please enter car ID.";
      isValid = false;
    }

  
    if (isValid) {
      alert("✅ Car added successfully!");
      this.reset();
      document.getElementById('preview').innerHTML = '';
    }
  });
  
  document.getElementById('carPhotos').addEventListener('change', function () {
    const preview = document.getElementById('preview');
    preview.innerHTML = '';
  
    Array.from(this.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  });
  
