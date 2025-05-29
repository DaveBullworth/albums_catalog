# 🎵 Albums Catalog

A music album catalog with authentication, localization, palette extraction, animations, and more. Built on the **PERN** stack and fully containerized using Docker + Nginx.

---

## 🚀 Tech Stack

![PERN Stack](https://miro.medium.com/v2/resize:fit:1100/format:webp/1*ptqverAyBpdfUDhrs2g_3A.jpeg)

### 📦 Backend

- **Node.js** + **Express.js**
- **PostgreSQL** + **Sequelize**
- **JWT Authentication**
- **Localization:** `i18next`, `i18next-fs-backend`
- **File Upload:** `express-fileupload`
- **Rate Limiting** `express-rate-limit`
- **Logging:** `winston`
- **Environment Configuration:** `dotenv`

### 🎨 Frontend

- **React.js** + **Redux Toolkit**
- **Routing:** `react-router-dom`
- **Styling:** `Sass`, `Bootstrap`
- **Animations:** `mojs`
- **Color Palette Extraction:** `tinycolor2`, `colorthief`
- **Localization:** `react-i18next`, `i18next-http-backend`

---

## 🎧 Spotify for Developers API

This project integrates with the **[Spotify Web API](https://developer.spotify.com/documentation/web-api/)** to retrieve album data, artist information, and cover art.

### 🔍 What is the Spotify Web API?

Spotify's Web API is a RESTful service that allows developers to access public and private Spotify content — such as albums, playlists, artists, and user profiles.

In this project, we use it primarily for:
- Fetching album metadata
- Retrieving high-resolution album covers
- Querying artists and genres
- Enhancing the catalog with real-time Spotify data

### 🚀 How to get your own Spotify API credentials

To use the Spotify API, you must register your application and obtain credentials (Client ID and Client Secret).

1. Go to the official [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click on **"Create an App"**
4. Fill out app name and description
5. After the app is created, you’ll get:
   - **Client ID**
   - **Client Secret**
6. (Optional) Set a redirect URI if you need user authorization flows (not required for this project)

### 🔐 How to use the credentials

1. In your `.env` file (e.g., `server/.env`), add:

   ```env
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   ```

2. In your backend code, exchange the credentials for an access token (using the Client Credentials Flow):

   ```js
   const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
   const { data } = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
     headers: {
       Authorization: `Basic ${auth}`,
       'Content-Type': 'application/x-www-form-urlencoded'
     }
   });
   ```

3. Use the access token to make requests to the Spotify API.

### 📎 Resources

- [Spotify Web API Docs](https://developer.spotify.com/documentation/web-api/)
- [Authorization Guide](https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow)
- [Available Endpoints](https://developer.spotify.com/documentation/web-api/reference)

---

⚠️ **Note:** Be mindful of Spotify’s rate limits. Avoid excessive requests, cache responses where appropriate, and handle expired tokens gracefully.

## 🐳 Dockerized Architecture

This app consists of four services:

- `client` — React SPA
- `server` — Express API
- `db` — PostgreSQL
- `nginx` — Static hosting & reverse proxy

```
project-root/
├── client/          # React frontend
├── server/          # Node backend
├── docker/
│   ├── nginx/       # Nginx config
│   ├── Dockerfile.client
│   └── Dockerfile.server
├── docker-compose.yml
└── README.md
```

## 📦 Environment Variables

### Client (`client/.env`)
```
REACT_APP_API_URL=/api/
```

### Server (`server/.env`)
```
PORT=5000
NODE_ENV=development
API_BASE_URL=http://server:5000/api
CLIENT_URL=http://client
DB_NAME=Albums
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432
JWT_SECRET=secretkey
POSTGRES_PASSWORD=postgres
```

## 🚀 Running the App with Docker

### 1. Clone the repository
```
git clone <repository_url>
cd <repository_name>
```

### 2. Create `.env` files

Fill in the required variables in:
- `client/.env`
- `server/.env`

You can use the provided examples above.

### 3. Build and run containers
```
docker-compose up --build
```

The services:
- Client: [http://localhost:3000](http://localhost:3000)
- Server (proxied via nginx): [http://localhost/api](http://localhost/api)

## 🛠 Scripts

### Client
```
npm start         # Start React dev server
npm run build     # Build production bundle
npm run format    # Format with Prettier
```

### Server
```
npm run dev       # Start with nodemon
npm run lint      # Lint code
npm run lint:fix  # Fix lint issues
npm run format    # Format with Prettier
```

## ⚙️ Technologies

### Backend
- Node.js
- Express
- PostgreSQL
- Sequelize ORM
- Winston (logging)
- dotenv, cors, i18next, express-rate-limit

### Frontend
- React
- Redux Toolkit
- React Router DOM
- Bootstrap + Bootstrap Icons
- Axios
- Sass
- ColorThief, TinyColor2
- Mo.js (animation)
- i18next (internationalization)

## 📁 Build Output

After running `docker-compose up --build`, the structure will be:

- `client` is served by `nginx` at `/`
- API requests to `/api` are proxied to the `server` container

## 🐳 Nginx Config

Located in `docker/nginx/default.conf`:

```nginx
server {
  listen 80;
  server_name localhost;

  location / {
    root /usr/share/nginx/html;
    index index.html index.htm;
    try_files $uri /index.html;
  }

  location /api/ {
    proxy_pass http://server:5000/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

This handles frontend routing and proxies API calls.

## 💾 Volumes

Docker uses named volumes for PostgreSQL data persistence:

```yaml
volumes:
  db_data:
```

These are automatically created and mounted to the container at:

```
/var/lib/postgresql/data
```

If you want to reset the database, remove the volume:

```bash
docker volume rm <project_name>_db_data
```

Or prune all unused volumes:

```bash
docker volume prune
```

## 📂 Logs

Server logs are stored in:

```
server/logs/
```

This folder is mounted into the container and managed by Winston logger. Log files can include `error.log`, `combined.log`, or custom-defined logs.

## ❓ FAQ

### 🔹 Why am I getting `ERR_NAME_NOT_RESOLVED` or `network error`?

This usually means:
- You're accessing the server by internal Docker name (e.g., `http://server:5000`) **outside** the container.
- **Fix**: Access everything via Nginx (`http://localhost`) and use relative API paths (`/api/...`) from the frontend.

### 🔹 Why use `/api` in `REACT_APP_API_URL`?

Nginx is set up to proxy any request to `/api` to the backend container. This avoids hardcoding internal container names and simplifies deployments.

### 🔹 How do I rebuild everything from scratch?

```bash
docker-compose down -v --remove-orphans
docker-compose up --build
```

### 🔹 How do I access PostgreSQL manually?

You can connect to the DB container:

```bash
docker exec -it <container_name> psql -U postgres
```

Or via GUI tools using:
- Host: `localhost`
- Port: `5432`
- User: `postgres`
- Password: from `.env`

### 🔹 How do I format code?

```bash
npm run format
```

Available in both `client/` and `server/`.

---

Feel free to contribute or open an issue!


