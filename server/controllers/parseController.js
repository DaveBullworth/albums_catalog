const puppeteer = require('puppeteer');

class ParseController {
    async get(req, res) {
        try {
            // Получаем ссылку на альбом из запроса
            let { link } = req.query;

            // Проверяем, была ли предоставлена ссылка
            if (!link) {
                return res.status(400).json({ error: 'No link provided' });
            }

            // Используем функцию fetchAlbumDataFromSpotifyPage для получения данных альбома
            const albumData = await fetchAlbumDataFromSpotifyPage(link);

            // Проверяем, удалось ли получить данные альбома
            if (!albumData) {
                return res.status(404).json({ error: 'Album data not found' });
            }

            // Отправляем данные альбома в формате JSON
            return res.json({ albumData });
        } catch (error) {
            console.error('Error fetching album data:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

const fetchAlbumDataFromSpotifyPage = async (spotifyAlbumLink) => {
    try {
      const browser = await puppeteer.launch(); // Запускаем браузер
      const page = await browser.newPage(); // Создаем новую страницу
      
      // Переходим по ссылке на страницу с альбомом
      await page.goto(spotifyAlbumLink);
  
      // Ждем, пока загрузится содержимое страницы (например, по какому-то селектору)
      await page.waitForSelector('[data-testid="entityTitle"]');
      
      const albumData = await page.evaluate(() => {
          // Находим span по атрибуту data-testid
          const entityTitleSpan = document.querySelector('[data-testid="entityTitle"]');
          if (!entityTitleSpan) return null; // Если элемент не найден, возвращаем null
        
          // Внутри span ищем элемент h1
          const albumNameElement = entityTitleSpan.querySelector('h1');
          if (!albumNameElement) return null; // Если элемент не найден, возвращаем null
        
          // Возвращаем текстовое содержимое найденного элемента
          return albumNameElement.textContent.trim();
      });          
      // Закрываем браузер
      await browser.close();
  
      // Возвращаем данные альбома
      return albumData;
    } catch (error) {
      console.error('Error fetching album data:', error);
      return null;
    }
};

module.exports = new ParseController();