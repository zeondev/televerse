function modal(content) {
    let modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = content;
    setTimeout(() => {modal.classList.add('show');}, 100)
    document.body.appendChild(modal);
    createModalOverlay();

    return modal;
}

function createModalOverlay() {
    deleteModalOverlay();
    let overlay = document.createElement('div');
    document.body.style.overflow = 'hidden';
    overlay.classList.add('modal-overlay');
    setTimeout(() => {overlay.classList.add('show');}, 100)
    document.body.appendChild(overlay);
    overlay.onclick = closeModal;
}

function deleteModalOverlay() {
    document.body.style.overflow = 'unset';
    if (document.querySelector('.modal-overlay') !== null) {
        document.querySelector('.modal-overlay').classList.remove('show');
        setTimeout(() => {
            document.querySelector('.modal-overlay').remove();
        }, 500)
    }
}

function closeModal() {
    deleteModalOverlay();
    if (document.querySelector('.modal') !== null) {
        document.querySelector('.modal').classList.remove('show');
        setTimeout(() => {
            document.querySelector('.modal').remove();
        }, 500)
    }
}