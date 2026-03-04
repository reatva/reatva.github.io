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
    link.addEventListener('click', (e) => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        e.preventDefault();
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
    link.addEventListener('click', (e) => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        e.preventDefault();
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

