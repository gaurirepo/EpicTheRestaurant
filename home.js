(function () {
  function openMenu(targetId) {
    const panels = document.getElementsByClassName('menu-panel');
    for (let i = 0; i < panels.length; i++) panels[i].style.display = 'none';
    const tabs = document.getElementsByClassName('tablink');
    for (let i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
    const target = document.getElementById(targetId);
    if (target) target.style.display = 'block';
    return targetId;
  }

  function initTabs() {
    const tabLinks = document.querySelectorAll('.tablink');
    tabLinks.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-target');
        openMenu(id);
        btn.classList.add('active');
      });
    });
    const defaultBtn = document.getElementById('defaultTab');
    if (defaultBtn) defaultBtn.click();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTabs);
  } else {
    initTabs();
  }
})();


