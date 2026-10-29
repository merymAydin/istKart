# Istanbulkart Digital Hub
Istanbulkart Digital Hub is a React and TypeScript web application for applying for Istanbulkart products, completing identity verification, managing cards, and tracking wallet activity.
## Features
- User registration and login with Cloudflare Turnstile verification
- Istanbulkart product catalogue:
  - Standard Istanbulkart
  - Istanbulkart Plus
  - Discounted Card
  - Blue Istanbulkart
  - Free Istanbulkart
  - Istanbul City Card
- Multi-step KYC application:
  - Employment and education
  - Address verification
  - Identity document upload
  - Selfie and face verification
- Admin KYC review panel with approve and reject actions
- Automatic Istanbulkart creation after KYC approval
- Wallet management for active and deactivated cards
- Balance top-up with a payment card
- Subscription and monthly pass payments
- Transit spending through available terminals
- Automatic top-up configuration
- Card deactivation
- Per-card transaction history
- In-app chatbot for card and fare questions
## Project Structure
```text
istKart/
└── istanbul-kart-frontend/
    ├── src/
    │   ├── components/
    │   ├── data/
    │   ├── pages/
    │   └── services/
    ├── package.json
    └── vite.config.ts
```

## End-to-End Test Flow
The following flow can be used to test card creation from registration through admin approval.
### 1. Register a user
1. Open the application and choose **Sign Up**.
2. Create a test user account.
3. Sign in with the new username and password.
4. Select a card product from the dashboard.
### 2. Complete the KYC application
Use the following values for a test application. All values below are examples for development/testing only.
#### Step 1: Employment & Education
| Field | Test value |
|---|---|
| Education Status | Bachelor's |
| Employment Status | Student or Employed |
| Occupation | Software Developer |
| Company / Institution | Istanbul Topkapi University |
| Monthly Income | `25000` |
If **Student** is selected, the Occupation and Company / Institution fields are disabled and can remain empty.
#### Step 2: Address Verification
| Field | Test value |
|---|---|
| City | Istanbul |
| District | Fatih |
| Full Address | Ayvansaray Mah. Kazim Karabekir Cad. No:2 |
#### Steps 3 and 4: Identity and Face Verification
Upload:
1. A clear image of the front side of an identity document.
2. A selfie suitable for face verification.
Submit the application and wait for the verification result. The application remains pending until an administrator reviews it.
### 3. Approve the application as an administrator
Sign out if necessary, then use the admin account:
```text
Username: admin
Password: 123456
```
After signing in, the application opens the admin KYC panel. Select **Approve & Create** for the pending application. A new Istanbulkart is created for the user after approval. Use **Reject** only when testing the rejection flow.
> The admin credentials above are intended only for a local/demo environment. Do not use them in production.
### 4. Sign in again as the user
1. Return to the login page.
2. Sign in with the test user's username and password.
3. Open the wallet to view the approved Istanbulkart and its balance.
### 5. Test wallet and card operations
From the wallet, you can:
- Top up the card balance.
- Purchase a subscription or monthly pass.
- Spend through an available transit terminal.
- Enable automatic top-up and configure its threshold and amount.
- Open transaction history.
- Deactivate the card.
## Test Payment Card
Use the following test card values only with a payment sandbox or local development backend:
```text
Card number: 4242 4242 4242 4242
Expiry date: 12/26 or any future date accepted by the test environment
CVC: 123
```
The payment form also requires the Istanbulkart number, cardholder name, and a valid top-up amount. Do not use real card details in development or documentation.
## Application Routes
| Route | Purpose |
|---|---|
| `/` | Registration and login |
| `/dashboard` | Card catalogue and card applications |
| `/kyc` | KYC application |
| `/wallet` | Card and balance management |
| `/payment` | Top-up and subscription payment |
| `/history` | Transaction history for the selected card |
| `/admin-kyc` | Administrator KYC review panel |
## Backend
The frontend expects the backend API to expose authentication, KYC, card, payment, terminal, and transaction endpoints under the configured `VITE_API_URL`. Authentication tokens are stored in browser local storage and sent in the `Authorization` header for protected requests.

