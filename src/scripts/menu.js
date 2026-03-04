// Hamburger menu
const hamburgerBtn = document.querySelector('.hamburger');
if (hamburgerBtn) {
  hamburgerBtn.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('expanded');
    hamburgerBtn.classList.toggle('active');
  });
}

if (window.innerWidth < 768) {
  // Fix dropdown menus to be static on mobile
  document.querySelectorAll('.mobile-dropdown-menu').forEach((menu) => {
    menu.style.position = 'static';
    menu.style.boxShadow = 'none';
    menu.style.borderRadius = '0';
    menu.style.width = '100%';
    menu.style.minWidth = 'unset';
    menu.style.background = 'transparent';
    menu.style.borderLeft = '2px solid rgba(96, 250, 155, 0.4)';
    menu.style.marginLeft = '24px';
    menu.style.marginTop = '4px';
    menu.style.padding = '4px 0';
  });

  // Main dropdown toggles
  document.querySelectorAll('.mobile-toggle').forEach((btn) => {
    const parentDiv = btn.closest('.relative.group');
    if (!parentDiv) return;
    const dropdown = parentDiv.querySelector('.mobile-dropdown-menu');
    if (!dropdown) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isHidden = dropdown.classList.contains('hidden');
      dropdown.classList.toggle('hidden', !isHidden);
      dropdown.classList.toggle('block', isHidden);
      const arrow = btn.querySelector('.mobile-arrow');
      if (arrow) arrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    });
  });

  // Sub dropdown toggles
  document.querySelectorAll('.mobile-subtoggle').forEach((btn) => {
    const parentDiv = btn.closest('.relative.group\\/sub');
    if (!parentDiv) return;
    const subdropdown = parentDiv.querySelector('.mobile-subdropdown');
    if (!subdropdown) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isHidden = subdropdown.classList.contains('hidden');
      subdropdown.classList.toggle('hidden', !isHidden);
      subdropdown.classList.toggle('block', isHidden);
      const arrow = btn.querySelector('.mobile-arrow');
      if (arrow) arrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
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
