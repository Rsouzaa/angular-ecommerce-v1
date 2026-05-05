import { Injectable } from '@angular/core';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

@Injectable({
  providedIn: 'root',
})
export class MercadoPagoService {
  // Chave pública de teste do Mercado Pago
  private publicKey = 'APP_USR-1234567890123456-test';

  private mp: any;

  constructor() {
    this.initMercadoPago();
  }

  private initMercadoPago(): void {
    if (window.MercadoPago) {
      this.mp = new window.MercadoPago(this.publicKey, {
        locale: 'pt-BR',
      });
    }
  }

  /**
   * Cria um token de cartão para o Mercado Pago
   */
  async createCardToken(cardData: {
    cardNumber: string;
    cardholderName: string;
    cardholderEmail: string;
    expirationMonth: number;
    expirationYear: number;
    securityCode: string;
    identificationType: string;
    identificationNumber: string;
  }): Promise<{ token: string; lastFourDigits: string }> {
    try {
      const response = await this.mp.createCardToken({
        cardNumber: cardData.cardNumber.replace(/\s/g, ''),
        cardholderName: cardData.cardholderName,
        cardholderEmail: cardData.cardholderEmail,
        expirationMonth: cardData.expirationMonth,
        expirationYear: cardData.expirationYear,
        securityCode: cardData.securityCode,
        identificationType: cardData.identificationType,
        identificationNumber: cardData.identificationNumber,
      });

      return {
        token: response.token,
        lastFourDigits: cardData.cardNumber.slice(-4),
      };
    } catch (error) {
      console.error('Erro ao criar token:', error);
      throw new Error(`Erro ao processar cartão: ${error}`);
    }
  }

  /**
   * Processa um pagamento com cartão
   */
  async processCardPayment(paymentData: {
    token: string;
    amount: number;
    description: string;
    installments: number;
    payer: {
      name: string;
      email: string;
      phone: number;
      identification: {
        type: string;
        number: string;
      };
      address: {
        street_name: string;
        street_number: number;
        zip_code: string;
        city_name: string;
        state_name: string;
      };
    };
  }): Promise<any> {
    // Simular processamento no frontend
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `MP-${Date.now()}`,
          status: 'approved',
          status_detail: 'accredited',
          transaction_amount: paymentData.amount,
          installments: paymentData.installments,
          payment_method_id: 'credit_card',
          payment_type_id: 'credit_card',
          created_at: new Date().toISOString(),
        });
      }, 1500);
    });
  }

  /**
   * Gera QR Code para Pix
   */
  generatePixQRCode(amount: number, description: string): {
    qrCodeUrl: string;
    pixCopyPaste: string;
    expiresAt: string;
  } {
    const pixCopyPaste = `00020126580014br.gov.bcb.pix0136${Date.now()}`;

    return {
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCopyPaste)}`,
      pixCopyPaste: pixCopyPaste,
      expiresAt: new Date(Date.now() + 30 * 60000).toISOString(), // 30 minutos
    };
  }

  /**
   * Gera dados de Boleto
   */
  generateBoletoData(amount: number, dueDate: string): {
    boletoNumber: string;
    barcode: string;
    expiresAt: string;
  } {
    const bankCode = '341'; // Banco Itaú
    const branchCode = '0001';
    const boletoNumber = `${bankCode}.${Math.random().toString().slice(2, 6)} ${branchCode} ${Math.random().toString().slice(2, 10)}-${Math.random().toString().slice(2, 3)}`;

    return {
      boletoNumber: boletoNumber,
      barcode: boletoNumber.replace(/\s/g, ''),
      expiresAt: dueDate,
    };
  }

  /**
   * Valida dados do cartão
   */
  validateCard(cardNumber: string): {
    valid: boolean;
    brand: string;
    message: string;
  } {
    const cleanNumber = cardNumber.replace(/\s/g, '');

    if (cleanNumber.length < 13) {
      return {
        valid: false,
        brand: '',
        message: 'Número de cartão incompleto',
      };
    }

    const brand = this.getCardBrand(cleanNumber);

    if (!brand) {
      return {
        valid: false,
        brand: '',
        message: 'Cartão não reconhecido',
      };
    }

    // Validação de Luhn
    const isValid = this.luhnCheck(cleanNumber);

    return {
      valid: isValid,
      brand: brand,
      message: isValid ? `Cartão ${brand} válido` : 'Número de cartão inválido',
    };
  }

  /**
   * Identifica a bandeira do cartão
   */
  private getCardBrand(cardNumber: string): string {
    const patterns: { [key: string]: RegExp } = {
      visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
      mastercard: /^5[1-5][0-9]{14}$/,
      amex: /^3[47][0-9]{13}$/,
      elo: /^(4011|431242|438935|451416|457393|504706|506896|509012|627780|636297|636369|639047|639599|65003[1-3]|65003[5-8]|65004[0-3]|65004[5-9]|65005[0-1]|65040[5-9]|65041[0-9]|65045[0-9]|65046[0-9]|65047[0-9]|65048[0-9]|65049[0-9]|65050[0-9]|65051[0-9]|6505[2-9][0-9]|65060[0-9]|6506[1-9][0-9]|6507[0-9]{2}|65080[0-9]|6509[0-9]{2}|6516[5-9][0-9]|65170[0-9]|6517[1-9][0-9]|65180[0-9]|6518[1-9][0-9]|65190[0-9]|6519[1-9][0-9]|6592[0-9]{2}|6593[0-9]{2}|65940[0-9]|6594[1-9][0-9]|65950[0-9]|6595[1-9][0-9])[0-9]{10,12}$/,
      hipercard: /^(384100|384140|384160)[0-9]{10,12}$/,
    };

    for (const [brand, pattern] of Object.entries(patterns)) {
      if (pattern.test(cardNumber)) {
        return brand.charAt(0).toUpperCase() + brand.slice(1);
      }
    }

    return '';
  }

  /**
   * Validação de Luhn para cartão
   */
  private luhnCheck(cardNumber: string): boolean {
    const digits = cardNumber.split('').map(Number);
    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }
}
