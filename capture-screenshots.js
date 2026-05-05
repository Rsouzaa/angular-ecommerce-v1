const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'docs', 'screenshots');

// Criar diretório se não existir
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const pages = [
  { url: 'http://localhost:8000', name: '01-home.png', title: 'Home Page' },
  { url: 'http://localhost:8000/products', name: '02-products.png', title: 'Produtos' },
  { url: 'http://localhost:8000/cart', name: '03-cart.png', title: 'Carrinho' },
  { url: 'http://localhost:8000/checkout', name: '04-checkout.png', title: 'Checkout' },
  { url: 'http://localhost:8000/admin', name: '05-admin.png', title: 'Admin Dashboard' },
];

async function captureScreenshots() {
  let browser;
  try {
    console.log('🚀 Inicializando Puppeteer...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    for (const page of pages) {
      try {
        console.log(`📸 Capturando: ${page.title}...`);
        const current = await browser.newPage();
        
        // Definir viewport com tamanho padrão
        await current.setViewport({ width: 1280, height: 720 });
        
        // Navegar para a página
        await current.goto(page.url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Aguardar um pouco para renderizar
        await current.waitForTimeout(2000);
        
        // Capturar screenshot
        const filePath = path.join(SCREENSHOT_DIR, page.name);
        await current.screenshot({ path: filePath, fullPage: false });
        
        console.log(`✅ ${page.title} salvo em: ${filePath}`);
        await current.close();
      } catch (error) {
        console.error(`❌ Erro ao capturar ${page.title}: ${error.message}`);
      }
    }

    await browser.close();
    console.log('\n✨ Todas as screenshots capturadas com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    if (browser) await browser.close();
    return false;
  }
}

captureScreenshots().then(success => {
  process.exit(success ? 0 : 1);
});
