document.addEventListener('DOMContentLoaded', function() {

    // ============================================ //
    // ATRIBUIÇÃO DINÂMICA DO WHATSAPP              //
    // ============================================ //
    const whatsappLinks = {
        financeiro: "https://wa.me/5566996389810?text=Ol%C3%A1%2C%20gostaria%20de%20enviar%20meu%20curr%C3%ADculo.",
        comercial: "https://wa.me/5566992158275?text=Vim%20pelo%20site%20e%20gostaria%20de%20um%20or%C3%A7amento!"
    };

    function setWhatsappLinks() {
        const comercialLinks = document.querySelectorAll('.zap-comercial');
        comercialLinks.forEach(link => {
            link.href = whatsappLinks.comercial;
        });

        const financeiroLinks = document.querySelectorAll('.zap-financeiro');
        financeiroLinks.forEach(link => {
            link.href = whatsappLinks.financeiro;
        });
    }

    setWhatsappLinks();

    // ============================================ //
    // LÓGICA DO EFEITO DE PARALAXE                 //
    // ============================================ //
    // Seleciona todas as seções com a classe 'parallax-section'
    const parallaxSections = document.querySelectorAll('.parallax-section');

    // Função para atualizar a posição do background no scroll
    function handleParallax() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        parallaxSections.forEach(section => {
            // A velocidade do efeito. Valores menores criam um efeito mais sutil.
            const speed = 0.4;
            // Calcula o deslocamento do background.
            // O 'offsetTop' pega a distância da seção até o topo do documento.
            // Subtraindo o 'scrollTop' sabemos o quão "dentro" da viewport a seção está.
            const yPos = (scrollTop - section.offsetTop) * speed;
            
            // Aplica a nova posição do background verticalmente.
            // A posição horizontal permanece '50%' (centro).
            section.style.backgroundPosition = `50% ${yPos}px`;
        });
    }

    // Adiciona o listener de scroll para ativar o paralaxe
    // Otimização: A função só será chamada quando a animação do navegador estiver pronta
    window.addEventListener('scroll', () => {
        window.requestAnimationFrame(handleParallax);
    });

    // Chama a função uma vez no carregamento para definir a posição inicial
    handleParallax();


    // ============================================ //
    // INICIALIZAÇÃO DO CARROSSEL (SWIPER.JS)       //
    // ============================================ //
    const swiper = new Swiper('.swiper', {
        // Quantidade de slides visíveis
        slidesPerView: 1,
        // Espaçamento entre os slides
        spaceBetween: 20,
        
        // Ativa o loop para um carrossel infinito
        loop: false,

        // Paginação (os "pontos" abaixo do carrossel)
        pagination: {
            el: '.swiper-pagination',
            clickable: true, // Permite clicar nos pontos para navegar
        },

        // Botões de navegação (setas de "próximo" e "anterior")
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },

        // Configurações de responsividade
        breakpoints: {
            // Quando a largura da tela for >= 640px
            640: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            // Quando a largura da tela for >= 1024px
            1024: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
        },

        // Permite arrastar com o mouse no desktop
        grabCursor: true,
    });

    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const accordionContent = this.nextElementSibling;
            const currentlyActive = document.querySelector('.accordion-header.active');
            const isExpanded = this.classList.contains('active');

            // Fecha qualquer outro acordeão que esteja aberto
            if (currentlyActive && currentlyActive !== this) {
                currentlyActive.classList.remove('active');
                currentlyActive.setAttribute('aria-expanded', 'false');
                currentlyActive.nextElementSibling.classList.remove('show');
            }

            // Alterna a classe 'active' no header
            this.classList.toggle('active');
            this.setAttribute('aria-expanded', !isExpanded);
            accordionContent.classList.toggle('show');
        });
    });
});