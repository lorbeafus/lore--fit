// ========================================
// CAROUSEL ANIMATION - Fauget Fitness
// ========================================

function initCarousel() {
    const carouselTexts = document.querySelectorAll('.carousel-text');
    let currentIndex = 0;

    if (carouselTexts.length === 0) return;

    // Función para cambiar al siguiente texto
    function nextSlide() {
        // Remover clase active del texto actual
        carouselTexts[currentIndex].classList.remove('active');
        
        // Incrementar índice
        currentIndex = (currentIndex + 1) % carouselTexts.length;
        
        // Agregar clase active al nuevo texto
        carouselTexts[currentIndex].classList.add('active');
    }

    // Cambiar de texto cada 3 segundos
    setInterval(nextSlide, 3000);
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousel);
} else {
    initCarousel();
}
