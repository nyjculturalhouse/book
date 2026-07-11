const UI = {
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `slide-up px-6 py-3 rounded-xl shadow-soft text-white text-sm font-medium ${type === 'error' ? 'bg-red-500' : 'bg-primary'}`;
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  showModal(title, desc, confirmText, onConfirm) {
    const modalHtml = `
      <div id="ui-modal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 fade-in">
        <div class="bg-container w-[320px] rounded-xl shadow-soft p-6 slide-up">
          <h3 class="text-lg font-bold mb-2">${title}</h3>
          <p class="text-sm text-gray-600 mb-6">${desc}</p>
          <div class="flex gap-2">
            <button id="modal-cancel" class="flex-1 py-2.5 rounded-lg bg-gray-100 font-medium hover:bg-gray-200 transition">취소</button>
            <button id="modal-confirm" class="flex-1 py-2.5 rounded-lg bg-accent-bg text-white font-medium hover:bg-accent-hover transition">${confirmText}</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    document.getElementById('modal-cancel').onclick = () => {
      document.getElementById('ui-modal').remove();
    };
    
    document.getElementById('modal-confirm').onclick = async () => {
      const btn = document.getElementById('modal-confirm');
      btn.disabled = true;
      btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-sm">progress_activity</span>';
      try {
        await onConfirm();
      } finally {
        document.getElementById('ui-modal')?.remove();
      }
    };
  },

  renderBookSkeleton(count = 4) {
    return Array(count).fill(0).map(() => `
      <div class="book-card bg-container rounded-xl p-3 shadow-soft flex flex-col gap-3">
        <div class="w-full aspect-[2/3] skeleton rounded-lg"></div>
        <div class="space-y-2">
          <div class="h-4 w-3/4 skeleton rounded"></div>
          <div class="h-3 w-1/2 skeleton rounded"></div>
        </div>
      </div>
    `).join('');
  },

  formatLocation(loc) {
    if(!loc) return '-';
    const parts = loc.split('-');
    if(parts.length === 3) return `${parts[0]}서가 · ${parts[1]}칸 · ${parts[2]}번째`;
    return loc;
  }
};
