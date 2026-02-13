const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Función para obtener score crediticio y nombre
async function getCreditScore(username, password) {
  let browser = null;
  
  try {
    console.log(`Iniciando bot para usuario: ${username}`);
    
    // Iniciar el navegador en modo headless
    browser = await puppeteer.launch({
      headless: true,
      defaultViewport: {
        width: 1920,
        height: 1080
      },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Navegar a la página de login
    console.log('Navegando a la página de login...');
    await page.goto('https://www.misentinel.com.pe/usuario/login', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.waitForTimeout(2000);
    
    // Buscar y escribir en el campo de usuario
    console.log('Buscando campo de usuario...');
    const usernameSelector = 'input[name="username"]';
    await page.waitForSelector(usernameSelector, {
      timeout: 15000,
      visible: true
    });
    
    console.log('Campo de usuario encontrado. Escribiendo usuario...');
    
    await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, usernameSelector);
    
    await page.waitForTimeout(500);
    await page.click(usernameSelector);
    await page.waitForTimeout(300);
    
    // Escribir el usuario
    await page.evaluate((selector, text) => {
      const input = document.querySelector(selector);
      if (input) {
        input.value = '';
        input.value = text;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('keyup', { bubbles: true }));
        input.focus();
      }
    }, usernameSelector, username);
    
    await page.waitForTimeout(500);
    
    // Buscar y escribir en el campo de contraseña
    console.log('Buscando campo de contraseña...');
    const passwordSelector = 'input[name="password"]';
    await page.waitForSelector(passwordSelector, {
      timeout: 15000,
      visible: true
    });
    
    console.log('Campo de contraseña encontrado. Escribiendo contraseña...');
    
    await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, passwordSelector);
    
    await page.waitForTimeout(500);
    await page.click(passwordSelector);
    await page.waitForTimeout(300);
    
    // Escribir la contraseña
    await page.evaluate((selector, text) => {
      const input = document.querySelector(selector);
      if (input) {
        input.value = '';
        input.value = text;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('keyup', { bubbles: true }));
        input.focus();
      }
    }, passwordSelector, password);
    
    await page.waitForTimeout(500);
    
    // Buscar y hacer clic en el botón de "Iniciar sesión"
    console.log('Buscando botón de iniciar sesión...');
    await page.waitForTimeout(500);
    
    const buttonsWithText = await page.$$eval('button, input[type="submit"]', buttons => 
      buttons
        .map((btn, idx) => ({ index: idx, text: btn.textContent.trim().toLowerCase(), element: btn }))
        .filter(btn => 
          btn.text.includes('iniciar') || 
          btn.text.includes('login') || 
          btn.text.includes('entrar') ||
          btn.text.includes('ingresar')
        )
        .map(btn => btn.index)
    );
    
    if (buttonsWithText.length > 0) {
      const buttonIndex = buttonsWithText[0];
      const buttons = await page.$$('button, input[type="submit"]');
      if (buttons[buttonIndex]) {
        await page.evaluate((index) => {
          const buttons = document.querySelectorAll('button, input[type="submit"]');
          if (buttons[index]) {
            buttons[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, buttonIndex);
        await page.waitForTimeout(300);
        await buttons[buttonIndex].click();
      }
    }
    
    console.log('¡Clic realizado en el botón de iniciar sesión!');
    
    // Esperar a que la página responda
    await page.waitForTimeout(5000);
    
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    } catch (e) {
      await page.waitForTimeout(3000);
    }
    
    // Extraer nombre de la persona
    console.log('Extrayendo nombre de la persona...');
    const personName = await page.evaluate(() => {
      // Buscar patrones comunes de nombres en la página
      const textContent = document.body.textContent || document.body.innerText || '';
      
      // Buscar "Hola [NOMBRE]" o "¡Hola [NOMBRE]!"
      const holaMatch = textContent.match(/¡?Hola\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/);
      if (holaMatch) {
        return holaMatch[1].trim();
      }
      
      // Buscar en elementos específicos
      const greetings = Array.from(document.querySelectorAll('*')).find(el => {
        const text = el.textContent.trim();
        return text.includes('Hola') && /[A-ZÁÉÍÓÚÑ]/.test(text);
      });
      
      if (greetings) {
        const text = greetings.textContent.trim();
        const nameMatch = text.match(/Hola\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/);
        if (nameMatch) {
          return nameMatch[1].trim();
        }
      }
      
      return null;
    });
    
    console.log(`Nombre encontrado: ${personName || 'No encontrado'}`);
    
    // Buscar el score crediticio
    console.log('Buscando score crediticio...');
    await page.waitForTimeout(2000);
    
    let scoreValue = null;
    
    // Buscar números SVG que podrían ser el score
    const allNumbers = await page.evaluate(() => {
      const elements = document.querySelectorAll('text, span, div, p, h1, h2, h3, h4, h5, h6, strong, b');
      const numbers = [];
      
      elements.forEach(el => {
        if (el.tagName === 'STYLE' || el.tagName === 'SCRIPT' || el.tagName === 'HEAD') {
          return;
        }
        
        const text = el.textContent.trim();
        if (text.length > 500) return;
        
        const lowerText = text.toLowerCase();
        const numberMatch = text.match(/\b([3-9]\d{2})\b/);
        if (numberMatch) {
          const num = parseInt(numberMatch[1]);
          if (num >= 300 && num <= 999) {
            const contextText = (el.parentElement ? el.parentElement.textContent.trim() : '').toLowerCase();
            const hasScoreKeyword = lowerText.includes('score') || 
                                   lowerText.includes('puntaje') || 
                                   contextText.includes('score') ||
                                   contextText.includes('puntaje');
            
            numbers.push({
              value: num,
              text: text.substring(0, 100),
              tagName: el.tagName,
              hasScoreKeyword: hasScoreKeyword,
              isSVG: el.tagName === 'text' || el.closest('svg') !== null
            });
          }
        }
      });
      
      return numbers;
    });
    
    if (allNumbers.length > 0) {
      const filteredNumbers = allNumbers.filter(num => {
        if (num.value === 999 && allNumbers.some(n => n.isSVG && n.value !== 999)) {
          return false;
        }
        return true;
      });
      
      const svgWithKeyword = filteredNumbers.find(num => num.isSVG && num.hasScoreKeyword && num.value !== 999);
      if (svgWithKeyword) {
        scoreValue = svgWithKeyword.value.toString();
      } else {
        const svgScore = filteredNumbers.find(num => num.isSVG && num.value !== 999);
        if (svgScore) {
          scoreValue = svgScore.value.toString();
        } else {
          const scoreWithKeyword = filteredNumbers.find(num => num.hasScoreKeyword && num.value !== 999);
          if (scoreWithKeyword) {
            scoreValue = scoreWithKeyword.value.toString();
          } else {
            const nonMaxScores = filteredNumbers.filter(num => num.value !== 999);
            if (nonMaxScores.length > 0) {
              const maxScore = nonMaxScores.reduce((max, num) => num.value > max.value ? num : max, nonMaxScores[0]);
              scoreValue = maxScore.value.toString();
            }
          }
        }
      }
    }
    
    console.log(`Score crediticio encontrado: ${scoreValue || 'No encontrado'}`);
    
    return {
      success: true,
      score: scoreValue ? parseInt(scoreValue) : null,
      name: personName,
      username: username
    };
    
  } catch (error) {
    console.error('Error durante la ejecución:', error.message);
    return {
      success: false,
      error: error.message,
      score: null,
      name: null,
      username: username
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Endpoint POST para obtener score crediticio
app.post('/api/credit-score', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validar que se proporcionaron las credenciales
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Se requieren username y password en el body'
      });
    }
    
    console.log(`Solicitud recibida para usuario: ${username}`);
    
    // Obtener score crediticio y nombre
    const result = await getCreditScore(username, password);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
    }
    
  } catch (error) {
    console.error('Error en el endpoint:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  console.log(`Endpoint disponible: POST http://localhost:${PORT}/api/credit-score`);
});
