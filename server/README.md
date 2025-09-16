# Paxcash Contact Form Server

This server handles contact form submissions and sends emails to paxcashteam@gmail.com.

## Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Email Settings

1. **Enable 2-Factor Authentication** on your Gmail account (paxcashteam@gmail.com)

2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"

3. **Create .env file**:
   ```bash
   cp env.example .env
   ```

4. **Update .env file** with your credentials:
   ```
   EMAIL_USER=paxcashteam@gmail.com
   EMAIL_PASS=your_app_password_here
   PORT=5000
   ```

### 3. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will run on http://localhost:5000

### 4. Test the API
```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Message",
    "message": "This is a test message"
  }'
```

## API Endpoints

- `POST /api/contact` - Submit contact form
- `GET /api/health` - Health check

## Email Format

Contact form submissions will be sent to paxcashteam@gmail.com with:
- Subject: "Contact Form: [user's subject]"
- HTML formatted email with contact details and message
- Timestamp of submission 