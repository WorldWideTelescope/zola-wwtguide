"use strict";

(function sidebar() {
  var html = document.querySelector("html");
  var sidebar = document.getElementById("sidebar");
  var sidebarLinks = document.querySelectorAll('#sidebar a');
  var sidebarToggleButton = document.getElementById("sidebar-toggle");
  var firstContact = null;

  function showSidebar() {
    html.classList.remove('sidebar-hidden')
    html.classList.add('sidebar-visible');
    Array.from(sidebarLinks).forEach(function (link) {
      link.setAttribute('tabIndex', 0);
    });
    sidebarToggleButton.setAttribute('aria-expanded', true);
    sidebar.setAttribute('aria-hidden', false);
    try { localStorage.setItem('mdbook-sidebar', 'visible'); } catch (e) { }
  }

  var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');

  function toggleSection(ev) {
    ev.currentTarget.parentElement.classList.toggle('expanded');
  }

  Array.from(sidebarAnchorToggles).forEach(function (el) {
    el.addEventListener('click', toggleSection);
  });

  function hideSidebar() {
    html.classList.remove('sidebar-visible')
    html.classList.add('sidebar-hidden');
    Array.from(sidebarLinks).forEach(function (link) {
      link.setAttribute('tabIndex', -1);
    });
    sidebarToggleButton.setAttribute('aria-expanded', false);
    sidebar.setAttribute('aria-hidden', true);
    try { localStorage.setItem('mdbook-sidebar', 'hidden'); } catch (e) { }
  }

  // Toggle sidebar
  sidebarToggleButton.addEventListener('click', function sidebarToggle() {
    if (html.classList.contains("sidebar-hidden")) {
      showSidebar();
    } else if (html.classList.contains("sidebar-visible")) {
      hideSidebar();
    } else {
      if (getComputedStyle(sidebar)['transform'] === 'none') {
        hideSidebar();
      } else {
        showSidebar();
      }
    }
  });

  document.addEventListener('touchstart', function (e) {
    firstContact = {
      x: e.touches[0].clientX,
      time: Date.now()
    };
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    if (!firstContact)
      return;

    var curX = e.touches[0].clientX;
    var xDiff = curX - firstContact.x,
        tDiff = Date.now() - firstContact.time;

    if (tDiff < 250 && Math.abs(xDiff) >= 150) {
      if (xDiff >= 0 && firstContact.x < Math.min(document.body.clientWidth * 0.25, 300))
        showSidebar();
      else if (xDiff < 0 && curX < 300)
        hideSidebar();

      firstContact = null;
    }
  }, { passive: true });

  // Scroll sidebar to current active section
  var activeSection = document.getElementById("sidebar").querySelector(".active");
  if (activeSection) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
    activeSection.scrollIntoView({ block: 'center' });
  }
})();


(function chapterNavigation() {
  document.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) { return; }
    if (window.search && window.search.hasFocus()) { return; }

    switch (e.key) {
    case 'ArrowRight':
      e.preventDefault();
      var nextButton = document.querySelector('.nav-chapters.next');
      if (nextButton) {
        window.location.href = nextButton.href;
      }
      break;
    case 'ArrowLeft':
      e.preventDefault();
      var previousButton = document.querySelector('.nav-chapters.previous');
      if (previousButton) {
        window.location.href = previousButton.href;
      }
      break;
    }
  });
})();


(function clickingMenuTitleScrollsToTop () {
  var menuTitle = document.querySelector('.menu-title');

  menuTitle.addEventListener('click', function () {
    document.scrollingElement.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


(function controllMenu() {
  var menu = document.getElementById('menu-bar');

  (function controllPosition() {
    var scrollTop = document.scrollingElement.scrollTop;
    var prevScrollTop = scrollTop;
    var minMenuY = -menu.clientHeight - 50;
    // When the script loads, the page can be at any scroll (e.g. if you refresh it).
    menu.style.top = scrollTop + 'px';
    // Same as parseInt(menu.style.top.slice(0, -2), but faster
    var topCache = menu.style.top.slice(0, -2);
    menu.classList.remove('sticky');
    var stickyCache = false; // Same as menu.classList.contains('sticky'), but faster
    document.addEventListener('scroll', function () {
      scrollTop = Math.max(document.scrollingElement.scrollTop, 0);
      // `null` means that it doesn't need to be updated
      var nextSticky = null;
      var nextTop = null;
      var scrollDown = scrollTop > prevScrollTop;
      var menuPosAbsoluteY = topCache - scrollTop;
      if (scrollDown) {
        nextSticky = false;
        if (menuPosAbsoluteY > 0) {
          nextTop = prevScrollTop;
        }
      } else {
        if (menuPosAbsoluteY > 0) {
          nextSticky = true;
        } else if (menuPosAbsoluteY < minMenuY) {
          nextTop = prevScrollTop + minMenuY;
        }
      }
      if (nextSticky === true && stickyCache === false) {
        menu.classList.add('sticky');
        stickyCache = true;
      } else if (nextSticky === false && stickyCache === true) {
        menu.classList.remove('sticky');
        stickyCache = false;
      }
      if (nextTop !== null) {
        menu.style.top = nextTop + 'px';
        topCache = nextTop;
      }
      prevScrollTop = scrollTop;
    }, { passive: true });
  })();

  (function controllBorder() {
    menu.classList.remove('bordered');
    document.addEventListener('scroll', function () {
      if (menu.offsetTop === 0) {
        menu.classList.remove('bordered');
      } else {
        menu.classList.add('bordered');
      }
    }, { passive: true });
  })();
})();
