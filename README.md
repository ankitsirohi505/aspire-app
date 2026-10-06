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
- `assets/chat.js` runs the chat full screen. It sends one request per message, without a referrer, to `https://orgfarm-e88355df2d-dev-ed.develop.my.site.com/aspireappvforcesite/services/apexrest/aspireApp/assist` and keeps the conversation for 12 hours.
- Trip updates the concierge shows in chat (rebookings, delays, price drops, check-in) are also listed in the Updates tab.
- `sw.js` makes the app installable, works offline for the shell, and already handles push notifications and taps on them.

## Next

1. Push notifications through Firebase Cloud Messaging, sent by Salesforce when the concierge acts on a trip.
2. Customer login with an Experience Cloud customer account, so the chat opens already signed in.
