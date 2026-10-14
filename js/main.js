const orderDialog = document.querySelector('#order-dialog');
const selectedProduct = document.querySelector('#selected-product');
const dialogForm = document.querySelector('#order-form');
const dialogStatus = document.querySelector('#dialog-status');

document.querySelectorAll('[data-dialog-open]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!orderDialog) return;
    if (selectedProduct) selectedProduct.value = button.dataset.product || '';
    if (dialogStatus) dialogStatus.hidden = true;
    orderDialog.showModal();
  });
});

document.querySelectorAll('[data-dialog-close]').forEach((button) => {
  button.addEventListener('click', () => orderDialog?.close());
});

orderDialog?.addEventListener('click', (event) => {
  if (event.target === orderDialog) orderDialog.close();
});

dialogForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!dialogForm.checkValidity()) {
    dialogForm.reportValidity();
    return;
  }
  if (dialogStatus) {
    dialogForm.hidden = true;
    dialogStatus.hidden = false;
    window.setTimeout(() => {
      orderDialog.close();
      dialogForm.reset();
      dialogForm.hidden = false;
      dialogStatus.hidden = true;
    }, 2200);
  } else {
    dialogForm.reset();
    orderDialog.close();
  }
});

const orderPageForm = document.querySelector('#order-page-form');
const orderPageStatus = document.querySelector('#order-page-status');
const productSelect = document.querySelector('#order-product');
const productFromUrl = new URLSearchParams(window.location.search).get('product');
if (productFromUrl && productSelect) {
  const matchedOption = [...productSelect.options].find((option) => option.value === productFromUrl);
  if (matchedOption) productSelect.value = matchedOption.value;
}

orderPageForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!orderPageForm.checkValidity()) {
    orderPageForm.reportValidity();
    return;
  }
  orderPageForm.reset();
  if (orderPageStatus) {
    orderPageStatus.hidden = false;
    orderPageStatus.focus?.();
  }
});
