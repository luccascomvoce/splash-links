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
    // SEÇÃO MOSAICO DINÂMICO DE PRODUTOS           //
    // ============================================ //
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
    }

    // Filtragem por Categorias
    if (categoryFilters) {
        const filterBtns = categoryFilters.querySelectorAll('.category-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const cat = this.getAttribute('data-category');
                renderMosaic(cat);
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