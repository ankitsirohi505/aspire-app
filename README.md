# Aspire Concierge app (demo)

An installable customer app (PWA) for Android and iPhone with the same Aspire travel concierge as the website https://ankitsirohi505.github.io/aspirelifestyle/.

Live: https://ankitsirohi505.github.io/aspire-app/

Demo prototype. Not an official Aspire Lifestyles app.

## Separate from the website

The website and its Salesforce metadata are not changed by this app.

| Piece | Website | App |
| --- | --- | --- |
| Front end | `ankitsirohi505/aspirelifestyle` | this repo (`assets/chat.js` is the app's own copy of the chat widget) |
| Chat endpoint | site `aspireconcierge`, class `AspireConciergeAssistant` | Experience Cloud site `Aspire App` (`/aspireapp`), class `AspireAppAssistant` |
| Backend classes | `Concierge*`, `TripPlannerService`, ... | copies named `AspireApp*` |
| Prompt templates | `Aspire_Concierge_*` | copies named `Aspire_App_*` |
| Guest access | `Aspire_Concierge_Guest_Api` | `Aspire_App_Guest_Api` |

Both use the same customers, trips and bookings, so the demo story is identical on the website and in the app.

The Salesforce side lives in `aspire-app-salesforce` (SFDX project). Its `website-snapshot` folder is a read-only copy of the website's metadata taken before the app was built.

## Install on a phone

- iPhone (iOS 16.4 or later): open the link in Safari, tap Share, then Add to Home Screen. Open Aspire from the Home Screen.
- Android: open the link in Chrome and tap Install app (or menu, Install app).

## How it works

- `index.html` is the app shell with three tabs: Concierge, Updates and Account.
- **Sign in** opens the branded login page of the `Aspire App` Experience Cloud site (OAuth user-agent flow), then returns to the app with a token. The chat opens already signed in ("Welcome back, Emily") with four choices: **Plan a trip** (trip ideas from their travels), **Search flights** (flights for their top trip idea, ranked by how they fly), **Search hotels** (hotels for that trip from their past stays and preferences) and **Concierge services** (extras for their next booked trip). Each choice opens the usual bookable card. The Account tab shows the customer's tier, points and home airport. **Sign out** ends the site session too.
  - The sign-in request asks for the `api` and `id` scopes.
  - If a customer is sent straight back to the sign-in screen after logging in, their OAuth approval for the app has gone stale. In that state every call answers 401 INVALID_SESSION_ID. To fix it, revoke the user's "Aspire App" rows in Setup → Users → *the user* → OAuth Connected Apps, then sign in again.
- **Continue without signing in** keeps the website-style chat, where the customer shares an email.
- `assets/chat.js` runs the chat full screen. It sends one request per message, without a referrer, to `https://orgfarm-e88355df2d-dev-ed.develop.my.site.com/aspireappvforcesite/services/apexrest/aspireApp/assist` (with the token when signed in) and keeps the conversation for 12 hours.
- Trip updates the concierge shows in chat (rebookings, delays, price drops, check-in) are also listed in the Updates tab.
- `sw.js` makes the app installable, works offline for the shell, and already handles push notifications and taps on them.

## Push notifications

- The app uses Firebase Cloud Messaging (project `aspire-app-demo`, free Spark plan). **Turn on notifications** (Updates tab, or the offer after sign-in) asks for permission, gets a Firebase token and registers the phone with Salesforce (`/aspireApp/device`).
- Salesforce sends a push whenever the app's copy of the concierge autopilot acts on a trip (rebooking, delay, price drop, check-in). Tapping it opens the chat and asks for the update.
- Trigger events from Salesforce: App Launcher, **Aspire App Console**, **Aspire App Demo** tab. Pick the customer and trip, then use **Send a test notification**, **Simulate cancellation**, **Simulate delay** or **Run price watch**. The website's own buttons don't send pushes.
- iPhone needs iOS 16.4 or later and the app added to the Home Screen.
