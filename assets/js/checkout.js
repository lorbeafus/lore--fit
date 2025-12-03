/**
 * Módulo de Checkout para Fauget Fitness
 * Maneja el proceso de pago con MercadoPago a través del backend
 */

// Configuración
const API_URL = window.location.origin;

/**
 * Inicia el proceso de checkout
 * @param {string} planType - Tipo de plan (classic, online, premium)
 */
async function initiateCheckout(planType) {
    try {
        // Mostrar indicador de carga (opcional)
        const button = document.querySelector(`[data-plan="${planType}"]`);
        if (button) {
            button.disabled = true;
            button.textContent = 'Procesando...';
        }

        // Hacer solicitud al backend para crear el checkout
        const response = await fetch(`${API_URL}/api/create-checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ planType })
        });

        const data = await response.json();

        // Verificar si hubo error
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Error al crear el checkout');
        }

        // Redirigir a MercadoPago
        if (data.payment_url) {
            window.location.href = data.payment_url;
        } else {
            throw new Error('No se recibió URL de pago');
        }

    } catch (error) {
        console.error('Error en checkout:', error);

        // Restaurar botón
        const button = document.querySelector(`[data-plan="${planType}"]`);
        if (button) {
            button.disabled = false;
            button.textContent = 'Reservar';
        }

        // Mostrar mensaje de error al usuario
        alert('Hubo un error al procesar tu solicitud. Por favor, intenta nuevamente.');
    }
}

/**
 * Inicializar event listeners cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', function () {
    // Buscar todos los botones con atributo data-plan
    const checkoutButtons = document.querySelectorAll('[data-plan]');

    checkoutButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const planType = this.getAttribute('data-plan');
            initiateCheckout(planType);
        });
    });
});
