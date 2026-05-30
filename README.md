# Naukri Access

A mobile-first job listing app prototype with Rs 100 access gating, ad placeholders, saved jobs, payment receipt state, and a local admin posting form.

## Try it

Open `index.html` in a browser, or run a local web server from this folder.

## What is included

- Locked job listings before payment
- Demo Rs 100 payment verification
- Payment receipt screen
- Trusted source sync simulation for Naukri, LinkedIn, and Google Jobs
- Job search and category filter
- Source filtering
- Saved jobs
- Admin UPI and AdMob setup form
- Admin form to publish jobs locally
- AdMob placeholder banner
- PWA manifest for app-style install testing

## Next production steps

- Connect login with Firebase Authentication or your own backend
- Replace demo payment with a real gateway such as Razorpay, Cashfree, PhonePe PG, or Paytm PG
- Verify payment on the server before unlocking listings
- Store jobs and paid users in a database
- Replace the demo sync engine with approved APIs, partner feeds, ATS feeds, or employer XML/JSON feeds
- Store UPI/payment credentials in a secure server-side vault, not browser storage
- Add Play Store and App Store compliant payment handling
- Replace ad placeholder with AdMob app ID and ad unit ID
- Add privacy policy, terms, refund policy, and support contact
