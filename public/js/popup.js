function showPopup(page) {
    Swal.fire({
        html: `<iframe src="${page}" width="100%" height="500px" frameborder="0"></iframe>`,
        width: 500,
        showCloseButton: true,
        showConfirmButton: false,
        focusConfirm: false,
        customClass: {
            popup: 'swal2-signup-modal'
        }
    });
}