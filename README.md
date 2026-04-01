# Tuma Kodi 🏠

A full-stack rent and property management platform built for landlords and property managers in Kenya. Tuma Kodi streamlines rent collection, tenant management, and property tracking — all in one place.

**Live App:** [https://tuma-kodi.vercel.app](https://tuma-kodi.vercel.app)  
**Backend API:** [https://tuma-kodi-1.onrender.com/api](https://tuma-kodi-1.onrender.com/api)

---

## Features

- 🏘️ **Property & Unit Management** — Add and manage properties, units, and occupancy status
- 👥 **Tenant Management** — Onboard tenants, assign them to units, and track their details
- 💳 **M-Pesa Rent Collection** — Accept rent payments via M-Pesa STK Push (Safaricom Daraja API)
- 📲 **SMS Notifications** — Send automated SMS alerts to tenants via Africa's Talking
- 📊 **Reports & Analytics** — View payment history, occupancy rates, and financial summaries
- 🔐 **JWT Authentication** — Secure login and session management with access and refresh tokens

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React + TypeScript | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Vercel | Hosting |

### Backend
| Technology | Purpose |
|---|---|
| Flask | Python web framework |
| Flask-RESTful | REST API structure |
| Flask-JWT-Extended | Authentication |
| Flask-SQLAlchemy | ORM |
| Flask-Migrate | Database migrations |
| Flask-CORS | Cross-origin requests |
| psycopg2 | PostgreSQL driver |
| Render | Hosting |

### Database
| Technology | Purpose |
|---|---|
| PostgreSQL | Primary database |
| Render PostgreSQL | Cloud-hosted DB (production) |

### Integrations
| Service | Purpose |
|---|---|
| Safaricom Daraja (M-Pesa) | Rent payment processing |
| Africa's Talking | SMS notifications |
| ngrok | Local webhook testing |

---

## Project Structure

```
tuma-kodi/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/
│   │   │   ├── properties/  # Property management
│   │   │   ├── tenants/     # Tenant management
│   │   │   ├── payments/    # Payment tracking
│   │   │   ├── reports/     # Analytics & reports
│   │   │   ├── settings/    # User profile & notifications
│   │   │   └── property-details/
│   │   └── ...
│   ├── .env                 # VITE_API_URL
│   └── vite.config.ts
│
└── server/                  # Flask backend
    ├── migrations/          # Alembic DB migrations
    ├── config.py            # App configuration & DB setup
    ├── app.py               # App entry point & routes
    ├── models.py            # SQLAlchemy models
    ├── requirements.txt     # Python dependencies
    └── .env                 # Environment variables
```

---

## Environment Variables

### Backend (`server/.env`)

```env
SECRET_KEY=your_flask_secret_key
JWT_SECRET_KEY=your_jwt_secret_key

# Local development
DB_USERNAME=root
DB_PASSWORD=your_db_password
DB_DATABASE=tuma_kodi_db
DB_HOST=127.0.0.1
DB_PORT=5432

# Production (Render) — overrides individual DB vars
DATABASE_URL=postgresql://user:password@host/dbname

# M-Pesa (Safaricom Daraja)
CONSUMER_KEY=your_consumer_key
CONSUMER_SECRET=your_consumer_secret
BUSINESS_SHORTCODE=your_shortcode
PASSKEY=your_passkey
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://your-ngrok-or-render-url/callback

# Africa's Talking
AFRICASTALKING_USERNAME=sandbox
AFRICASTALKING_SENDER_ID=sandbox
AFRICASTALKING_API_KEY=your_api_key
```

### Frontend (`client/.env`)

```env
VITE_API_URL=https://tuma-kodi-1.onrender.com/api
```

> For local development set `VITE_API_URL=http://localhost:5000/api`

---

## Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL installed and running

### 1. Clone the repository

```bash
git clone https://github.com/your-username/tuma-kodi.git
cd tuma-kodi
```

### 2. Backend setup

```bash
cd server

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file (see Environment Variables above)

# Run database migrations
flask db upgrade

# Start the server
flask run
```

### 3. Frontend setup

```bash
cd client

# Install dependencies
npm install

# Create your .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Database Setup (Local)

Make sure PostgreSQL is running:

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql  # auto-start on reboot
```

Create the database and user:

```bash
sudo -u postgres psql
```

```sql
CREATE USER root WITH PASSWORD 'your_password';
CREATE DATABASE tuma_kodi_db OWNER root;
GRANT ALL PRIVILEGES ON DATABASE tuma_kodi_db TO root;
\q
```

Then run migrations:

```bash
flask db upgrade
```

---

## Deployment

### Backend — Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your GitHub repo and set the root directory to `server/`
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `flask run --host=0.0.0.0 --port=10000`
6. Add all environment variables from `server/.env` in the Render dashboard
7. Create a **PostgreSQL** service on Render and set `DATABASE_URL` to the Internal Database URL

> **Important:** Set `load_dotenv(override=False)` in `config.py` so Render's environment variables are not overridden by any committed `.env` file.

### Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo and set the root directory to `client/`
3. Add environment variable:
   - `VITE_API_URL` = `https://tuma-kodi-1.onrender.com/api`
4. Deploy

---

## API Overview

All endpoints are prefixed with `/api`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/login` | Authenticate user |
| GET | `/api/properties` | List all properties |
| POST | `/api/properties` | Create a property |
| GET | `/api/tenants` | List all tenants |
| POST | `/api/tenants` | Add a tenant |
| GET | `/api/payments` | List payments |
| POST | `/api/payments` | Initiate M-Pesa payment |
| POST | `/callback` | M-Pesa payment callback |
| GET | `/api/reports` | Fetch reports & analytics |

---

## Known Issues & Gotchas

- **Special characters in DB password** — If your `DB_PASSWORD` contains `@` or other special characters, it must be URL-encoded in the connection string. The app handles this automatically using `urllib.parse.quote_plus`.
- **Render cold starts** — The free tier on Render spins down after inactivity. The first request after idle may take 30–60 seconds.
- **M-Pesa callbacks** — For local testing, use [ngrok](https://ngrok.com) to expose your local server and update `MPESA_CALLBACK_URL` accordingly.
- **CORS** — The backend only allows requests from `http://localhost:5173` and `https://tuma-kodi.vercel.app`. Update `allowed_origins` in `config.py` if you use a different frontend URL.

---

## License

MIT License — feel free to use and adapt for your own projects.