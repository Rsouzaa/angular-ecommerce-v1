from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json
import os
from typing import Dict, List, Any

app = Flask(__name__)
CORS(app)

# Dados armazenados em arquivo JSON
ORDERS_FILE = 'orders.json'
PAYMENTS_FILE = 'payments.json'

def load_json(filename: str) -> List[Dict[str, Any]]:
    """Carrega dados do arquivo JSON"""
    if os.path.exists(filename):
        with open(filename, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_json(filename: str, data: List[Dict[str, Any]]) -> None:
    """Salva dados em arquivo JSON"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def validate_card(card_data: Dict[str, str]) -> tuple[bool, str]:
    """Valida dados do cartão"""
    card_number = card_data.get('cardNumber', '').replace(' ', '')
    
    # Validação básica de comprimento
    if len(card_number) != 16:
        return False, "Número de cartão inválido"
    
    # Validação de validade
    expiry = card_data.get('expiryDate', '')
    if '/' not in expiry or len(expiry) != 5:
        return False, "Validade inválida (use MM/YY)"
    
    # Validação de CVV
    cvv = card_data.get('cvv', '')
    if not cvv.isdigit() or len(cvv) < 3 or len(cvv) > 4:
        return False, "CVV inválido"
    
    return True, "Cartão válido"

def generate_pix_qrcode(amount: float) -> str:
    """Gera um QR Code simulado para Pix"""
    # Simulação de QR Code - em produção seria gerado de verdade
    return f"00020126580014br.gov.bcb.pix0136{datetime.now().timestamp()}"

def generate_boleto(amount: float, order_id: str) -> str:
    """Gera um código de boleto simulado"""
    # Simulação de código de boleto - em produção seria gerado de verdade
    return f"1234.56789 {order_id[-6:]} 01.234567-8"

@app.route('/api/health', methods=['GET'])
def health():
    """Verifica saúde da API"""
    return jsonify({
        'status': 'ok',
        'message': 'Servidor de pagamentos rodando',
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/payments/process', methods=['POST'])
def process_payment():
    """Processa um pagamento"""
    try:
        data = request.json
        
        # Validar campos obrigatórios
        required_fields = ['customerInfo', 'paymentMethod', 'amount', 'cartItems']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'Campo obrigatório ausente: {field}'
                }), 400
        
        customer_info = data['customerInfo']
        payment_method = data['paymentMethod']
        amount = data['amount']
        cart_items = data['cartItems']
        
        # Validar email
        if '@' not in customer_info.get('email', ''):
            return jsonify({
                'success': False,
                'message': 'Email inválido'
            }), 400
        
        # Gerar ID do pedido
        order_id = f"PED-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Processar por método de pagamento
        payment_data = {
            'orderId': order_id,
            'timestamp': datetime.now().isoformat(),
            'customer': customer_info,
            'paymentMethod': payment_method,
            'amount': amount,
            'items': cart_items,
            'status': 'processing'
        }
        
        if payment_method == 'credit-card':
            # Validar cartão
            card_info = data.get('cardInfo', {})
            is_valid, message = validate_card(card_info)
            
            if not is_valid:
                return jsonify({
                    'success': False,
                    'message': message
                }), 400
            
            # Simular processamento
            payment_data['status'] = 'approved'
            payment_data['cardLast4'] = card_info['cardNumber'][-4:] if card_info.get('cardNumber') else 'XXXX'
            
        elif payment_method == 'pix':
            # Gerar QR Code
            pix_key = generate_pix_qrcode(amount)
            payment_data['status'] = 'pending'
            payment_data['pixKey'] = pix_key
            payment_data['expiresAt'] = datetime.now().isoformat()
            
        elif payment_method == 'boleto':
            # Gerar código de boleto
            boleto_code = generate_boleto(amount, order_id)
            payment_data['status'] = 'pending'
            payment_data['boletoCode'] = boleto_code
            payment_data['dueDate'] = datetime.now().isoformat()
        
        # Salvar pagamento
        payments = load_json(PAYMENTS_FILE)
        payments.append(payment_data)
        save_json(PAYMENTS_FILE, payments)
        
        # Salvar pedido
        order_data = {
            'orderId': order_id,
            'customerName': customer_info.get('fullName'),
            'customerEmail': customer_info.get('email'),
            'total': amount,
            'items': len(cart_items),
            'paymentMethod': payment_method,
            'status': payment_data['status'],
            'createdAt': datetime.now().isoformat()
        }
        
        orders = load_json(ORDERS_FILE)
        orders.append(order_data)
        save_json(ORDERS_FILE, orders)
        
        return jsonify({
            'success': True,
            'message': 'Pagamento processado com sucesso',
            'orderId': order_id,
            'paymentStatus': payment_data['status'],
            'pixKey': payment_data.get('pixKey'),
            'boletoCode': payment_data.get('boletoCode')
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Erro ao processar pagamento: {str(e)}'
        }), 500

@app.route('/api/payments/<order_id>', methods=['GET'])
def get_payment_status(order_id: str):
    """Obtém status de um pagamento"""
    try:
        payments = load_json(PAYMENTS_FILE)
        payment = next((p for p in payments if p['orderId'] == order_id), None)
        
        if not payment:
            return jsonify({
                'success': False,
                'message': 'Pagamento não encontrado'
            }), 404
        
        return jsonify({
            'success': True,
            'payment': payment
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/orders', methods=['GET'])
def get_orders():
    """Lista todos os pedidos"""
    try:
        orders = load_json(ORDERS_FILE)
        return jsonify({
            'success': True,
            'orders': orders,
            'total': len(orders)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/orders/<order_id>', methods=['GET'])
def get_order(order_id: str):
    """Obtém detalhes de um pedido"""
    try:
        orders = load_json(ORDERS_FILE)
        order = next((o for o in orders if o['orderId'] == order_id), None)
        
        if not order:
            return jsonify({
                'success': False,
                'message': 'Pedido não encontrado'
            }), 404
        
        # Obter informações de pagamento
        payments = load_json(PAYMENTS_FILE)
        payment = next((p for p in payments if p['orderId'] == order_id), None)
        
        return jsonify({
            'success': True,
            'order': order,
            'payment': payment
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Obtém estatísticas de vendas"""
    try:
        orders = load_json(ORDERS_FILE)
        
        total_orders = len(orders)
        total_revenue = sum(o.get('total', 0) for o in orders)
        
        # Contar por status
        status_count = {}
        for order in orders:
            status = order.get('status', 'unknown')
            status_count[status] = status_count.get(status, 0) + 1
        
        # Contar por método de pagamento
        payment_methods = {}
        for order in orders:
            method = order.get('paymentMethod', 'unknown')
            payment_methods[method] = payment_methods.get(method, 0) + 1
        
        return jsonify({
            'success': True,
            'stats': {
                'totalOrders': total_orders,
                'totalRevenue': total_revenue,
                'byStatus': status_count,
                'byPaymentMethod': payment_methods
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    """Handler para rota não encontrada"""
    return jsonify({
        'success': False,
        'message': 'Rota não encontrada'
    }), 404

@app.errorhandler(500)
def server_error(error):
    """Handler para erro interno"""
    return jsonify({
        'success': False,
        'message': 'Erro interno do servidor'
    }), 500

if __name__ == '__main__':
    print("=" * 50)
    print("Servidor de Pagamentos - Atelié Divina Mix")
    print("=" * 50)
    print(f"Iniciando em http://localhost:8080")
    print(f"CORS habilitado para http://localhost:8000")
    print("=" * 50)
    app.run(debug=True, host='localhost', port=8080)
