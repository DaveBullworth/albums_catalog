const axios = require('axios');
const { logError } = require('../utils/logger');

//TODO: Кеширование ответов через Redis, дополнительная защита от спама express-rate-limit

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  try {
    const params = 'grant_type=client_credentials';
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await axios.post('https://accounts.spotify.com/api/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authHeader}`,
      },
    });

    cachedToken = response.data.access_token;
    tokenExpiresAt = Date.now() + response.data.expires_in * 1000 - 60000; // -1 мин запас
    return cachedToken;
  } catch (error) {
    logError(error, 'ParseController: Ошибка при получении токена Spotify');
    throw error;
  }
}

function extractAlbumId(url) {
  const match = url.match(/album\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

async function fetchAlbumDataFromSpotifyPage(spotifyAlbumLink) {
  try {
    const albumId = extractAlbumId(spotifyAlbumLink);
    if (!albumId) throw new Error('Invalid Spotify album link');

    const token = await getAccessToken();

    const response = await axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = response.data;

    return {
      albumName: data.name,
      bandName: data.artists.map((a) => a.name).join(', '),
      year: data.release_date.split('-')[0],
      cover: data.images?.[0]?.url || null,
      tracks: data.tracks.items.map((track) => ({
        trackName: track.name,
        trackLink: track.external_urls.spotify,
      })),
    };
  } catch (error) {
    logError(error, 'ParseController: ошибка при получении данных альбома Spotify');
    return null;
  }
}

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
      logError(error, 'ParseController: ошибка при получении данных альбома');
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new ParseController();
