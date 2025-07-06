function addCropButton(img) {
  const cropBtn = document.createElement('button');
  cropBtn.innerText = '✂️ Crop';
  cropBtn.style.position = 'absolute';
  cropBtn.style.top = '50%';
  cropBtn.style.left = '50%';
  cropBtn.style.transform = 'translate(-50%, -50%)';
  cropBtn.style.zIndex = 9999;
  cropBtn.style.background = '#28a745';
  cropBtn.style.color = '#fff';
  cropBtn.style.border = 'none';
  cropBtn.style.padding = '10px 20px';
  cropBtn.style.borderRadius = '8px';
  cropBtn.style.fontSize = '16px';
  cropBtn.style.cursor = 'pointer';
  cropBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.4)';
  cropBtn.style.display = 'none';

  const parent = img.parentElement;
  parent.style.position = 'relative';
  parent.appendChild(cropBtn);

  parent.addEventListener('mouseenter', () => cropBtn.style.display = 'block');
  parent.addEventListener('mouseleave', () => cropBtn.style.display = 'none');

  cropBtn.addEventListener('click', () => {
    showCropModal(img.src);
  });
}

function showCropModal(imageSrc) {
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;justify-content:center;align-items:center;z-index:10000;">
      <div style="background:#fff;padding:20px;border-radius:8px;max-width:90%;max-height:90%;overflow:auto;">
        <h3 style="margin-top:0;">Select Image Region</h3>
        <img id="modalImage" src="${imageSrc}" style="max-width:100%;max-height:60vh;" />
        <div style="margin-top:10px;text-align:right;">
          <button id="resetBtn">Reset</button>
          <button id="clearBtn">Clear</button>
          <button id="sendBtn">Crop & Send</button>
          <button onclick="this.closest('div').parentElement.parentElement.remove()">Close</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const img = modal.querySelector('#modalImage');
  let cropper = null;

  img.onload = () => {
    cropper = new Cropper(img, {
      aspectRatio: NaN,
      viewMode: 1,
      background: false
    });

    modal.querySelector('#resetBtn').addEventListener('click', () => cropper.reset());
    modal.querySelector('#clearBtn').addEventListener('click', () => cropper.clear());
    modal.querySelector('#sendBtn').addEventListener('click', () => {
      const croppedCanvas = cropper.getCroppedCanvas();
      const base64Image = croppedCanvas.toDataURL('image/png');

      fetch('https://your-n8n-server/webhook/your-webhook-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatInput: base64Image })
      })
      .then(() => alert('✅ Sent to n8n successfully!'))
      .catch(() => alert('❌ Failed to send.'));
    });
  };
}

document.querySelectorAll('img').forEach(img => {
  addCropButton(img);
});
