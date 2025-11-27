// ========================================
// MENU HAMBURGUESA - Fauget Fitness
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const body = document.body;
    
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    body.appendChild(overlay);
    
    // Toggle menú al hacer clic en hamburguesa
    hamburger.addEventListener('click', function() {
        toggleMenu();
    });
    
    // Cerrar menú al hacer clic en overlay
    overlay.addEventListener('click', function() {
        closeMenu();
    });
    
    // Cerrar menú al hacer clic en un enlace
    const links = navLinks.querySelectorAll('.nav__link');
    links.forEach(link => {
        link.addEventListener('click', function() {
            closeMenu();
        });
    });
    
    // Función para abrir/cerrar menú
    function toggleMenu() {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        overlay.classList.toggle('active');
        body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    }
    
    // Función para cerrar menú
    function closeMenu() {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        overlay.classList.remove('active');
        body.style.overflow = '';
    }
    
    // Cerrar menú al cambiar tamaño de ventana (si se hace más grande)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
});
