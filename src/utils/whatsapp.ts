/**
 * Utilitários para validação e formatação de números WhatsApp
 */

/**
 * Valida se um número de WhatsApp está no formato correto
 * @param phone Número de telefone (apenas números)
 * @returns true se válido, false caso contrário
 */
export function validateWhatsAppNumber(phone: string): boolean {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');

    // Verifica se tem entre 10 e 15 dígitos (padrão internacional)
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        return false;
    }

    // Para números brasileiros, verifica se tem 11 ou 13 dígitos
    // 11 dígitos: DDD + 9 dígitos (celular)
    // 13 dígitos: 55 + DDD + 9 dígitos (com código do país)
    if (cleanPhone.startsWith('55')) {
        // Número com código do país (55)
        return cleanPhone.length === 13;
    } else {
        // Número sem código do país
        return cleanPhone.length === 11;
    }
}

/**
 * Formata um número de WhatsApp para o padrão brasileiro
 * @param phone Número de telefone (apenas números)
 * @returns Número formatado com código do país
 */
export function formatWhatsAppNumber(phone: string): string {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');

    // Se já tem código do país (55), retorna como está
    if (cleanPhone.startsWith('55') && cleanPhone.length === 13) {
        return cleanPhone;
    }

    // Se tem 11 dígitos (DDD + número), adiciona código do país
    if (cleanPhone.length === 11) {
        return `55${cleanPhone}`;
    }

    // Retorna como está se não conseguir formatar
    return cleanPhone;
}

/**
 * Gera a URL do WhatsApp a partir de um número
 * @param phone Número de telefone (apenas números)
 * @returns URL completa do WhatsApp (https://wa.me/numero)
 */
export function generateWhatsAppUrl(phone: string): string {
    if (!phone || phone.trim() === '') {
        return '';
    }

    const formattedNumber = formatWhatsAppNumber(phone);
    return `https://wa.me/${formattedNumber}`;
}

/**
 * Extrai o número de uma URL do WhatsApp
 * @param url URL do WhatsApp (https://wa.me/numero)
 * @returns Número extraído ou string vazia
 */
export function extractNumberFromWhatsAppUrl(url: string): string {
    if (!url || url.trim() === '') {
        return '';
    }

    // Regex para extrair número de URLs wa.me
    const match = url.match(/wa\.me\/(\d+)/);
    if (match && match[1]) {
        const number = match[1];

        // Se tem código do país (55), remove para mostrar apenas DDD + número
        if (number.startsWith('55') && number.length === 13) {
            return number.substring(2);
        }

        return number;
    }

    return '';
}

/**
 * Formata um número para exibição (com máscara)
 * @param phone Número de telefone (apenas números)
 * @returns Número formatado para exibição
 */
export function formatPhoneForDisplay(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length === 11) {
        // Formato: (11) 99999-9999
        return `(${cleanPhone.substring(0, 2)}) ${cleanPhone.substring(2, 7)}-${cleanPhone.substring(7)}`;
    }

    if (cleanPhone.length === 10) {
        // Formato: (11) 9999-9999
        return `(${cleanPhone.substring(0, 2)}) ${cleanPhone.substring(2, 6)}-${cleanPhone.substring(6)}`;
    }

    return phone;
}