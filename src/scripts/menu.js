// Hamburger menu
const hamburgerBtn = document.querySelector('.hamburger');
if (hamburgerBtn) {
  hamburgerBtn.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('expanded');
    hamburgerBtn.classList.toggle('active');
  });
}

// Mobile dropdowns
if (window.innerWidth < 768) {
  document.querySelectorAll('.mobile-toggle').forEach((btn) => {
    const dropdown = btn.nextElementSibling;
    if (!dropdown) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isHidden = dropdown.classList.contains('hidden');
      dropdown.classList.toggle('hidden', !isHidden);
      dropdown.classList.toggle('block', isHidden);
      btn.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
      btn.style.transition = 'transform 0.2s';
    });
  });

  document.querySelectorAll('.mobile-subtoggle').forEach((btn) => {
    const subdropdown = btn.nextElementSibling;
    if (!subdropdown) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isHidden = subdropdown.classList.contains('hidden');
      subdropdown.classList.toggle('hidden', !isHidden);
      subdropdown.classList.toggle('block', isHidden);
      btn.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
      btn.style.transition = 'transform 0.2s';
    });
  });
}

// More projects
const moreProjectsBtn = document.querySelector('#moreProjects');
if (moreProjectsBtn) {
  moreProjectsBtn.addEventListener('click', () => {
    document.querySelector('#containerProjects').classList.remove('h-[150vh]', 'h-auto');
    moreProjectsBtn.classList.add('hidden');
  });
}
