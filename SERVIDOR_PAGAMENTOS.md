# 🐍 Servidor de Pagamentos - Python (Flask)

Este servidor processa os pagamentos da aplicação Angular Atelié Divina Mix.

## ⚙️ Requisitos

- Python 3.8+
- pip (gerenciador de pacotes Python)

## 🚀 Instalação e Execução

### 1. Instalar dependências

```bash
pip install -r requirements.txt
```

### 2. Executar o servidor

```bash
python server.py
```

Você deverá ver:
```
==================================================
Servidor de Pagamentos - Atelié Divina Mix
==================================================
Iniciando em http://localhost:5000
CORS habilitado para http://localhost:8080
==================================================
```

## 📡 Endpoints da API

### Health Check
```
GET /api/health
```
Verifica se o servidor está rodando.

### Processar Pagamento
```
POST /api/payments/process
```
Processa um pagamento (Cartão, Pix ou Boleto).

**Body:**
```json
{
  "customerInfo": {
    "fullName": "João da Silva",
    "email": "joao@email.com",
    "phone": "(11) 98765-4321",
    "address": "Rua A",
    "number": "123",
    "complement": "Apto 42",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567"
  },
  "paymentMethod": "credit-card",
  "cardInfo": {
    "cardName": "JOAO SILVA",
    "cardNumber": "1234 5678 9012 3456",
    "expiryDate": "12/25",
    "cvv": "123"
  },
  "amount": 299.90,
  "cartItems": []
}
```

### Obter Status do Pagamento
```
GET /api/payments/{orderId}
```

### Listar Todos os Pedidos
```
GET /api/orders
```

### Obter Detalhes de um Pedido
```
GET /api/orders/{orderId}
```

### Obter Estatísticas
```
GET /api/stats
```

## 📊 Dados Armazenados

Os dados são salvos em arquivos JSON:
- `orders.json` - Todos os pedidos
- `payments.json` - Todos os pagamentos

## 🔐 Dados de Teste

Para testar a aplicação, você pode usar:

**Cartão de Crédito:**
- Número: `1234 5678 9012 3456`
- Nome: `TESTE USUARIO`
- Validade: `12/25`
- CVV: `123`

## ⚠️ Importante

- O servidor deve estar rodando **ANTES** de usar o checkout na aplicação Angular
- A aplicação Angular está configurada para acessar `http://localhost:5000`
- CORS está habilitado para `http://localhost:8080`

## 🛠️ Troubleshooting

**Erro: "Erro ao conectar com servidor de pagamento"**
- Verifique se o servidor Python está rodando
- Verifique se está na porta 5000
- Reinicie o servidor

**Erro: "ModuleNotFoundError"**
- Execute `pip install -r requirements.txt` novamente
- Verifique se você está usando Python 3.8+

## 📝 Métodos de Pagamento Suportados

1. **Cartão de Crédito** - Validação básica implementada
2. **Pix** - Gera QR Code simulado
3. **Boleto Bancário** - Gera código de boleto simulado

---

**Desenvolvido para Atelié Divina Mix - Crochê & Costura Artesanal** 🧶
