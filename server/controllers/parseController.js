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
            
            // Внутри span ищем элемент h1
            const albumNameElement = entityTitleSpan? entityTitleSpan.querySelector('h1').textContent.trim() : null;

            const entityBandSpan = document.querySelector('[data-testid="creator-link"]');
            const bandNameElement = entityBandSpan ? entityBandSpan.textContent.trim() : null;

            const yearSpan = document.querySelector('span.encore-text.encore-text-body-small.RANLXG3qKB61Bh33I0r2');
            const yearElement = yearSpan ? yearSpan.textContent.trim() : null;

            // Извлекаем информацию о треках
            const trackElements = document.querySelectorAll('div[data-testid="tracklist-row"]');
            const tracks = Array.from(trackElements).map(trackElement => {
                const trackLinkElement = trackElement.querySelector('div[aria-colindex="2"] a');
                const trackNameElement = trackLinkElement.querySelector('div');
                const trackLink = trackLinkElement.href;
                const trackName = trackNameElement.textContent.trim();
                return { trackName, trackLink };
            });

            const imgElement = document.querySelector('img.mMx2LUixlnN_Fu45JpFB');
            const imgSrcSet = imgElement ? imgElement.getAttribute('srcset') : '';
            const imgSrc = imgSrcSet.split(',').find(src => src.includes('640w')).trim().split(' ')[0];

            return {
                albumName: albumNameElement,
                bandName: bandNameElement,
                year: yearElement,
                tracks: tracks,
                cover: imgSrc
            };
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