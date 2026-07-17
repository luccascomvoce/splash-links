document.addEventListener('DOMContentLoaded', function() {

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
    }
});