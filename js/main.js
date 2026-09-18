/**
 * ESTUDIO JURÍDICO - DRA. FABIANA E. CASTRO
 * Lógica de cliente, selector interactivo de casos, mapa y validación de formulario
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Actualización automática del año en el pie de página
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 2. Animación progresiva al hacer scroll (Intersection Observer)
    const observeElements = document.querySelectorAll('.service-card-item, .about-card, .consultation-card, .location-info-card, .map-frame-wrapper');
    
    if ('IntersectionObserver' in window) {
        const appearOptions = {
            threshold: 0.12,
            rootMargin: "0px 0px -30px 0px"
        };

        const appearOnScroll = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, appearOptions);

        observeElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(24px)';
            el.style.transition = `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.08}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.08}s`;
            appearOnScroll.observe(el);
        });

        // Estilo dinámico de visibilidad
        const style = document.createElement('style');
        style.innerHTML = `
            .service-card-item.is-visible,
            .about-card.is-visible,
            .consultation-card.is-visible,
            .location-info-card.is-visible,
            .map-frame-wrapper.is-visible {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // 3. Resaltado activo del menú al deslizarse
    const sections = document.querySelectorAll('section[id], div[id="inicio"], footer[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.pageYOffset + 220;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // 4. Selector Interactivo de Tipo de Caso con Botones
    const caseButtons = document.querySelectorAll('.case-select-btn');
    const legalAreaInput = document.getElementById('legal-area');
    const areaError = document.getElementById('area-error');

    const selectCaseType = (buttonEl) => {
        caseButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-checked', 'false');
        });
        buttonEl.classList.add('active');
        buttonEl.setAttribute('aria-checked', 'true');

        if (legalAreaInput) {
            legalAreaInput.value = buttonEl.getAttribute('data-area');
        }
        if (areaError) {
            areaError.textContent = '';
        }
    };

    caseButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            selectCaseType(btn);
        });
    });

    // 5. Vincular las tarjetas de Servicios de la portada con los botones del formulario
    const serviceCards = document.querySelectorAll('.service-card-item');
    serviceCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.setAttribute('title', 'Haga clic para consultar sobre esta área');

        card.addEventListener('click', () => {
            const cardTitleEl = card.querySelector('.service-card-title');
            if (!cardTitleEl) return;
            const cardTitleText = cardTitleEl.textContent.trim().toLowerCase();

            // Buscar el botón que coincida con el título de la tarjeta
            caseButtons.forEach(btn => {
                const btnText = btn.querySelector('.case-btn-text').textContent.trim().toLowerCase();
                if (btnText.includes(cardTitleText)) {
                    selectCaseType(btn);
                }
            });

            // Desplazamiento suave al formulario de consulta
            const consultationSection = document.getElementById('consulta');
            if (consultationSection) {
                consultationSection.scrollIntoView({ behavior: 'smooth' });
                const nameField = document.getElementById('client-name');
                if (nameField) {
                    setTimeout(() => nameField.focus(), 600);
                }
            }
        });
    });

    // 6. Gestión y Envío del Formulario de Consulta Personalizada a WhatsApp
    const consultationForm = document.getElementById('consultation-form');
    if (consultationForm) {
        const nameInput = document.getElementById('client-name');
        const phoneInput = document.getElementById('client-phone');
        const preferenceSelect = document.getElementById('contact-preference');
        const detailsInput = document.getElementById('case-details');
        const submitBtn = document.getElementById('btn-submit-consultation');

        const setupClearError = (inputEl, errorId) => {
            const errorEl = document.getElementById(errorId);
            inputEl.addEventListener('input', () => {
                inputEl.classList.remove('input-error');
                if (errorEl) errorEl.textContent = '';
            });
            inputEl.addEventListener('change', () => {
                inputEl.classList.remove('input-error');
                if (errorEl) errorEl.textContent = '';
            });
        };

        setupClearError(nameInput, 'name-error');
        setupClearError(detailsInput, 'details-error');

        consultationForm.addEventListener('submit', (e) => {
            e.preventDefault();

            let isValid = true;

            // Validación de Nombre
            const nameVal = nameInput.value.trim();
            const nameError = document.getElementById('name-error');
            if (!nameVal) {
                nameInput.classList.add('input-error');
                if (nameError) nameError.textContent = 'Por favor, ingrese su nombre y apellido.';
                isValid = false;
            }

            // Validación de Área Legal seleccionada
            const areaVal = legalAreaInput ? legalAreaInput.value : '';
            if (!areaVal) {
                if (areaError) areaError.textContent = 'Por favor, seleccione el tipo de caso a consultar pulsando uno de los botones.';
                isValid = false;
            }

            // Validación de Detalle
            const detailsVal = detailsInput.value.trim();
            const detailsError = document.getElementById('details-error');
            if (!detailsVal) {
                detailsInput.classList.add('input-error');
                if (detailsError) detailsError.textContent = 'Por favor, detalle brevemente el motivo de su consulta.';
                isValid = false;
            }

            if (!isValid) {
                const firstError = consultationForm.querySelector('.input-error');
                if (firstError) {
                    firstError.focus();
                } else if (!areaVal) {
                    const firstCaseBtn = document.querySelector('.case-select-btn');
                    if (firstCaseBtn) firstCaseBtn.focus();
                }
                return;
            }

            const phoneVal = phoneInput.value.trim();
            const preferenceVal = preferenceSelect.value;

            // Construcción del mensaje para WhatsApp
            let message = `Hola Dra. Fabiana Castro, mi nombre es *${nameVal}* y me comunico desde su sitio web para solicitar asesoramiento legal.\n\n`;
            message += `⚖️ *Tipo de caso:* ${areaVal}\n`;
            message += `🤝 *Modalidad preferida:* ${preferenceVal}\n`;
            if (phoneVal) {
                message += `📞 *Teléfono de contacto:* ${phoneVal}\n`;
            }
            message += `\n📝 *Detalle de la consulta:*\n"${detailsVal}"`;

            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/5492604820384?text=${encodedMessage}`;

            // Animación visual del botón
            const originalBtnContent = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> <span>Abriendo WhatsApp...</span>';
            submitBtn.style.opacity = '0.9';

            setTimeout(() => {
                window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
                setTimeout(() => {
                    submitBtn.innerHTML = originalBtnContent;
                    submitBtn.style.opacity = '1';
                }, 1500);
            }, 300);
        });
    }
});
