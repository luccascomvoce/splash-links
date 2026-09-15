/**
 * =========================================================================
 * CONFIGURAÇÃO CENTRALIZADA DA EMPRESA & DADOS INSTITUCIONAIS
 * =========================================================================
 * ÚNICA FONTE DA VERDADE para dados da empresa e contatos por setor.
 * Altere aqui para atualizar automaticamente em todas as páginas:
 * - Home (index.html)
 * - Catálogo de Produtos e Modais (scripts.js)
 * - Termos de Uso (legal/termos-de-uso.html)
 * - Política de Privacidade (legal/politica-de-privacidade.html)
 * - Aviso de Cookies (legal/aviso-de-cookies.html)
 */

/**
 * Formata automaticamente qualquer número de telefone brasileiro para exibição visual
 * Aceita: "5519989064820", "19989064820", "+5519989064820" -> "(19) 98906-4820"
 * @param {string} phone 
 * @returns {string} Telefone formatado
 */
function formatPhoneNumber(phone) {
    if (!phone) return "";
    let digits = String(phone).replace(/\D/g, "");
    
    // Remove DDI brasileiro '55' caso presente
    if (digits.startsWith("55") && digits.length >= 12) {
        digits = digits.slice(2);
    }

    // Celular com DDD (11 dígitos): (19) 98906-4820
    if (digits.length === 11) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    
    // Fixo com DDD (10 dígitos): (19) 3890-4820
    if (digits.length === 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    return phone;
}

const COMPANY_CONFIG = {
    brandName: "Splash Piscinas - Hortolândia",
    legalName: "THAYFER PISCINAS LTDA",
    cnpj: "67.854.211/0001-62",
    
    address: {
        street: "Avenida Antônio Zuza Ferreira, 1704",
        neighborhood: "Parque Olívio Franceschini",
        city: "Hortolândia",
        state: "SP",
        cep: "13189-225",
        full: "Avenida Antônio Zuza Ferreira, 1704 - Parque Olívio Franceschini, Hortolândia - SP, CEP: 13189-225",
        mapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d516.2402371801564!2d-47.233296031857066!3d-22.86447765947006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94c8bdfe17e1e6cf%3A0xade93eea7fbe636e!2sSplash%20Piscinas!5e0!3m2!1spt-BR!2sbr!4v1783890389464!5m2!1spt-BR!2sbr",
        mapsPlaceUrl: "https://www.google.com/maps/place/Avenida+Ant%C3%B4nio+Zuza+Ferreira,+1704+-+Parque+Ol%C3%ADvio+Franceschini,+Hortol%C3%A2ndia+-+SP,+13189-225/"
    },

    jurisdiction: {
        city: "Hortolândia",
        state: "São Paulo",
        forum: "Foro da Comarca de Hortolândia, Estado de São Paulo"
    },

    // =========================================================================
    // NÚMEROS E CANAIS DE WHATSAPP POR DEPARTAMENTO
    // Basta definir o numberRaw que o numberFormatted e os links são gerados automaticamente!
    // =========================================================================
    whatsapp: {
        // Setor Comercial / Vendas / Catálogo de Produtos / Atendimento Geral
        comercial: {
            numberRaw: "5519989064820",
            get numberFormatted() {
                return formatPhoneNumber(this.numberRaw);
            },
            defaultMessage: "Vim pelo site e gostaria de um orçamento!"
        },

        // Setor Financeiro / RH / Envio de Currículos (Trabalhe Conosco)
        financeiro: {
            numberRaw: "5519989064820", // Altere aqui caso o financeiro utilize outro número
            get numberFormatted() {
                return formatPhoneNumber(this.numberRaw);
            },
            defaultMessage: "Olá, gostaria de enviar meu currículo."
        },

        // Atalhos de compatibilidade (retorna o canal comercial por padrão)
        get numberRaw() {
            return this.comercial.numberRaw;
        },
        get numberFormatted() {
            return this.comercial.numberFormatted;
        }
    },

    /**
     * Função utilitária de formatação de telefone
     */
    formatPhoneNumber,

    /**
     * Gera link direto do WhatsApp com mensagem customizada para um setor específico
     * @param {string} [message] Mensagem pré-definida
     * @param {'comercial'|'financeiro'} [channel='comercial'] Setor de atendimento
     * @returns {string} URL formatada do WhatsApp (wa.me)
     */
    getWhatsappUrl(message, channel = 'comercial') {
        const sector = this.whatsapp[channel] || this.whatsapp.comercial;
        const text = message !== undefined ? message : sector.defaultMessage;
        return `https://wa.me/${sector.numberRaw}?text=${encodeURIComponent(text || '')}`;
    },

    /**
     * Gera link direto do WhatsApp personalizado para um produto do catálogo (canal Comercial)
     * @param {string} productTitle 
     * @returns {string} URL formatada do WhatsApp
     */
    getProductWhatsappUrl(productTitle) {
        const message = `Olá! Vi o produto ${productTitle} no site e gostaria de saber mais detalhes.`;
        return this.getWhatsappUrl(message, 'comercial');
    },

    legal: {
        lastUpdated: "Setembro de 2026",
        lastUpdatedText: "Última atualização: Setembro de 2026"
    }
};

/**
 * Injeta automaticamente os dados configurados em elementos do DOM
 * marcados com atributos data-company ou classes correspondentes.
 */
function applyCompanyConfig() {
    if (typeof document === 'undefined') return;

    // 1. Injeção por atributo data-company
    const bindings = {
        'legalName': COMPANY_CONFIG.legalName,
        'brandName': COMPANY_CONFIG.brandName,
        'cnpj': COMPANY_CONFIG.cnpj,
        'cnpjFull': `CNPJ: ${COMPANY_CONFIG.cnpj}`,
        'addressFull': COMPANY_CONFIG.address.full,
        'addressStreet': COMPANY_CONFIG.address.street,
        'addressNeighborhood': COMPANY_CONFIG.address.neighborhood,
        'addressCityState': `${COMPANY_CONFIG.address.city} - ${COMPANY_CONFIG.address.state}`,
        'addressCep': COMPANY_CONFIG.address.cep,
        'jurisdictionForum': COMPANY_CONFIG.jurisdiction.forum,
        'legalLastUpdated': COMPANY_CONFIG.legal.lastUpdated,
        'legalLastUpdatedText': COMPANY_CONFIG.legal.lastUpdatedText,
        'phoneFormatted': COMPANY_CONFIG.whatsapp.comercial.numberFormatted,
        'phoneComercial': COMPANY_CONFIG.whatsapp.comercial.numberFormatted,
        'phoneFinanceiro': COMPANY_CONFIG.whatsapp.financeiro.numberFormatted
    };

    Object.keys(bindings).forEach(key => {
        const elements = document.querySelectorAll(`[data-company="${key}"]`);
        elements.forEach(el => {
            el.textContent = bindings[key];
        });
    });

    // 2. Atualização de classes específicas do rodapé
    const companyNameEls = document.querySelectorAll('.company-name');
    companyNameEls.forEach(el => {
        el.textContent = COMPANY_CONFIG.legalName;
    });

    const companyCnpjEls = document.querySelectorAll('.company-cnpj');
    companyCnpjEls.forEach(el => {
        el.textContent = `CNPJ: ${COMPANY_CONFIG.cnpj}`;
    });

    // 3. Atualização de links de WhatsApp por setor
    const comercialLinks = document.querySelectorAll('.zap-comercial');
    comercialLinks.forEach(link => {
        link.href = COMPANY_CONFIG.getWhatsappUrl(undefined, 'comercial');
    });

    const financeiroLinks = document.querySelectorAll('.zap-financeiro');
    financeiroLinks.forEach(link => {
        link.href = COMPANY_CONFIG.getWhatsappUrl(undefined, 'financeiro');
    });

    // 4. Sincronização do Schema.org JSON-LD (se existir na página)
    const schemaEl = document.getElementById('local-business-schema');
    if (schemaEl) {
        try {
            const schemaData = JSON.parse(schemaEl.textContent);
            schemaData.telephone = `+${COMPANY_CONFIG.whatsapp.comercial.numberRaw}`;
            if (schemaData.address) {
                schemaData.address.streetAddress = COMPANY_CONFIG.address.street;
                schemaData.address.addressLocality = COMPANY_CONFIG.address.city;
                schemaData.address.addressRegion = COMPANY_CONFIG.address.state;
                schemaData.address.postalCode = COMPANY_CONFIG.address.cep;
            }
            if (COMPANY_CONFIG.address.mapsPlaceUrl) {
                schemaData.hasMap = COMPANY_CONFIG.address.mapsPlaceUrl;
            }
            schemaEl.textContent = JSON.stringify(schemaData, null, 2);
        } catch (e) {
            // Ignora falha de parse caso schema esteja em formato customizado
        }
    }
}

// Execução segura ao carregar o DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyCompanyConfig);
} else {
    applyCompanyConfig();
}

// Exporta globalmente para compatibilidade
window.COMPANY_CONFIG = COMPANY_CONFIG;
window.applyCompanyConfig = applyCompanyConfig;
