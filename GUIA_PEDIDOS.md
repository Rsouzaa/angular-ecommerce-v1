# 📦 Sistema de Controle de Pedidos e Nota Fiscal

## Como usar o sistema de gerenciamento de pedidos

### 1. **Acessar a Página de Pedidos**

A página de pedidos está disponível em: `/admin/orders`

#### Via URL Direta:
- Abra no navegador: `http://localhost:8000/admin/orders`

#### Criar um link no admin:
Você pode adicionar o seguinte link ao painel admin:
```html
<a routerLink="/admin/orders" class="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
  📦 Gerenciar Pedidos
</a>
```

---

### 2. **Funcionalidades da Página de Pedidos**

#### 📊 Dashboard com Estatísticas
- **Total de Pedidos**: Mostra quantos pedidos foram feitos
- **Faturamento**: Valor total de todas as vendas
- **Pendentes**: Quantos pedidos estão aguardando ação

#### 🔍 Filtros e Busca
- **Buscar por Nome/Email**: Digite o nome ou email do cliente
- **Filtrar por Status**: Selecione um status específico (Pendente, Processando, Pagamento Confirmado, Enviado, Entregue, Cancelado)

#### 📋 Lista de Pedidos

Cada pedido mostra:
- **Número do Pedido**: ID único (ex: PED-1234567890-5000)
- **Status**: Indicador visual da situação do pedido
- **Cliente**: Nome da pessoa que fez a compra
- **Email**: Contato do cliente
- **Data**: Quando o pedido foi realizado
- **Total**: Valor total do pedido
- **Quantidade de produtos**: Número de itens

#### 🔄 Expandir Pedido para Ver Detalhes

Clique em um pedido para ver:

**📋 Dados Pessoais:**
- Nome completo
- Email
- Telefone
- CPF

**🏠 Endereço de Entrega:**
- Endereço completo
- Número
- Complemento
- Cidade, Estado, CEP

**📦 Lista de Produtos:**
- Nome do produto
- Quantidade comprada
- Preço unitário
- Total do produto

**💵 Resumo Financeiro:**
- Subtotal
- Desconto aplicado (se houver)
- Frete (Grátis)
- **TOTAL** (destacado em vermelho)

**💳 Informações de Pagamento:**
- Método: Cartão de Crédito, Pix ou Boleto
- Parcelamento: Número de vezes

**🚚 Rastreamento:**
- Campo para adicionar/atualizar número de rastreamento
- Botão para salvar

---

### 3. **Alterar Status do Pedido**

Os status disponíveis são:
- ⏳ **Pendente** - Novo pedido, aguardando processamento
- ⚙️ **Processando** - Pedido está sendo preparado
- ✅ **Pagamento Confirmado** - Pagamento foi recebido
- 📮 **Enviado** - Produto já foi despachado
- 🎉 **Entregue** - Cliente recebeu o pedido
- ❌ **Cancelado** - Pedido foi cancelado

**Como alterar:**
1. Clique no pedido para expandir
2. Selecione o novo status no dropdown "Alterar Status do Pedido"
3. O status é atualizado imediatamente

---

### 4. **Adicionar Número de Rastreamento**

1. Expanda o pedido
2. Na seção "🚚 Rastreamento", digite o número
3. Clique em "Atualizar"
4. O número será salvo e exibido na nota fiscal

---

### 5. **📄 Gerar Nota Fiscal**

A nota fiscal é um comprovante profissional com todas as informações do pedido.

#### Opções:

**🖨️ Imprimir Nota Fiscal**
- Abre a nota fiscal em uma nova aba
- Você pode imprimir diretamente do navegador
- Usa `Ctrl + P` ou `Cmd + P` para abrir o diálogo de impressão

**📥 Baixar Nota Fiscal**
- Baixa a nota fiscal em formato HTML
- Arquivo salvo como: `nota-fiscal-PED-XXX.html`
- Pode ser aberto em qualquer navegador

#### Informações na Nota Fiscal:
✅ Logo e nome da empresa: "Atelié Divina Mix"
✅ Número único do pedido
✅ Status atual do pedido (visual com cores)
✅ Data da compra
✅ Dados completos do cliente
✅ Endereço de entrega
✅ Lista detalhada de produtos
✅ Cálculo de valores (subtotal, desconto, frete, total)
✅ Método de pagamento
✅ Número de rastreamento (se disponível)
✅ Data e hora de geração

---

### 6. **Deletar Pedido**

⚠️ **Ação irreversível - use com cuidado!**

1. Expanda o pedido
2. Clique no botão vermelho "🗑️ Deletar"
3. Confirme a ação no diálogo
4. O pedido será removido do sistema

---

### 7. **Fluxo Recomendado de Gerenciamento**

```
1. Cliente faz compra → Status "processing" (automático)
2. Você recebe o pedido no admin → Pode revisar todos os dados
3. Processar pagamento → Mude para "paid"
4. Preparar e embalar → Mantenha em "paid" ou "processing"
5. Gere a Nota Fiscal → Use "Imprimir Nota Fiscal"
6. Despachar com correios → Coloque o número de rastreamento
7. Mude para "sent" → Sistema atualizado e nota fiscal com rastreamento
8. Cliente recebe → Mude para "delivered"
```

---

### 8. **Dados Armazenados**

Todos os pedidos são salvos em **localStorage** do navegador:
- Chave: `atelie-orders`
- Formato: JSON

⚠️ **Importante**: Se limpar o cache/localStorage, os pedidos serão perdidos!
Para backup, recomenda-se exportar periodicamente.

---

### 9. **Acessar via Rotas Angular**

Se quiser integrar em outras partes da aplicação:

```typescript
import { OrdersComponent } from './admin/pages/orders/orders.component';

// Em sua rota:
{
  path: 'admin/orders',
  component: OrdersComponent,
  canActivate: [adminGuard] // adicione auth se necessário
}
```

---

### 10. **Troubleshooting**

**❌ Pedidos não aparecem?**
- Verifique se os pedidos foram feitos com sucesso até o final do checkout
- Abra o DevTools (F12) e verifique localStorage
- Limpe o cache e tente novamente

**❌ Nota fiscal em branco?**
- Chrome/Firefox: Clique em "Imprimir Nota Fiscal" ao invés de "Baixar"
- Verifique se há JavaScript bloqueado no navegador

**❌ Rastreamento não salva?**
- Verifique se o campo está vazio antes de clicar
- Tente recarregar a página após atualizar

---

### 📱 Responsividade

A página de pedidos funciona em:
- 📱 Smartphones (telas pequenas)
- 💻 Tablets (telas médias)
- 🖥️ Desktops (telas grandes)

Os detalhes se reorganizam automaticamente para cada tamanho de tela.

---

## 🎨 Recursos Visuais

- Cores para cada status (amarelo, azul, verde, etc.)
- Ícones visuais para fácil identificação
- Cards expansíveis com animações suaves
- Tabelas responsivas
- Botões destacados por função

---

Aproveite o sistema! 🚀
