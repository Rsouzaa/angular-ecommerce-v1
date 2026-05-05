# 📸 Screenshots - Atelié Divina Mix

Documentação das telas principais da aplicação **Atelié Divina Mix** - Plataforma de E-commerce com Angular 17+

## 🎯 Telas Disponíveis

### 1. **Home Page** - `/`
**Descrição:** Página inicial com apresentação da marca e destaques
- 🎨 Hero section com banner principal
- 📊 Seção de destaques de produtos
- 🔗 Links de navegação rápida
- ℹ️ Informações sobre a loja

**Acessar:** [http://localhost:8000/](http://localhost:8000/)

---

### 2. **Catálogo de Produtos** - `/products`
**Descrição:** Listagem completa de produtos com filtros e paginação
- 🛍️ Grid de produtos com imagens
- 📄 Paginação (10 itens por página)
- ⭐ Sistema de avaliações
- 💰 Preços e disponibilidade
- ❤️ Favoritos (adicionar/remover)
- 🛒 Botão adicionar ao carrinho

**Acessar:** [http://localhost:8000/products](http://localhost:8000/products)

---

### 3. **Detalhes do Produto** - `/product/:id`
**Descrição:** Vista detalhada de um produto específico
- 🖼️ Galeria de imagens
- 📝 Descrição completa
- 💵 Preço e promoções
- 📦 Informações de estoque
- ⭐ Avaliações de clientes
- 🔄 Produtos relacionados

**Acessar:** [http://localhost:8000/product/1](http://localhost:8000/product/1)

---

### 4. **Carrinho de Compras** - `/cart`
**Descrição:** Visualização e gerenciamento do carrinho de compras
- 🛍️ Lista de produtos adicionados
- 📊 Quantidade e preços unitários
- 💰 Subtotal, impostos e total
- 🗑️ Remover itens
- ➕➖ Ajustar quantidades
- 🔐 Proteção contra compras inválidas
- 🔄 Validação de estoque

**Acessar:** [http://localhost:8000/cart](http://localhost:8000/cart)

---

### 5. **Checkout** - `/checkout`
**Descrição:** Processo de finalização de compra
- 📮 Endereço de entrega
- 👤 Informações do cliente
- 💳 Seleção de método de pagamento
  - 💳 Cartão de Crédito
  - 🔳 Pix
  - 📋 Boleto
- 📊 Resumo do pedido
- ✅ Confirmação

**Acessar:** [http://localhost:8000/checkout](http://localhost:8000/checkout)

---

### 6. **Pagamento** - `/checkout/payment`
**Descrição:** Integração com gateway de pagamento
- 💳 Formulário de cartão/Pix/Boleto
- 🔒 Cobrança segura
- 📲 Suporte a diferentes métodos
- ✔️ Validação de dados

**Acessar:** [http://localhost:8000/checkout/payment](http://localhost:8000/checkout/payment)

---

### 7. **Confirmação de Pagamento** - `/payment-success`
**Descrição:** Página de sucesso após pagamento
- ✅ Confirmação do pedido
- 📋 Número do pedido
- 📧 Dados para rastreamento
- 🎉 Agradecimento ao cliente
- 🔗 Voltar para Home

**Acessar:** [http://localhost:8000/payment-success](http://localhost:8000/payment-success)

---

### 8. **Autenticação - Login** - `/login`
**Descrição:** Página de acesso à conta
- 📧 Email
- 🔑 Senha
- ✅ "Lembrar-me"
- 🔗 Cadastro (para novos usuários)
- 🔄 Recuperação de senha

**Acessar:** [http://localhost:8000/login](http://localhost:8000/login)

---

### 9. **Autenticação - Cadastro** - `/register`
**Descrição:** Página de criação de nova conta
- 👤 Nome completo
- 📧 Email
- 🔑 Senha
- ✓ Confirmação de senha
- ✅ Termos de serviço
- 🔗 Já tem conta? (link para login)

**Acessar:** [http://localhost:8000/register](http://localhost:8000/register)

---

### 10. **Minha Conta** - `/account`
**Descrição:** Perfil e histórico de pedidos do usuário
- 👤 Informações pessoais
- 📋 Histórico de pedidos
- 💳 Métodos de pagamento salvos
- 📮 Endereços cadastrados
- ⚙️ Configurações
- 🚪 Logout

**Acessar:** [http://localhost:8000/account](http://localhost:8000/account)

---

### 11. **Painel Admin** - `/admin`
**Descrição:** Dashboard administrativo (acesso restrito)
- 📊 Estatísticas gerais
- 📈 Gráficos de vendas
- 👥 Gestão de usuários
- 📦 Gestão de produtos
- 📋 Gestão de pedidos
- 💰 Relatórios financeiros

**Acessar:** [http://localhost:8000/admin](http://localhost:8000/admin)

---

### 12. **Navbar/Footer**
**Descrição:** Componentes de navegação global
- 🏠 Logo com link para home
- 🔍 Busca de produtos
- 🛒 Ícone carrinho (com contador)
- 👤 Menu de usuário
- ℹ️ Links do footer
- 📱 Links de redes sociais

---

## 🚀 Como Visualizar

### Opção 1: Localmente
```bash
# Na pasta do projeto
npm install
npm start

# A aplicação abrirá em http://localhost:8000
```

### Opção 2: Acessos via Rede
- **Local:** http://localhost:8000
- **Rede Interna:** http://192.168.3.13:8000

---

## 📱 Responsividade

Todas as telas foram desenvolvidas com **foco em responsividade**:
- ✅ Desktop (1920x1080)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667)

**Teste em diferentes resoluções utilizando as DevTools do navegador (F12)**

---

## 🛠️ Tecnologias Utilizadas

- **Angular 17+** - Framework frontend
- **Tailwind CSS 4.x** - Estilização responsiva
- **TypeScript** - Tipagem segura
- **RxJS** - Gerenciamento reativo
- **Angular Router** - Navegação
- **Angular Forms** - Validação de formulários

---

## 💡 Recursos Principais

- 🔐 Autenticação simples
- 💳 Suporte a múltiplos pagamentos
- 📦 Gestão de estoque
- ⭐ Sistema de avaliações
- ❤️ Favoritos
- 📄 Paginação
- 🔍 Busca
- 📱 Design responsivo
- 🌑 Otimização para performance

---

## 📝 Notas

- Screenshots devem ser capturadas manualmente abrindo cada URL no navegador
- Para telas autenticadas, faça login com as credenciais de teste
- O painel admin requer credenciais de administrador

---

**Versão:** 1.0  
**Data:** Maio 2026  
**Desenvolvedor:** Atelié Divina Mix Team
