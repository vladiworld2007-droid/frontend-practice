const orderDialog = document.querySelector('#order-dialog');
const orderButtons = document.querySelectorAll('.order-button');
const selectedProduct = document.querySelector('#selected-product');

orderButtons.forEach((button) => {
    button.addEventListener('click', () => {
        selectedProduct.value = button.dataset.product;
        orderDialog.showModal();
    });
});
const closeDialogButton = document.querySelector('#close-order-dialog');

closeDialogButton.addEventListener('click', () => {
    orderDialog.close();
});
const orderForm = document.querySelector('#order-form');
const successMessage = document.querySelector('#success-message');

orderForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!orderForm.checkValidity()) {
        orderForm.reportValidity();
        return;
    }

    orderDialog.close();
    successMessage.hidden = false;
    orderForm.reset();

    setTimeout(() => {
    successMessage.hidden = true;
}, 3000);
});