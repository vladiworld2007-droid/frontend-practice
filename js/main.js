'use strict';
// ПР №15. Операторы, функции, безопасный вывод в DOM.
function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency', currency: 'RUB', maximumFractionDigits: 0
  }).format(price);
}
function calculateDiscount(price, percent) {
  if (price < 0 || percent < 0 || percent > 100) {
    throw new RangeError('Некорректная цена или скидка');
  }
  return Math.round(price * percent / 100);
}
function getFinalPrice(item) {
  return item.price - calculateDiscount(item.price, item.discountPercent);
}
function getProductStatus(item) {
  return item.isAvailable && item.price > 0 ? 'В наличии' : 'Нет в наличии';
}
function getShortDescription(item) {
  return `${item.title}: ${formatPrice(getFinalPrice(item))} со скидкой ${item.discountPercent}%. ${getProductStatus(item)}.`;
}
const hasDiscount = product.discountPercent > 0;
const isAffordable = getFinalPrice(product) <= 10000;
const canOrder = product.isAvailable && product.price > 0;
const isUnavailable = !product.isAvailable;
console.group('ПР №15 — демонстрация JavaScript');
console.table(product);
console.log('Обычная цена:', formatPrice(product.price));
console.log('Скидка:', formatPrice(calculateDiscount(product.price, product.discountPercent)));
console.log('Итоговая цена:', formatPrice(getFinalPrice(product)));
console.log('Статус:', getProductStatus(product));
console.log('Описание:', getShortDescription(product));
console.log('Сравнение и логические операции:', {hasDiscount, isAffordable, canOrder, isUnavailable});
console.groupEnd();

const messageElement = document.querySelector('#js-message');
if (messageElement) {
  // textContent трактует строку как текст, не исполняя HTML.
  messageElement.textContent = `Товар дня: ${getShortDescription(product)}`;
}

// Существующее поведение модального окна сохранено.
const orderDialog = document.querySelector('#order-dialog');
const selectedProduct = document.querySelector('#selected-product');
const dialogForm = document.querySelector('#order-form');
const dialogStatus = document.querySelector('#dialog-status');
let previousFocus = null;
document.querySelectorAll('[data-dialog-open]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!orderDialog) return;
    previousFocus = document.activeElement;
    if (selectedProduct) selectedProduct.value = button.dataset.product || '';
    if (dialogStatus) dialogStatus.hidden = true;
    if (dialogForm) dialogForm.hidden = false;
    orderDialog.showModal();
    orderDialog.querySelector('input:not([type=hidden])')?.focus();
  });
});
function closeOrderDialog() {
  if (!orderDialog?.open) return;
  orderDialog.close();
}
document.querySelectorAll('[data-dialog-close]').forEach((button) => {
  button.addEventListener('click', closeOrderDialog);
});
orderDialog?.addEventListener('click', (event) => {
  if (event.target === orderDialog) closeOrderDialog();
});
orderDialog?.addEventListener('close', () => {
  if (previousFocus?.isConnected) previousFocus.focus();
});
dialogForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!dialogForm.checkValidity()) {
    dialogForm.reportValidity();
    return;
  }
  dialogForm.hidden = true;
  if (dialogStatus) {
    dialogStatus.hidden = false;
    dialogStatus.textContent = 'Демонстрационная заявка заполнена. Данные не отправляются.';
  }
  window.setTimeout(() => {
    closeOrderDialog();
    dialogForm.reset();
    dialogForm.hidden = false;
    if (dialogStatus) dialogStatus.hidden = true;
  }, 2200);
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
    orderPageStatus.focus();
  }
});
