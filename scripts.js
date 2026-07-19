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
    // ATRIBUIÇÃO DINÂMICA DO WHATSAPP              //
    // ============================================ //
    const whatsappLinks = {
        financeiro: "https://wa.me/5519989064820?text=Ol%C3%A1%2C%20gostaria%20de%20enviar%20meu%20curr%C3%ADculo.",
        comercial: "https://wa.me/5519989064820?text=Vim%20pelo%20site%20e%20gostaria%20de%20um%20or%C3%A7amento%21"
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
    // INICIALIZAÇÃO DO CARROSSEL (SWIPER.JS)       //
    // ============================================ //
    if (typeof Swiper !== 'undefined') {
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
    } else {
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

    // ============================================ //
    // SEÇÃO MOSAICO DINÂMICO DE PRODUTOS & ÁGUA    //
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

    // ============================================ //
    // MOTOR 1: REFRAÇÃO REALÍSTICA DE ÁGUA (LIQUID CANVAS) //
    // ============================================ //
    const WaterRippleEngine = (function() {
        const canvas = document.getElementById('products-water-canvas');
        if (!canvas || !productsSection) return null;

        const ctx = canvas.getContext('2d');
        const simW = 160;
        let simH = 90;
        let size = simW * simH;

        let buffer1 = new Float32Array(size);
        let buffer2 = new Float32Array(size);

        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d');
        let imgData = null;

        // Carrega a textura fundo-piscina.png para aplicar refração física 2D real
        const bgImg = new Image();
        bgImg.src = './images/fundo-piscina.png';
        const bgCanvas = document.createElement('canvas');
        const bgCtx = bgCanvas.getContext('2d');
        let bgData = null;
        let isBgLoaded = false;

        bgImg.onload = function() {
            isBgLoaded = true;
            updateBgData();
        };

        function updateBgData() {
            if (!isBgLoaded || !simW || !simH) return;
            bgCanvas.width = simW;
            bgCanvas.height = simH;
            bgCtx.drawImage(bgImg, 0, 0, simW, simH);
            try {
                bgData = bgCtx.getImageData(0, 0, simW, simH).data;
            } catch (e) {
                console.warn('Não foi possível ler bgData para refração de água', e);
            }
        }

        let isRunning = false;
        let animId = null;

        function resize() {
            const rect = productsSection.getBoundingClientRect();
            const w = Math.ceil(rect.width);
            const h = Math.ceil(rect.height);
            if (w === 0 || h === 0) return;

            canvas.width = w;
            canvas.height = h;

            simH = Math.max(30, Math.floor(simW * (h / w)));
            size = simW * simH;

            buffer1 = new Float32Array(size);
            buffer2 = new Float32Array(size);

            offCanvas.width = simW;
            offCanvas.height = simH;
            imgData = offCtx.createImageData(simW, simH);

            updateBgData();
        }

        function disturb(px, py, radius, strength) {
            if (!canvas.width || !canvas.height) return;
            const cx = (px / canvas.width) * simW;
            const cy = (py / canvas.height) * simH;
            const r = Math.max(3.5, (radius / canvas.width) * simW);
            const rSq = r * r;

            const minX = Math.max(1, Math.floor(cx - r));
            const maxX = Math.min(simW - 1, Math.ceil(cx + r));
            const minY = Math.max(1, Math.floor(cy - r));
            const maxY = Math.min(simH - 1, Math.ceil(cy + r));

            for (let y = minY; y < maxY; y++) {
                for (let x = minX; x < maxX; x++) {
                    const dx = x - cx;
                    const dy = y - cy;
                    const dSq = dx * dx + dy * dy;
                    if (dSq < rSq) {
                        const dist = Math.sqrt(dSq);
                        // Gaussian Bell Falloff para propagação de ondas perfeitamente circulares
                        const falloff = 0.5 * (1 + Math.cos((dist / r) * Math.PI));
                        const idx = y * simW + x;
                        buffer1[idx] += strength * falloff;
                    }
                }
            }
        }

        function updateSimulation() {
            // Equação de Ondas 2D com amortecimento de líquido de piscina
            const w = simW;
            const h = simH;

            for (let y = 1; y < h - 1; y++) {
                let row = y * w;
                for (let x = 1; x < w - 1; x++) {
                    let idx = row + x;
                    buffer2[idx] = ((
                        buffer1[idx - 1] +
                        buffer1[idx + 1] +
                        buffer1[idx - w] +
                        buffer1[idx + w]
                    ) * 0.5) - buffer2[idx];

                    buffer2[idx] *= 0.96; // Amortecimento suave e cristalino da água
                }
            }

            // Troca de buffers
            const temp = buffer1;
            buffer1 = buffer2;
            buffer2 = temp;
        }

        function render() {
            if (!imgData) return;
            const data = imgData.data;
            const w = simW;
            const h = simH;

            for (let y = 1; y < h - 1; y++) {
                let row = y * w;
                for (let x = 1; x < w - 1; x++) {
                    let idx = row + x;
                    let val = buffer1[idx];

                    // Variação de normais para refração real da superfície da água
                    let dx = buffer1[idx + 1] - buffer1[idx - 1];
                    let dy = buffer1[idx + w] - buffer1[idx - w];

                    let pixelIdx = idx * 4;

                    if (bgData && isBgLoaded) {
                        // Refração Física 2D: Distorce a imagem de fundo (fundo-piscina.png) com base na inclinação da onda
                        let refX = Math.min(w - 1, Math.max(0, Math.floor(x + dx * 0.45)));
                        let refY = Math.min(h - 1, Math.max(0, Math.floor(y + dy * 0.45)));
                        let refIdx = (refY * w + refX) * 4;

                        // Brilho cáustico sutil nas cristas da onda
                        let caustic = (-dx - dy) * 1.6;

                        data[pixelIdx]     = Math.min(255, Math.max(0, bgData[refIdx] + caustic * 8));
                        data[pixelIdx + 1] = Math.min(255, Math.max(0, bgData[refIdx + 1] + caustic * 18 + Math.abs(val) * 0.08));
                        data[pixelIdx + 2] = Math.min(255, Math.max(0, bgData[refIdx + 2] + caustic * 26 + Math.abs(val) * 0.15));
                        
                        // Opacidade dinâmica cristalina: sutil e translúcido (mostra o fundo e destaca as ondas do dedo)
                        let waveEnergy = (Math.abs(dx) + Math.abs(dy)) * 22 + Math.abs(val) * 0.35 + Math.max(0, caustic) * 9;
                        data[pixelIdx + 3] = Math.min(130, Math.max(12, Math.floor(12 + waveEnergy)));
                    } else {
                        // Fallback de refração líquida translúcida
                        let specular = Math.max(0, (-dx - dy) * 0.7);
                        let intensity = Math.min(255, Math.abs(val) * 0.4 + specular * 10);

                        data[pixelIdx]     = Math.min(255, 0 + intensity * 0.2);
                        data[pixelIdx + 1] = Math.min(255, 80 + intensity * 0.4 + specular * 0.8);
                        data[pixelIdx + 2] = Math.min(255, 160 + intensity * 0.4 + specular * 1.0);
                        data[pixelIdx + 3] = Math.min(45, Math.abs(val) * 0.4 + specular * 8);
                    }
                }
            }

            offCtx.putImageData(imgData, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Desenha com interpolação bicúbica/linear do navegador
            ctx.drawImage(offCanvas, 0, 0, canvas.width, canvas.height);

            // Micro-gotas em repouso (Garoa d'água ambiente muito discreta)
            if (Math.random() < 0.01) {
                disturb(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height,
                    Math.random() * 20 + 10,
                    Math.random() * 30 + 15
                );
            }
        }

        function tick() {
            if (!isRunning) return;
            updateSimulation();
            render();
            animId = requestAnimationFrame(tick);
        }

        function start() {
            if (isRunning) return;
            isRunning = true;
            resize();
            animId = requestAnimationFrame(tick);
        }

        function stop() {
            isRunning = false;
            if (animId) {
                cancelAnimationFrame(animId);
                animId = null;
            }
        }

        resize();
        window.addEventListener('resize', resize);

        return {
            start,
            stop,
            disturb
        };
    })();

    // ============================================ //
    // MOTOR 2: FÍSICA FLUTUANTE DOS CARDS DO MOSAICO //
    // ============================================ //
    const MosaicWaterPhysics = (function() {
        let cardNodes = [];
        let cardsData = [];

        let mouseX = -9999;
        let mouseY = -9999;
        let isMouseOver = false;

        let isRunning = false;
        let animId = null;

        function updateCardPositions() {
            if (!mosaicGrid) return;
            const gridRect = mosaicGrid.getBoundingClientRect();
            cardNodes = Array.from(mosaicGrid.querySelectorAll('.product-card'));

            cardsData = cardNodes.map((el, i) => {
                const rect = el.getBoundingClientRect();
                return {
                    el: el,
                    cx: (rect.left + rect.width / 2) - gridRect.left,
                    cy: (rect.top + rect.height / 2) - gridRect.top,
                    floatPhase: i * 0.85 + Math.random() * 0.5,
                    curScale: 1.0,
                    targetScale: 1.0,
                    curX: 0,
                    curY: 0,
                    targetX: 0,
                    targetY: 0,
                    curRot: 0,
                    targetRot: 0
                };
            });
        }

        function handlePointerMove(e) {
            if (!productsSection || !mosaicGrid) return;
            const secRect = productsSection.getBoundingClientRect();
            const gridRect = mosaicGrid.getBoundingClientRect();

            let clientX, clientY;
            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            const secX = clientX - secRect.left;
            const secY = clientY - secRect.top;

            mouseX = clientX - gridRect.left;
            mouseY = clientY - gridRect.top;
            isMouseOver = true;

            // Transmite a perturbação para o motor de refração física da água no canvas
            if (WaterRippleEngine) {
                WaterRippleEngine.disturb(secX, secY, 32, 60);
            }
        }

        function handlePointerLeave() {
            isMouseOver = false;
            mouseX = -9999;
            mouseY = -9999;
        }

        function tick(timestamp) {
            if (!isRunning) return;

            const time = timestamp * 0.002;
            const swellRadius = 160;    // Raio de ampliação do card sob o mouse
            const displaceRadius = 300; // Raio de afastamento conectado dos vizinhos

            cardsData.forEach(card => {
                // 1. Movimento orgânico de flutuação em repouso
                const idleY = Math.sin(time + card.floatPhase) * 3.5;
                const idleRot = Math.cos(time * 0.7 + card.floatPhase) * 0.6;

                let targetScale = 1.0;
                let targetPushX = 0;
                let targetPushY = 0;

                // 2. Campo de Força Líquido Conectado (Expansão e Encolhimento Intensos)
                if (isMouseOver) {
                    const dx = card.cx - mouseX;
                    const dy = card.cy - mouseY;
                    const dist = Math.hypot(dx, dy);

                    if (dist < swellRadius) {
                        // Card sob o cursor -> Crescimento marcante e intenso (1.32x) e elevação flutuante (-10px)
                        const factor = 1 - (dist / swellRadius);
                        targetScale = 1.0 + (factor * 0.32); 
                        targetPushY = -10.0;
                        card.el.classList.add('is-active');
                    } else if (dist < displaceRadius) {
                        // Cards vizinhos -> Afastamento forte (26px) e encolhimento acentuado (0.85x)
                        const factor = 1 - ((dist - swellRadius) / (displaceRadius - swellRadius));
                        const pushForce = factor * 26.0; 
                        const angle = Math.atan2(dy, dx);

                        targetPushX = Math.cos(angle) * pushForce;
                        targetPushY = Math.sin(angle) * pushForce;
                        targetScale = 1.0 - (factor * 0.15); 
                        card.el.classList.remove('is-active');
                    } else {
                        // Demais cards do mosaico -> Encolhem para 0.88x para criar foco total no card ativo
                        targetScale = 0.88;
                        card.el.classList.remove('is-active');
                    }
                } else {
                    card.el.classList.remove('is-active');
                }

                // 3. Física de Lerp/Spring fluida e elástica
                card.curScale += (targetScale - card.curScale) * 0.14;
                card.curX += (targetPushX - card.curX) * 0.12;
                card.curY += (targetPushY - card.curY) * 0.12;
                card.curRot += (idleRot - card.curRot) * 0.09;

                // 4. Aplica a transformação 3D acelerada por GPU
                const totalY = card.curY + idleY;
                card.el.style.transform = `translate3d(${card.curX.toFixed(2)}px, ${totalY.toFixed(2)}px, 0px) scale(${card.curScale.toFixed(3)}) rotate(${card.curRot.toFixed(2)}deg)`;
            });

            animId = requestAnimationFrame(tick);
        }

        function start() {
            if (isRunning) return;
            isRunning = true;
            updateCardPositions();
            animId = requestAnimationFrame(tick);
        }

        function stop() {
            isRunning = false;
            if (animId) {
                cancelAnimationFrame(animId);
                animId = null;
            }
        }

        function init() {
            updateCardPositions();
        }

        // Event Listeners de Pointer/Mouse/Touch
        if (productsSection) {
            productsSection.addEventListener('mousemove', handlePointerMove, { passive: true });
            productsSection.addEventListener('mouseleave', handlePointerLeave);
            productsSection.addEventListener('touchstart', handlePointerMove, { passive: true });
            productsSection.addEventListener('touchmove', handlePointerMove, { passive: true });
            productsSection.addEventListener('touchend', handlePointerLeave);
        }

        window.addEventListener('resize', updateCardPositions);

        return {
            init,
            start,
            stop
        };
    })();

    // ============================================ //
    // OBSERVER DE PERFORMANCE (PAUSA OFF-SCREEN)   //
    // ============================================ //
    if (productsSection && 'IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (WaterRippleEngine) WaterRippleEngine.start();
                    if (MosaicWaterPhysics) MosaicWaterPhysics.start();
                } else {
                    if (WaterRippleEngine) WaterRippleEngine.stop();
                    if (MosaicWaterPhysics) MosaicWaterPhysics.stop();
                }
            });
        }, { rootMargin: '200px 0px' });

        sectionObserver.observe(productsSection);
    }

    // Gerador Dinâmico de Link WhatsApp para cada produto específico
    function getProductWhatsappUrl(productTitle) {
        const phone = "5519989064820";
        const message = `Olá! Vim pelo site e gostaria de solicitar um orçamento para o produto: ${productTitle}`;
        return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    }

    // Carregar dados de products.json
    if (mosaicGrid) {
        fetch('products.json')
            .then(res => res.json())
            .then(products => {
                allProductsData = products;
                renderMosaic('all');
            })
            .catch(err => {
                console.warn('Erro ao carregar products.json, tentando fallback:', err);
            });
    }

    function renderMosaic(filterCategory) {
        if (!mosaicGrid) return;

        let filtered = allProductsData;
        if (filterCategory === 'Destaques') {
            filtered = allProductsData.filter(p => p.is_destaque);
        } else if (filterCategory !== 'all') {
            filtered = allProductsData.filter(p => 
                p.categories && p.categories.includes(filterCategory)
            );
        }

        if (filtered.length === 0) {
            mosaicGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: rgba(255,255,255,0.7);">
                    <p>Nenhum produto encontrado nesta categoria no momento.</p>
                </div>
            `;
            return;
        }

        mosaicGrid.innerHTML = filtered.map(product => {
            const sizeClass = product.size ? `size-${product.size}` : 'size-small';
            const isHighlight = product.is_destaque;
            const defaultImg = 'https://cdn.splashpiscinas.com/assets/img/acessorios/thermas-mini-01.webp';
            const imgSrc = product.image || defaultImg;

            return `
                <div class="product-card ${sizeClass}" data-id="${product.id}" tabindex="0" role="button" aria-label="${product.title}">
                    <div class="product-card-img-wrapper">
                        <img class="product-card-img" src="${imgSrc}" alt="${product.title}" loading="lazy">
                    </div>
                    <div class="product-card-overlay"></div>
                    ${isHighlight ? `<span class="product-badge-tag highlight"><i class="fa fa-star"></i> Destaque</span>` : ''}
                    <div class="product-card-content">
                        <h3 class="product-card-title">${product.title}</h3>
                    </div>
                </div>
            `;
        }).join('');

        // Adicionar eventos de clique nos cards para abrir o modal de detalhes
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', function() {
                const prodId = this.getAttribute('data-id');
                const product = allProductsData.find(p => p.id === prodId);
                if (product) {
                    openProductModal(product);
                }
            });
            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });

        // Atualizar posições no motor de física
        if (MosaicWaterPhysics) {
            setTimeout(() => {
                MosaicWaterPhysics.init();
            }, 50);
        }
    }

    // Filtragem por Categorias com transição suave de fade
    if (categoryFilters) {
        const filterBtns = categoryFilters.querySelectorAll('.category-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.classList.contains('active')) return;
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const cat = this.getAttribute('data-category');

                if (mosaicGrid) {
                    mosaicGrid.style.opacity = '0';
                    setTimeout(() => {
                        renderMosaic(cat);
                        mosaicGrid.style.opacity = '1';
                    }, 150);
                } else {
                    renderMosaic(cat);
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
        }

        if (modalTitle) modalTitle.textContent = product.title;
        if (modalCategory) modalCategory.textContent = categoryLabel;

        if (modalZapBtn) {
            modalZapBtn.href = zapUrl;
        }

        productModal.classList.add('open');
        productModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeProductModal() {
        if (!productModal) return;
        productModal.classList.remove('open');
        productModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProductModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeProductModal);

    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && productModal && productModal.classList.contains('open')) {
            closeProductModal();
        }
    });
});