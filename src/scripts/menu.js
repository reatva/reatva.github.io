// Hamburger menu
const hamburgerBtn = document.querySelector('.hamburger');
if (hamburgerBtn) {
  hamburgerBtn.addEventListener('click', () => {
    const navLinks = document.querySelector('.nav-links');
    const hamburger = document.querySelector('.hamburger');
    navLinks.classList.toggle('expanded');
    hamburger.classList.toggle('active');
  });
}

// Mobile dropdowns
document.querySelectorAll('.nav-links .relative.group').forEach((dropdown) => {
  const link = dropdown.querySelector('a');
  const menu = dropdown.querySelector('.absolute');

  if (link && menu) {
    link.style.display = 'flex';
    link.style.justifyContent = 'space-between';
    link.style.alignItems = 'center';
    link.style.width = '100%';

    const toggleBtn = document.createElement('span');
    toggleBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 5L7.5 10L12 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
    toggleBtn.className = 'ml-auto p-1 cursor-pointer';
    link.appendChild(toggleBtn);

    toggleBtn.addEventListener('click', (e) => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        e.preventDefault();
        e.stopPropagation();
        menu.classList.toggle('hidden');
        menu.classList.toggle('block');
      }
    });
  }
});

// Mobile subDropdowns
document.querySelectorAll('.nav-links .relative.group\\/sub').forEach((sub) => {
  const link = sub.querySelector('a');
  const menu = sub.querySelector('.absolute');

  if (link && menu) {
    link.style.display = 'flex';
    link.style.justifyContent = 'space-between';
    link.style.alignItems = 'center';
    link.style.width = '100%';

    const toggleBtn = document.createElement('span');
    toggleBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 5L7.5 10L12 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
    toggleBtn.className = 'ml-auto p-1 cursor-pointer';
    link.appendChild(toggleBtn);

    toggleBtn.addEventListener('click', (e) => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        e.preventDefault();
        e.stopPropagation();
        menu.classList.toggle('hidden');
        menu.classList.toggle('block');
      }
    });
  }
});

// More projects
const moreProjectsBtn = document.querySelector('#moreProjects');
if (moreProjectsBtn) {
  moreProjectsBtn.addEventListener('click', () => {
    const contenedor = document.querySelector('#containerProjects');
    const moreprojects = document.querySelector('#moreProjects');
    contenedor.classList.remove('h-[150vh]');
    contenedor.classList.remove('h-auto');
    moreprojects.classList.add('hidden');
  });
}

