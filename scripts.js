document.addEventListener('DOMContentLoaded', function() {

    // ============================================ //
    // ANIMAÇÃO DA SPLASH SCREEN & FLIP LOGO        //
    // ============================================ //
    function initSplashScreen() {
        const splashScreen = document.getElementById('splash-screen');
        const splashLogo = document.getElementById('splash-logo');
        const targetLogo = document.getElementById('target-logo');
        const heroVideo = document.getElementById('waterDropVideo');

        if (!splashScreen || !splashLogo || !targetLogo) return;

        let isDismissed = false;

        function dismissSplash() {
            if (isDismissed) return;
            isDismissed = true;

            // Libera o scroll da página imediatamente
            document.body.classList.remove('splash-active');

            const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            if (prefersReducedMotion) {
                splashScreen.classList.add('splash-hidden');
                setTimeout(() => { splashScreen.style.display = 'none'; }, 800);
                return;
            }

            // FLIP Animation:
            // Obter posições atuais do splashLogo (centro) e targetLogo (cabeçalho)
            const splashRect = splashLogo.getBoundingClientRect();
            const targetRect = targetLogo.getBoundingClientRect();

            if (!splashRect || !targetRect || splashRect.width === 0 || targetRect.width === 0) {
                splashScreen.classList.add('splash-hidden');
                setTimeout(() => { splashScreen.style.display = 'none'; }, 800);
                return;
            }

            const deltaX = targetRect.left - splashRect.left;
            const deltaY = targetRect.top - splashRect.top;
            const scale = targetRect.width / splashRect.width;

            // FASE 1: Desliza o logo da splash do centro para a posição de descanso (0.6s)
            splashLogo.classList.add('animating');
            splashLogo.style.transform = `translate(-50%, -50%) translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scale})`;

            // FASE 2: Quando o logo se acomoda no cabeçalho (480ms), dispara a propagação de Ondas de Água Concêntricas!
            setTimeout(() => {
                const logoRect = splashLogo.getBoundingClientRect();
                const splashX = logoRect.left + logoRect.width / 2;
                const splashY = logoRect.top + logoRect.height / 2;

                splashScreen.style.setProperty('--splash-x', splashX + 'px');
                splashScreen.style.setProperty('--splash-y', splashY + 'px');
                splashScreen.style.setProperty('--splash-radius', '0%');
                splashScreen.classList.add('splash-wave');

                const wavesContainer = document.getElementById('water-waves-container');
                if (wavesContainer) {
                    const waves = wavesContainer.querySelectorAll('.water-wave');
                    waves.forEach(w => {
                        w.style.left = splashX + 'px';
                        w.style.top = splashY + 'px';
                    });
                    wavesContainer.classList.add('active');
                }

                // Animação rAF de propagação líquida de gota d'água (3.2s de expansão fluida até sair da visão)
                const splashDuration = 3200; // ms
                const splashStartTime = performance.now();
                const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

                if (isTouchDevice) {
                    setTimeout(() => {
                        splashScreen.classList.add('splash-hidden');
                    }, 1200);
                }

                function animateSplash(currentTime) {
                    const elapsed = currentTime - splashStartTime;
                    const progress = Math.min(1, elapsed / splashDuration);
                    
                    // Curva fluida de dispersão de água na superfície (easeOutCubic)
                    const easeProgress = 1 - Math.pow(1 - progress, 3);
                    const currentRadius = easeProgress * 190;

                    splashScreen.style.setProperty('--splash-radius', currentRadius + '%');

                    if (progress < 1) {
                        requestAnimationFrame(animateSplash);
                    } else {
                        splashScreen.classList.add('splash-hidden');
                        setTimeout(() => {
                            document.body.classList.remove('splash-active');
                            splashScreen.style.display = 'none';
                        }, 200);
                    }
                }

                requestAnimationFrame(animateSplash);
            }, 480);
        }

        const MIN_DISPLAY_TIME = 600;
        const startTime = Date.now();
        const MAX_SAFETY_TIMEOUT = 2500;

        function scheduleDismiss() {
            clearTimeout(safetyTimer);
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);
            setTimeout(() => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(dismissSplash);
                });
            }, remaining);
        }

        const safetyTimer = setTimeout(scheduleDismiss, MAX_SAFETY_TIMEOUT);

        function checkReadyAndDismiss() {
            if (!heroVideo || heroVideo.readyState >= 2) {
                scheduleDismiss();
            } else {
                heroVideo.addEventListener('loadeddata', function onLoadedData() {
                    heroVideo.removeEventListener('loadeddata', onLoadedData);
                    scheduleDismiss();
                }, { once: true });
            }
        }

        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            checkReadyAndDismiss();
        }
        window.addEventListener('load', checkReadyAndDismiss, { once: true });
    }

    initSplashScreen();

    // ============================================ //
    // SIMULAÇÃO DE LIMPEZA DE VIDRO INTERATIVA     //
    // ============================================ //
    const heroVideo = document.getElementById('waterDropVideo');
    if (heroVideo) {
        initGlassWipe(heroVideo);
    }



    // ============================================ //
    // LÓGICA DO EFEITO DE PARALAXE                 //
    // ============================================ //
    // Seleciona todas as seções com a classe 'parallax-section'
    const parallaxSections = document.querySelectorAll('.parallax-section');
    let parallaxTicking = false;

    // Função para atualizar a posição do background no scroll
    function handleParallax() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        parallaxSections.forEach(section => {
            const speed = 0.4;
            const yPos = (scrollTop - section.offsetTop) * speed;
            section.style.backgroundPosition = `50% ${yPos}px`;
        });
        parallaxTicking = false;
    }

    // Adiciona o listener de scroll com rAF throttling e listener passivo
    window.addEventListener('scroll', () => {
        if (!parallaxTicking) {
            window.requestAnimationFrame(handleParallax);
            parallaxTicking = true;
        }
    }, { passive: true });

    // Chama a função uma vez no carregamento para definir a posição inicial
    handleParallax();


    // ============================================ //
    // INICIALIZAÇÃO DO CARROSSEL DE PISCINAS       //
    // ============================================ //
    const poolSwiperEl = document.querySelector('.pool-swiper');
    if (poolSwiperEl && typeof Swiper !== 'undefined') {
        const swiper = new Swiper(poolSwiperEl, {
            // Quantidade de slides visíveis
            slidesPerView: 1,
            // Espaçamento entre os slides
            spaceBetween: 20,
            
            // Ativa o loop para um carrossel infinito
            loop: false,

            // Acessibilidade ARIA automática
            a11y: {
                enabled: true,
                prevSlideMessage: 'Slide anterior',
                nextSlideMessage: 'Próximo slide',
                firstSlideMessage: 'Primeiro slide',
                lastSlideMessage: 'Último slide',
                paginationBulletMessage: 'Ir para o slide {{index}}',
            },

            // Paginação (os "pontos" abaixo do carrossel)
            pagination: {
                el: poolSwiperEl.querySelector('.swiper-pagination'),
                clickable: true, // Permite clicar nos pontos para navegar
            },

            // Botões de navegação (setas de "próximo" e "anterior")
            navigation: {
                nextEl: poolSwiperEl.querySelector('.swiper-button-next'),
                prevEl: poolSwiperEl.querySelector('.swiper-button-prev'),
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
    } else if (typeof Swiper === 'undefined') {
        console.warn("Swiper library not loaded. Skipping swiper initialization.");
    }

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

    // ============================================ //
    // SIMULAÇÃO DE LIMPEZA DE VIDRO INTERATIVA     //
    // ============================================ //
    function initGlassWipe(video) {
        const section1 = document.getElementById('section1');
        if (!section1) return;

        const canvas = document.createElement('canvas');
        const isCanvasSupported = !!(canvas.getContext && canvas.getContext('2d'));
        if (!isCanvasSupported) return;

        canvas.id = 'glassWipeCanvas';
        // Insere o canvas logo após o vídeo para manter a hierarquia de camadas (z-index)
        video.parentNode.insertBefore(canvas, video.nextSibling);

        // Oculta o vídeo visualmente mas o mantém rodando para renderização
        video.style.position = 'absolute';
        video.style.width = '1px';
        video.style.height = '1px';
        video.style.opacity = '0.01';
        video.style.pointerEvents = 'none';

        // Tenta reproduzir o vídeo. Caso falhe, limpa o canvas e reverte para o fundo estático.
        video.play().catch(error => {
            console.warn("Autoplay do vídeo de gotas de água foi impedido pelo navegador ou falhou. Revertendo para o fundo estático.", error);
            canvas.remove();
            video.style.display = 'none';
        });

        const ctx = canvas.getContext('2d');
        const maskCanvas = document.createElement('canvas');
        const maskCtx = maskCanvas.getContext('2d');

        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;
        const wipeRadius = 45; // Tamanho macio do rastro
        let isCleaned = false;
        let isFadingOut = false;
        let resetTimeout = null;
        let animationId = null;

        // Otimização: Cache do offset da seção em relação ao documento para evitar reflows (getBoundingClientRect) no drag/scroll
        let sectionPageX = 0;
        let sectionPageY = 0;

        function updateSectionOffset() {
            const rect = section1.getBoundingClientRect();
            sectionPageX = rect.left + (window.pageXOffset || document.documentElement.scrollLeft);
            sectionPageY = rect.top + (window.pageYOffset || document.documentElement.scrollTop);
        }

        function resizeCanvas() {
            const rect = section1.getBoundingClientRect();
            const w = Math.ceil(rect.width);
            const h = Math.ceil(rect.height);

            updateSectionOffset();

            if (canvas.width !== w || canvas.height !== h) {
                let tempCanvas = null;
                if (maskCanvas.width > 0 && maskCanvas.height > 0) {
                    tempCanvas = document.createElement('canvas');
                    tempCanvas.width = maskCanvas.width;
                    tempCanvas.height = maskCanvas.height;
                    tempCanvas.getContext('2d').drawImage(maskCanvas, 0, 0);
                }

                canvas.width = w;
                canvas.height = h;
                maskCanvas.width = w;
                maskCanvas.height = h;

                // Desativa o filtro temporariamente para redesenhar sem duplicar desfoque
                if (typeof maskCtx.filter !== 'undefined') {
                    maskCtx.filter = 'none';
                }

                if (tempCanvas) {
                    maskCtx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, w, h);
                } else {
                    maskCtx.clearRect(0, 0, w, h);
                }

                // Define o filtro de desfoque suave para os novos traçados
                if (typeof maskCtx.filter !== 'undefined') {
                    maskCtx.filter = 'blur(15px)';
                }
            }
        }

        // Executa o redimensionamento e atualização de offsets inicial
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('scroll', updateSectionOffset);

        function drawImageCover(ctx, img, w, h) {
            const imgW = img.videoWidth || img.width;
            const imgH = img.videoHeight || img.height;
            if (!imgW || !imgH) return;

            const imgRatio = imgW / imgH;
            const canvasRatio = w / h;

            let sx, sy, sWidth, sHeight;

            if (canvasRatio > imgRatio) {
                sWidth = imgW;
                sHeight = imgW / canvasRatio;
                sx = 0;
                sy = (imgH - sHeight) / 2;
            } else {
                sHeight = imgH;
                sWidth = imgH * canvasRatio;
                sx = (imgW - sWidth) / 2;
                sy = 0;
            }

            ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, w, h);
        }

        let lastFrameTime = null;

        function drawFrame(timestamp) {
            if (isCleaned) {
                animationId = null;
                lastFrameTime = null;
                return;
            }

            // Desvanece a máscara do vidro para a água retornar após 5 segundos
            if (timestamp !== undefined) {
                if (lastFrameTime !== null) {
                    const dt = (timestamp - lastFrameTime) / 1000;
                    const cappedDt = Math.min(dt, 0.1);
                    if (cappedDt > 0) {
                        const k = 0.6; // Taxa de decaimento para desvanecer em 5 segundos (~5% de opacidade restante)
                        const alpha = 1 - Math.exp(-k * cappedDt);
                        
                        const prevFilter = maskCtx.filter;
                        const prevGCO = maskCtx.globalCompositeOperation;
                        
                        maskCtx.filter = 'none';
                        maskCtx.globalCompositeOperation = 'destination-out';
                        maskCtx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
                        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
                        
                        maskCtx.filter = prevFilter;
                        maskCtx.globalCompositeOperation = prevGCO;
                    }
                }
                lastFrameTime = timestamp;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Renderiza o vídeo em modo "cover" no Canvas
            drawImageCover(ctx, video, canvas.width, canvas.height);

            // Combina a máscara para recortar as gotas
            ctx.globalCompositeOperation = 'destination-out';
            ctx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'source-over';

            animationId = requestAnimationFrame(drawFrame);
        }

        // Inicia o render loop
        animationId = requestAnimationFrame(drawFrame);

        function getCoordinates(e) {
            let clientX, clientY;
            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            const pageX = clientX + (window.pageXOffset || document.documentElement.scrollLeft);
            const pageY = clientY + (window.pageYOffset || document.documentElement.scrollTop);

            return {
                x: pageX - sectionPageX,
                y: pageY - sectionPageY
            };
        }

        function drawWipeSpot(x, y) {
            maskCtx.beginPath();
            maskCtx.arc(x, y, wipeRadius, 0, Math.PI * 2);
            maskCtx.fillStyle = 'black';
            maskCtx.fill();
        }

        function startWipe(e) {
            if (isCleaned || isFadingOut) return;

            isDrawing = true;
            updateSectionOffset();
            const pos = getCoordinates(e);
            lastX = pos.x;
            lastY = pos.y;

            drawWipeSpot(pos.x, pos.y);
            postponeReset();
        }

        function moveWipe(e) {
            if (isCleaned || isFadingOut) return;
            postponeReset();

            if (!isDrawing) {
                // Se for um evento de mouse (não touch), inicia o desenho automaticamente ao mover
                if (!e.type.startsWith('touch')) {
                    startWipe(e);
                }
                return;
            }

            const pos = getCoordinates(e);

            maskCtx.beginPath();
            maskCtx.moveTo(lastX, lastY);
            maskCtx.lineTo(pos.x, pos.y);
            maskCtx.lineWidth = wipeRadius * 2;
            maskCtx.lineCap = 'round';
            maskCtx.lineJoin = 'round';
            maskCtx.strokeStyle = 'black';
            maskCtx.stroke();

            lastX = pos.x;
            lastY = pos.y;
        }

        function endWipe() {
            if (!isDrawing) return;
            isDrawing = false;
            checkProgress();
        }

        function postponeReset() {
            if (resetTimeout) {
                clearTimeout(resetTimeout);
                resetTimeout = null;
            }
            if (isCleaned) {
                // Reinicia a chuva de gotas após 5 segundos de inatividade se estiver limpo
                resetTimeout = setTimeout(resetWipeEffect, 5000);
            }
        }

        function checkProgress() {
            const w = maskCanvas.width;
            const h = maskCanvas.height;
            if (w === 0 || h === 0) return;

            try {
                const imgData = maskCtx.getImageData(0, 0, w, h);
                const data = imgData.data;
                let wipedCount = 0;
                let totalCount = 0;

                const step = 15; // Amostragem otimizada para evitar lentidão
                for (let y = 0; y < h; y += step) {
                    for (let x = 0; x < w; x += step) {
                        const idx = ((y * w) + x) * 4;
                        if (data[idx + 3] > 50) {
                            wipedCount++;
                        }
                        totalCount++;
                    }
                }

                const percent = (wipedCount / totalCount) * 100;
                if (percent > 85) {
                    triggerCleanFadeOut();
                }
            } catch (err) {
                console.error("Erro ao calcular porcentagem limpa", err);
            }
        }

        function triggerCleanFadeOut() {
            isFadingOut = true;
            canvas.classList.add('clean');

            setTimeout(() => {
                isCleaned = true;
                isFadingOut = false;
                postponeReset();
            }, 1500);
        }

        function resetWipeEffect() {
            if (!isCleaned) return;

            // Limpa a máscara do vidro
            maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

            // Reativa a animação se estava parada
            if (!animationId) {
                lastFrameTime = null;
                animationId = requestAnimationFrame(drawFrame);
            }

            // Remove o fade out
            canvas.classList.remove('clean');
            isCleaned = false;
            isFadingOut = false;

            if (resetTimeout) {
                clearTimeout(resetTimeout);
                resetTimeout = null;
            }
        }

        // Eventos para Computadores
        section1.addEventListener('mousedown', startWipe);
        section1.addEventListener('mousemove', moveWipe);
        section1.addEventListener('mouseleave', endWipe);

        // Eventos para Celulares (Scroll liberado por passive: true)
        section1.addEventListener('touchstart', startWipe, { passive: true });
        section1.addEventListener('touchmove', moveWipe, { passive: true });
        window.addEventListener('touchend', endWipe);

        // Ouvintes extras para adiar o reset
        section1.addEventListener('mousemove', postponeReset);
        section1.addEventListener('touchmove', postponeReset, { passive: true });

        // Otimização de Performance: IntersectionObserver com margem de segurança de 300px
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (!isCleaned && !animationId) {
                            lastFrameTime = null;
                            animationId = requestAnimationFrame(drawFrame);
                        }
                        if (heroVideo.paused && !isCleaned) {
                            heroVideo.play().catch(() => {});
                        }
                    } else {
                        if (animationId) {
                            cancelAnimationFrame(animationId);
                            animationId = null;
                        }
                        if (!heroVideo.paused) {
                            heroVideo.pause();
                        }
                    }
                });
            }, {
                rootMargin: '300px 0px'
            });

            observer.observe(section1);
        }
    }

    // =========================================================================
    // 🌟 CONFIGURAÇÃO DE PRODUTOS PROMOVIDOS / ORDEM DE EXIBIÇÃO NO CATÁLOGO
    // -------------------------------------------------------------------------
    // Para definir quais produtos aparecem primeiro na aba "Todos" (ou categorias),
    // basta ordenar os identificadores (IDs ou títulos) na lista abaixo.
    // O sistema faz a correspondência automática e posiciona os itens no topo.
    // =========================================================================
    const PROMOTED_PRODUCTS_CONFIG = [
        'clorador',       // 1º Clorador
        'aspirador-splash', // 2º Aspirador
        'capa-termica',   // 3º Capa Térmica
        'catador'         // 4º Catador
    ];

    // ============================================ //
    // SEÇÃO CATÁLOGO DE PRODUTOS (SWIPER 2 LINHAS) //
    // ============================================ //
    const productsSection = document.getElementById('section-outros-produtos');
    const mosaicGrid = document.getElementById('products-mosaic-grid');
    const categoryFilters = document.getElementById('products-category-filters');
    const productModal = document.getElementById('product-detail-modal');
    const modalBackdrop = document.getElementById('product-modal-backdrop');
    const modalCloseBtn = document.getElementById('product-modal-close');

    // Elementos do Modal
    const modalImage = document.getElementById('modal-product-image');
    const modalTitle = document.getElementById('modal-product-title');
    const modalCategory = document.getElementById('modal-product-category');
    const modalDescription = document.getElementById('modal-product-description');
    const modalZapBtn = document.getElementById('modal-product-zap-btn');

    let allProductsData = [];
    let productsSwiperInstance = null;

    // Gerador Dinâmico de Link WhatsApp para cada produto específico (100% centralizado)
    function getProductWhatsappUrl(productTitle) {
        if (window.COMPANY_CONFIG && typeof window.COMPANY_CONFIG.getProductWhatsappUrl === 'function') {
            return window.COMPANY_CONFIG.getProductWhatsappUrl(productTitle);
        }
        return '#';
    }

    // Normaliza strings removendo acentos e espaços extras
    function normalizeText(str) {
        return (str || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    // Calcula a prioridade do produto com base no array de configuração e no flag is_destaque
    function getProductPriority(product) {
        const id = (product.id || '').toLowerCase().trim();
        const titleNorm = normalizeText(product.title);

        for (let i = 0; i < PROMOTED_PRODUCTS_CONFIG.length; i++) {
            const target = PROMOTED_PRODUCTS_CONFIG[i].toLowerCase().trim();
            const targetNorm = normalizeText(target);

            // Casamento por ID exato, título normalizado, prefixo de ID ou termo no título
            if (id === target || titleNorm === targetNorm || id.startsWith(target + '-') || id.endsWith('-' + target)) {
                return i;
            }
            if (titleNorm.startsWith(targetNorm) || titleNorm.includes(targetNorm)) {
                return i;
            }
            if (target === 'clorador' && (id === 'clorador' || id.includes('clorador'))) return i;
            if (target === 'aspirador-splash' && (id === 'aspirador-splash' || titleNorm === 'aspirador')) return i;
            if (target === 'capa-termica' && (id === 'capa-termica' || titleNorm.includes('capa termica'))) return i;
            if (target === 'catador' && (id === 'catador' || titleNorm.includes('catador'))) return i;
        }

        // Outros produtos marcados como destaque
        if (product.is_destaque) {
            return 100;
        }

        return 9999;
    }

    // Renderiza o HTML de um card individual de produto com link direto para o WhatsApp
    function renderProductCardHtml(product) {
        const isHighlight = product.is_destaque || (product.categories && product.categories.includes('Destaques'));
        const defaultImg = 'https://cdn.splashpiscinas.com/assets/img/acessorios/thermas-mini-01.webp';
        const imgSrc = product.image || defaultImg;
        const nonDestaqueCat = (product.categories || []).find(c => c !== 'Destaques');
        const primaryCat = nonDestaqueCat || 'Splash';
        const zapUrl = getProductWhatsappUrl(product.title);

        return `
            <a href="${zapUrl}" target="_blank" rel="noopener noreferrer" class="product-card" data-id="${product.id}" aria-label="Ver detalhes de ${product.title} no WhatsApp">
                <div class="product-card-img-wrapper">
                    <img class="product-card-img" src="${imgSrc}" alt="${product.title}" width="300" height="300" loading="lazy" decoding="async">
                    ${isHighlight ? `<span class="product-badge-tag"><i class="fa fa-star"></i> Destaque</span>` : ''}
                </div>
                <div class="product-card-body">
                    <div>
                        <span class="product-card-cat">${primaryCat}</span>
                        <h3 class="product-card-title">${product.title}</h3>
                    </div>
                    <div class="product-card-footer">
                        <span class="product-card-cta">Ver detalhes <i class="fa fa-arrow-right"></i></span>
                        <span class="product-card-zap-btn" title="Conversar no WhatsApp" aria-hidden="true">
                            <i class="fab fa-whatsapp"></i>
                        </span>
                    </div>
                </div>
            </a>
        `;
    }

    // =========================================================================
    // CARREGAMENTO INTELIGENTE DO CATÁLOGO SOB DEMANDA (500px DO VIEWPORT)
    // -------------------------------------------------------------------------
    let hasRequestedProducts = false;
    let pendingCategoryToRender = 'all';

    function loadProductsCatalog(category = 'all') {
        pendingCategoryToRender = category;

        if (hasRequestedProducts) {
            if (allProductsData.length > 0) {
                renderProductsGrid(category);
            }
            return;
        }
        hasRequestedProducts = true;

        if (mosaicGrid) {
            fetch('products.json')
                .then(res => res.json())
                .then(products => {
                    allProductsData = products;
                    renderProductsGrid(pendingCategoryToRender);
                })
                .catch(err => {
                    console.warn('Erro ao carregar products.json:', err);
                    if (mosaicGrid) {
                        mosaicGrid.innerHTML = `
                            <div class="products-empty-state">
                                <p>Não foi possível carregar os produtos no momento. Por favor, tente novamente mais tarde.</p>
                            </div>
                        `;
                    }
                });
        }
    }

    // Observador de Interseção: Dispara quando a seção estiver a 500px da tela
    if (productsSection) {
        if ('IntersectionObserver' in window) {
            const productsObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        loadProductsCatalog(pendingCategoryToRender);
                        observer.unobserve(productsSection);
                    }
                });
            }, {
                rootMargin: '500px 0px' // Inicia o download e renderização a 500px de entrar na tela
            });

            productsObserver.observe(productsSection);
        } else {
            // Fallback imediato para navegadores muito antigos
            loadProductsCatalog('all');
        }
    }

    function renderProductsGrid(filterCategory) {
        if (!mosaicGrid) return;

        let filtered = allProductsData;
        if (filterCategory === 'Destaques') {
            filtered = allProductsData.filter(p => p.is_destaque || (p.categories && p.categories.includes('Destaques')));
        } else if (filterCategory !== 'all') {
            filtered = allProductsData.filter(p => 
                p.categories && p.categories.includes(filterCategory)
            );
        }

        if (filtered.length === 0) {
            if (productsSwiperInstance) {
                productsSwiperInstance.destroy(true, true);
                productsSwiperInstance = null;
            }
            mosaicGrid.innerHTML = `
                <div class="products-empty-state">
                    <p>Nenhum produto encontrado nesta categoria no momento.</p>
                </div>
            `;
            return;
        }

        // Ordenação Prioritária: Produtos em destaque e configurados aparecem primeiro
        const sortedProducts = [...filtered].sort((a, b) => {
            const prioA = getProductPriority(a);
            const prioB = getProductPriority(b);
            if (prioA !== prioB) {
                return prioA - prioB;
            }
            return 0;
        });

        // Agrupamento em colunas verticais de 2 produtos para o Swiper de 2 linhas
        let itemsList = sortedProducts;
        if (itemsList.length % 2 !== 0) {
            itemsList = [...sortedProducts, ...sortedProducts];
        }

        const columns = [];
        for (let i = 0; i < itemsList.length; i += 2) {
            columns.push([itemsList[i], itemsList[i + 1]]);
        }

        // Se houver poucas colunas (< 4), duplica as colunas para permitir loop contínuo perfeito
        let loopColumns = columns;
        while (loopColumns.length < 5) {
            loopColumns = [...loopColumns, ...columns];
        }

        mosaicGrid.innerHTML = loopColumns.map(col => `
            <div class="swiper-slide product-column-slide">
                ${renderProductCardHtml(col[0])}
                ${col[1] ? renderProductCardHtml(col[1]) : ''}
            </div>
        `).join('');

        // Inicializar ou Atualizar o Swiper de Produtos com Loop Infinito Real
        if (productsSwiperInstance) {
            productsSwiperInstance.destroy(true, true);
            productsSwiperInstance = null;
        }

        if (typeof Swiper !== 'undefined') {
            productsSwiperInstance = new Swiper('.products-swiper', {
                slidesPerView: 'auto',
                centeredSlides: false,
                spaceBetween: 18,
                loop: true,
                loopAdditionalSlides: 6,
                loopPreventsSliding: false,
                touchEventsTarget: 'container',
                simulateTouch: true,
                touchRatio: 1,
                touchAngle: 45,
                grabCursor: true,
                allowTouchMove: true,
                speed: 400,
                watchSlidesProgress: true,
                a11y: {
                    enabled: true,
                    prevSlideMessage: 'Produtos anteriores',
                    nextSlideMessage: 'Próximos produtos',
                },
                navigation: {
                    nextEl: '#products-nav-next',
                    prevEl: '#products-nav-prev',
                    disabledClass: 'products-nav-disabled-none',
                },
                breakpoints: {
                    320: {
                        slidesPerView: 'auto',
                        centeredSlides: true,
                        spaceBetween: 12,
                    },
                    641: {
                        slidesPerView: 'auto',
                        centeredSlides: false,
                        spaceBetween: 16,
                    },
                    993: {
                        slidesPerView: 'auto',
                        centeredSlides: false,
                        spaceBetween: 18,
                    }
                }
            });
        }
    }

    // Filtragem por Categorias com transição suave
    if (categoryFilters) {
        const filterBtns = categoryFilters.querySelectorAll('.category-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.classList.contains('active')) return;
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const cat = this.getAttribute('data-category');

                if (allProductsData.length === 0) {
                    loadProductsCatalog(cat);
                    return;
                }

                if (mosaicGrid) {
                    mosaicGrid.style.opacity = '0';
                    mosaicGrid.style.transform = 'translateY(8px)';
                    setTimeout(() => {
                        renderProductsGrid(cat);
                        mosaicGrid.style.opacity = '1';
                        mosaicGrid.style.transform = 'translateY(0)';
                    }, 140);
                } else {
                    renderProductsGrid(cat);
                }
            });
        });
    }

    // Abertura do Modal de Detalhes do Produto
    function openProductModal(product) {
        if (!productModal) return;

        const zapUrl = getProductWhatsappUrl(product.title);
        const categoryLabel = (product.categories && product.categories.length > 0) ? product.categories.join(' • ') : 'Acessórios Splash';

        if (modalImage) {
            modalImage.src = product.image || 'https://cdn.splashpiscinas.com/assets/img/acessorios/thermas-mini-01.webp';
            modalImage.alt = product.title;
            modalImage.width = 400;
            modalImage.height = 400;
        }

        if (modalTitle) modalTitle.textContent = product.title;
        if (modalCategory) modalCategory.textContent = categoryLabel;

        if (modalZapBtn) {
            modalZapBtn.href = zapUrl;
        }

        productModal.removeAttribute('inert');
        productModal.classList.add('open');
        productModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeProductModal() {
        if (!productModal) return;
        productModal.classList.remove('open');
        productModal.setAttribute('aria-hidden', 'true');
        productModal.setAttribute('inert', '');
        document.body.style.overflow = '';
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProductModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeProductModal);

    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && productModal && productModal.classList.contains('open')) {
            closeProductModal();
        }
    });

    // ============================================
    // CONTROLE DO BANNER DE COOKIES (LGPD & CONSENT MODE V2)
    // ============================================
    const cookieBanner = document.getElementById('cookie-banner');
    const cookieAcceptBtn = document.getElementById('cookie-accept-btn');
    const cookieDeclineBtn = document.getElementById('cookie-decline-btn');
    const cookieSettingsBtn = document.getElementById('cookie-settings-btn');

    function updateConsentState(isAccepted) {
        const consentValue = isAccepted ? 'accepted' : 'declined';
        try {
            localStorage.setItem('splash_cookie_consent', consentValue);
        } catch (e) {}

        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'analytics_storage': isAccepted ? 'granted' : 'denied',
                'ad_storage': isAccepted ? 'granted' : 'denied',
                'ad_user_data': isAccepted ? 'granted' : 'denied',
                'ad_personalization': isAccepted ? 'granted' : 'denied'
            });
        }
    }

    if (cookieBanner) {
        let consent = null;
        try {
            consent = localStorage.getItem('splash_cookie_consent');
        } catch (e) {}

        if (!consent) {
            // Exibe com fade-in suave após 2.5s (após a transição da splash screen)
            setTimeout(() => {
                cookieBanner.removeAttribute('inert');
                cookieBanner.classList.add('show');
                cookieBanner.setAttribute('aria-hidden', 'false');
            }, 2500);
        }

        if (cookieAcceptBtn) {
            cookieAcceptBtn.addEventListener('click', function() {
                updateConsentState(true);
                cookieBanner.classList.remove('show');
                cookieBanner.setAttribute('aria-hidden', 'true');
                cookieBanner.setAttribute('inert', '');
            });
        }

        if (cookieDeclineBtn) {
            cookieDeclineBtn.addEventListener('click', function() {
                updateConsentState(false);
                cookieBanner.classList.remove('show');
                cookieBanner.setAttribute('aria-hidden', 'true');
                cookieBanner.setAttribute('inert', '');
            });
        }
    }

    // Abertura das configurações de cookies sob demanda pelo usuário
    if (cookieSettingsBtn && cookieBanner) {
        cookieSettingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            cookieBanner.removeAttribute('inert');
            cookieBanner.classList.add('show');
            cookieBanner.setAttribute('aria-hidden', 'false');
        });
    }

    // ============================================
    // LAZY LOADING RIGOROSO DO GOOGLE MAPS (500px)
    // ============================================
    const mapIframe = document.getElementById('google-map-iframe');
    if (mapIframe) {
        function loadMap() {
            const dataSrc = mapIframe.getAttribute('data-src');
            if (dataSrc && !mapIframe.src) {
                mapIframe.src = dataSrc;
                mapIframe.removeAttribute('data-src');
            }
        }

        if ('IntersectionObserver' in window) {
            const mapObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        loadMap();
                        observer.unobserve(mapIframe);
                    }
                });
            }, {
                rootMargin: '500px 0px' // Dispara quando a seção estiver a 500px da tela
            });

            mapObserver.observe(mapIframe);
        } else {
            // Fallback imediato para navegadores antigos
            loadMap();
        }
    }
});