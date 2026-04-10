import { renderHeader } from '/header.js';

window.onload = () => {
    document.body.prepend(renderHeader());
    setupNav();
    setupSizeBtns();

    const hash = window.location.hash.replace('#', '');
    if (hash) {
        const target = document.querySelector(`.settings-nav-link[data-section="${hash}"]`);
        if (target) target.click();
    }
};

function setupSizeBtns() {
    document.querySelectorAll('.size-options').forEach(group => {
        group.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                group.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    });
}

function setupNav() {
    const links = document.querySelectorAll('.settings-nav-link[data-section]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.section;

            // update active link
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // show target section
            document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
            const section = document.getElementById(`section-${target}`);
            if (section) section.classList.add('active');
        });
    });
}

window.saveChanges = function () {
    // update sidebar name preview
    const first = document.getElementById('firstName')?.value;
    const surname = document.getElementById('surname')?.value;
    if (first) document.getElementById('sidebarFirstName').textContent = first;
    if (surname) document.getElementById('sidebarSurname').textContent = surname;

    // show toast
    const toast = document.getElementById('saveToast');
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 2500);
};
