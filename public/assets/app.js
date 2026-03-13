const deliveryRadios = document.querySelectorAll('input[name="delivery_type"]');
const uploadBlock = document.querySelector('[data-upload-block]');
const linkBlock = document.querySelector('[data-link-block]');

function updateDelivery() {
  if (!deliveryRadios.length) return;
  const selected = document.querySelector('input[name="delivery_type"]:checked');
  if (!selected) return;
  const value = selected.value;
  if (uploadBlock) {
    uploadBlock.style.display = value === 'upload' ? 'grid' : 'none';
  }
  if (linkBlock) {
    linkBlock.style.display = value === 'link' ? 'grid' : 'none';
  }
}

deliveryRadios.forEach((radio) => {
  radio.addEventListener('change', updateDelivery);
});

updateDelivery();

const copyButton = document.querySelector('[data-copy]');
const copyTarget = document.querySelector('[data-copy-target]');
const copyStatus = document.querySelector('[data-copy-status]');

if (copyButton && copyTarget) {
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(copyTarget.value);
      if (copyStatus) {
        copyStatus.textContent = 'Link copiado.';
      }
    } catch (error) {
      copyTarget.select();
      if (copyStatus) {
        copyStatus.textContent = 'Copia manualmente el link.';
      }
    }
  });
}
