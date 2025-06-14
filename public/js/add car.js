


document.getElementById('addCarForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);

    fetch('/showroom/luxury/add', {
        method: 'POST',
        body: data
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            alert('Car added successfully!');
            window.location.href = '/showroom/luxury';
        } else {
            alert(result.error || 'Error adding car!');
        }
    })
    .catch(() => alert('Error adding car!'));
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

