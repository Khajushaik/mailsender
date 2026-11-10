# Mail sender (Gmail SMTP)

Write one email, enter many recipients, send in one click.

## Setup
1. Install Node.js (v18+): https://nodejs.org
2. In this folder run:
   ```
   npm install
   npm start
   ```
3. Open http://localhost:3000

## Gmail app password
1. Turn on 2-Step Verification: https://myaccount.google.com/security
2. Create an app password: https://myaccount.google.com/apppasswords
3. Paste the 16-character code into the "App password" field.

## Notes
- Each recipient gets a separate email, so addresses stay private.
- Limit: 100 recipients per send (Gmail allows about 500 per day for personal accounts).
- Credentials are used only for that send and are never stored.
- If you deploy this online, use HTTPS and add a login so strangers cannot use it.
