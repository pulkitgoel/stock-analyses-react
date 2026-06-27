# Backend API Server

Python-based notification and API server for the Stock Analyses Dashboard.

## Setup

```bash
cd backend
pip install flask flask-cors pywebpush
```

## Usage

```bash
python3 notification_server.py <port>
```

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/analyses` | GET | List all analyses with metadata |
| `/api/subscribe` | POST | Subscribe to push notifications |
| `/api/unsubscribe` | POST | Unsubscribe from push notifications |
| `/api/notify` | POST | Send push notification to all subscribers |
| `/api/subscribers` | GET | List all subscribers (admin) |

## Deployment

The server runs as a systemd service:

```bash
systemctl start vault-notify
systemctl enable vault-notify
```

Service listens on **port 8081** and Nginx proxies `/api/*` requests to it.
