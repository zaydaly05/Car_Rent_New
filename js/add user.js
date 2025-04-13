document.getElementById('form').addEventListener('submit', function(e) {
    e.preventDefault();
    validateForm();
});


document.querySelectorAll('#form input').forEach(input => {
    input.addEventListener('input', () => validateField(input));
    input.addEventListener('blur', () => validateField(input));
});

function validateForm() {
    let isValid = true;
    const inputs = [
        { id: 'name', errorId: 'name-error', validate: val => val.trim() !== '' },
        { id: 'email', errorId: 'email-error', validate: val => /^\S+@\S+\.\S+$/.test(val) },
        { id: 'password', errorId: 'password-error', validate: val => val.length >= 6 },
        { id: 'phone', errorId: 'phone-error', validate: val => /^\d{10,15}$/.test(val) },
        { id: 'license', errorId: 'license-error', validate: val => val.trim() !== '' },
        { id: 'name', errorId: 'name-error', validate: val => val.trim() !== '' },
        { id: 'email', errorId: 'email-error', validate: val => /^\S+@\S+\.\S+$/.test(val) },
        { id: 'password', errorId: 'password-error', validate: val => val.length >= 6 },
        { id: 'phone', errorId: 'phone-error', validate: val => /^\d{10,15}$/.test(val) },
        { id: 'license', errorId: 'license-error', validate: val => val.trim() !== '' },
    ];

    inputs.forEach(({ id, errorId, validate }) => {
        const value = document.getElementById(id).value.trim();
        if (!validate(value)) {
            isValid = false;
        }
    });

    if (isValid) {
        alert('✅ User added successfully!');
        this.reset();
    }
}

function validateField(input) {
    const id = input.id;
    const value = input.value.trim();
    let errorMessage = '';

    switch (id) {
        case('userid'):
            if (value === '') errorMessage = 'Please enter your user ID';
            else if (!/^[a-zA-Z0-9]+$/.test(value)) errorMessage = 'Invalid user ID (alphanumeric only)';
            break;
        case 'name':
            if (value === '') errorMessage = 'Please enter your full name';
            break;
        case 'email':
            if (value === '') errorMessage = 'Please enter your email';
            else if (!/^\S+@\S+\.\S+$/.test(value)) errorMessage = 'Invalid email';
            break;
        case 'password':
            if (value === '') errorMessage = 'Please enter your password';
            else if (value.length < 6) errorMessage = 'Password must be at least 6 characters';
            break;
        case 'phone':
            if (value === '') errorMessage = 'Please enter your phone number';
            else if (!/^\d{10,15}$/.test(value)) errorMessage = 'Invalid phone (10–15 digits)';
            break;
        case 'license':
            if (value === '') errorMessage = 'Please enter your license number';
            break;
    }

    showError(`${id}-error`, errorMessage);
}


function showError(id, message) {
    const errorElement = document.getElementById(id);
    errorElement.textContent = message;
    errorElement.style.color = 'red'; 
}
