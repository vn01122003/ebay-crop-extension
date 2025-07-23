let flipX = 1;
let flipY = 1;

function addCropButton(img) {
  const cropBtn = document.createElement('button');
  cropBtn.textContent = '✂️ Crop';
  Object.assign(cropBtn.style, {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 9999,
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
    display: 'none'
  });

  const parent = img.parentElement;
  parent.style.position = 'relative';
  parent.appendChild(cropBtn);

  parent.addEventListener('mouseenter', () => cropBtn.style.display = 'block');
  parent.addEventListener('mouseleave', () => cropBtn.style.display = 'none');

  cropBtn.addEventListener('click', () => showCropModal(img.src));
}

function showCropModal(imageSrc) {
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.8);display:flex;justify-content:center;align-items:center;z-index:2147483647;">
      <div style="background:#fff;padding:20px;border-radius:8px;box-sizing:border-box;aspect-ratio:16/9;width:80vw;max-width:90vw;max-height:90vh;display:flex;flex-direction:column;justify-content:center;align-items:center;overflow:auto;">
        <h3 style="text-align:left;margin-top:0;margin-left:0;padding-left:0;">Select Image Region</h3>
        <div style="text-align:center;flex:1;display:flex;justify-content:center;align-items:center;width:100%;height:100%;">
          <img id="modalImage" src="${imageSrc}" style="max-width:100%;max-height:60vh;object-fit:contain;" />
        </div>
        <div id="controlPanel" style="margin-top:15px;display:flex;flex-wrap:wrap;gap:12px;justify-content:center;">
          ${[
            'Reset', 'Clear',
            'Aspect: Free', 'Aspect: 1:1',
            '⬇️ Download', '📤 Send to generator', '❌ Close'
          ].map((label, idx) => `<button id="btn${idx}" class="cropper-fancy-btn">${label}</button>`).join('')}
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
      background: false,
      responsive: true,
      autoCrop: false // Allow user to draw crop box manually
    });

    const actions = [
      // Only keep the following actions
      () => cropper.reset(),
      () => cropper.clear(),
      () => cropper.setAspectRatio(NaN),
      () => cropper.setAspectRatio(1),
      () => {
        cropper.getCroppedCanvas().toBlob(blob => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'cropped-image.png';
          a.click();
        });
      },
      () => {
        const croppedCanvas = cropper.getCroppedCanvas();
        const base64Image = croppedCanvas.toDataURL('image/png');
        fetch("https://tool-backend-4i2f.onrender.com/webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatInput: base64Image })
        })
        .then(res => {
          if (!res.ok) throw new Error("Server returned error: " + res.status);
          return res.blob();
        })
        .then(blob => {
          console.log("✅ Received image blob:", blob);
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "image_gen.png";
          a.click();
          console.log("📥 Download triggered");
        })
        .catch(err => {
          console.error("❌ Download failed:", err);
        });
      },
      () => modal.remove()
    ];

    actions.forEach((fn, i) => document.getElementById(`btn${i}`).onclick = fn);
  };
}

// 🔄 Tự động thêm crop button cho tất cả ảnh
document.querySelectorAll('img').forEach(addCropButton);

// Add styles for fancy buttons
if (!document.getElementById('cropper-fancy-btn-style')) {
  const style = document.createElement('style');
  style.id = 'cropper-fancy-btn-style';
  style.textContent = `
    .cropper-fancy-btn {
      background: #f7f7f7;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 16px;
      color: #222;
      margin: 2px 0;
      box-shadow: 0 1px 4px rgba(0,0,0,0.07);
      cursor: pointer;
      transition: background 0.2s, box-shadow 0.2s, color 0.2s;
      outline: none;
    }
    .cropper-fancy-btn:hover {
      background: #e0f0ff;
      color: #1976d2;
      box-shadow: 0 2px 8px rgba(25, 118, 210, 0.10);
      border-color: #90caf9;
    }
    .cropper-fancy-btn:active {
      background: #bbdefb;
      color: #0d47a1;
    }
  `;
  document.head.appendChild(style);
}