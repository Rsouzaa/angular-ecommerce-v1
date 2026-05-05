import { Injectable } from '@angular/core';
import { Order } from '../../shared/models/order';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  
  // Gerar nota fiscal em formato HTML/Print
  generateInvoiceHTML(order: Order): string {
    const invoiceDate = new Date(order.date).toLocaleDateString('pt-BR');
    const itemsHTML = order.items
      .map(item => `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.product.name}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">R$ ${(item.product.price).toFixed(2)}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">R$ ${(item.product.price * item.quantity).toFixed(2)}</td>
        </tr>
      `)
      .join('');

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nota Fiscal - ${order.orderNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          .invoice-title {
            font-size: 18px;
            font-weight: bold;
            margin-top: 10px;
          }
          .order-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            font-size: 14px;
          }
          .info-section {
            border-left: 3px solid #dc2626;
            padding-left: 15px;
          }
          .info-section h3 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .info-section p {
            margin: 3px 0;
            color: #666;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .items-table th {
            background-color: #f0f0f0;
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
            font-weight: bold;
            color: #333;
          }
          .items-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .summary {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 20px;
          }
          .summary-box {
            width: 300px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
          }
          .summary-row.total {
            background-color: #dc2626;
            color: white;
            padding: 12px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: bold;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 10px;
          }
          .status-pending { background-color: #fef3c7; color: #92400e; }
          .status-processing { background-color: #dbeafe; color: #1e40af; }
          .status-paid { background-color: #dcfce7; color: #166534; }
          .status-sent { background-color: #e0e7ff; color: #3730a3; }
          .status-delivered { background-color: #dcfce7; color: #166534; }
          @media print {
            body { background-color: white; }
            .container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Atelié Divina Mix</div>
            <p style="color: #666; margin: 5px 0; font-size: 12px;">Artesanato em Crochê e Costura</p>
            <div class="invoice-title">COMPROVANTE DE COMPRA</div>
            <span class="status-badge status-${order.status}">${this.getStatusLabel(order.status)}</span>
          </div>

          <div class="order-info">
            <div class="info-section">
              <h3>Informações do Pedido</h3>
              <p><strong>Número:</strong> ${order.orderNumber}</p>
              <p><strong>Data:</strong> ${invoiceDate}</p>
              <p><strong>Método de Pagamento:</strong> ${this.getPaymentMethodLabel(order.paymentMethod)}</p>
              ${order.installments > 1 ? `<p><strong>Parcelamento:</strong> ${order.installments}x</p>` : ''}
              ${order.trackingNumber ? `<p><strong>Rastreamento:</strong> ${order.trackingNumber}</p>` : ''}
            </div>

            <div class="info-section">
              <h3>Dados do Cliente</h3>
              <p><strong>${order.customer.fullName}</strong></p>
              <p>📧 ${order.customer.email}</p>
              <p>📱 ${order.customer.phone}</p>
              <p>🆔 CPF: ${order.customer.cpf}</p>
            </div>
          </div>

          <div class="info-section" style="margin-bottom: 20px; grid-column: 1 / -1; margin-left: 0; border-left: 3px solid #dc2626; padding-left: 15px;">
            <h3>Endereço de Entrega</h3>
            <p>${order.customer.address}, ${order.customer.number}${order.customer.complement ? ` - ${order.customer.complement}` : ''}</p>
            <p>${order.customer.city}, ${order.customer.state} - CEP: ${order.customer.zipCode}</p>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unitário</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-box">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>R$ ${order.subtotal.toFixed(2)}</span>
              </div>
              ${order.discount > 0 ? `
                <div class="summary-row">
                  <span>Desconto (${order.discountPercent}%):</span>
                  <span>-R$ ${order.discount.toFixed(2)}</span>
                </div>
              ` : ''}
              <div class="summary-row">
                <span>Frete:</span>
                <span>Grátis</span>
              </div>
              <div class="summary-row total">
                <span>TOTAL:</span>
                <span>R$ ${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Obrigado pela sua compra! 🎨</p>
            <p>Para dúvidas, entre em contato pelo WhatsApp ou email.</p>
            <p style="margin-top: 10px; color: #999;">Comprovante gerado em: ${new Date().toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  // Abrir nota fiscal em nova aba para impressão
  openInvoiceForPrint(order: Order): void {
    const html = this.generateInvoiceHTML(order);
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  }

  // Baixar nota fiscal como HTML
  downloadInvoiceHTML(order: Order): void {
    const html = this.generateInvoiceHTML(order);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(html));
    element.setAttribute('download', `nota-fiscal-${order.orderNumber}.html`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  // Copiar nota fiscal para clipboard
  copyInvoiceToClipboard(order: Order): void {
    const html = this.generateInvoiceHTML(order);
    navigator.clipboard.writeText(html).then(() => {
      alert('Nota fiscal copiada para clipboard!');
    });
  }

  private getPaymentMethodLabel(method: string): string {
    const labels: { [key: string]: string } = {
      'credit-card': 'Cartão de Crédito',
      'pix': 'Pix',
      'boleto': 'Boleto',
    };
    return labels[method] || method;
  }

  private getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Pendente',
      'processing': 'Processando',
      'paid': 'Pagamento Confirmado',
      'sent': 'Enviado',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado',
    };
    return labels[status] || status;
  }
}
