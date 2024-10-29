const puppeteer = require('puppeteer');

async function scrapeMostExpensiveProduct() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navega até a página de login
    await page.goto('https://www.saucedemo.com/', { waitUntil: 'networkidle2' });

    // Captura o usuário e a senha automaticamente das divs
    const credentials = await page.evaluate(() => {
      const usernameDiv = document.querySelector('.login_credentials');
      const passwordDiv = document.querySelector('.login_password');
      
      // Obtém o texto das divs, separando login e senha (caso não encontre, coloquei hardcode como 'backup')
      const username = usernameDiv ? usernameDiv.innerText.split('\n')[1].trim() : 'standard_user';
      const password = passwordDiv ? passwordDiv.innerText.split('\n')[1].trim() : 'secret_sauce';

      return { username, password };
    });

    console.log("Usando as credenciais:", credentials);

    // Preenchendo o login com as credenciais identificadas
    await page.type('#user-name', credentials.username);
    await page.type('#password', credentials.password);
    await page.click('#login-button');

    // Aguarda o carregamento da página de produtos
    await page.waitForSelector('.inventory_item');

    // Extrai dados dos produtos
    const products = await page.evaluate(() => {
      const productElements = document.querySelectorAll('.inventory_item');
      const items = [];

      productElements.forEach(product => {
        const title = product.querySelector('.inventory_item_name').innerText;
        const priceText = product.querySelector('.inventory_item_price').innerText;
        const price = parseFloat(priceText.replace('$', ''));
        items.push({ title, price });
      });

      return items;
    });

    // Ordena os produtos pelo preço em ordem decrescente e seleciona o mais caro
    const mostExpensiveProduct = products.sort((a, b) => b.price - a.price)[0];

    console.log("Produto mais caro encontrado:", mostExpensiveProduct);

    // Retorna o produto mais caro em JSON
    return mostExpensiveProduct;

  } catch (error) {
    console.error("Erro ao processar:", error);
  } finally {
    await browser.close();
  }
}

// Chamada da função
scrapeMostExpensiveProduct().then(product => {
  console.log(JSON.stringify(product, null, 2));
});
