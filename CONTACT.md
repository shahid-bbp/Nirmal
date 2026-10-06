# Contact Us

Run `npm run dev` and open **http://localhost:4173/contact.html**. All main and mobile navigation links now point to this page. No dependencies or build step are required.

## Design and content

The new page uses the site's ivory, mint, dark green, and lime palette. It retains the supplied contact-page content: the introduction, five enquiry fields, customer-care and HR contacts, postal address, location names, partnership invitation, newsletter sections, journal, certifications, and footer.

The Kerala landscape is bundled locally at `dist/assets/contact/kerala-fields.webp`; the original source is recorded in the adjacent `sources.json`. Shared brand and journal images live in `dist/assets/our-story/`.

Interactions include a gently moving landscape and note, rotating seal, animated map marker and route, swaying plant illustration, section reveals, direct phone/email links, and Google Maps links. The map is a stylized location illustration; its links open the real map search.

## Forms

The enquiry form submits directly to FormSubmit. The browser validates required fields, then FormSubmit sends the enquiry to `care@keerthinirmal.com`. The form is submitted within a hidden iframe so the fields are cleared only after FormSubmit finishes processing the request. FormSubmit receives the enquiry subject, reply-to address, topic, and message fields, and handles the email delivery.

- Enquiries default to `care@keerthinirmal.com`.
- The partnership and career calls to action select their topic, suggest a subject, move to the form, and focus the name field.
- Name, email, subject, and message are required. Phone is optional. Inline validation checks email, optional phone, and a minimum 10-character message. A live character count accompanies the message.
- The newsletter forms continue to prepare email drafts in the visitor's email application.
- Form contents are not persisted in browser storage. Session storage records only animation preferences.

FormSubmit must be granted permission to send email from the configured recipient address. The production destination is `care@keerthinirmal.com`.

## Accessibility and verification

The page has explicit field labels, inline error descriptions, native radio topic controls, keyboard navigation, a status region for prepared drafts, no-JavaScript email/phone fallbacks, and a persistent pause control. Reduced-motion preferences disable animation, pointer tilt, and parallax.

`npm run check` verifies the JavaScript syntax. Browser checks cover 320–1920px layouts, loaded assets, preserved contact details, validation, topic routing, email encoding, newsletter requests, navigation, pause/resume, reduced motion, and content without JavaScript. Verification uses sample data and does not send messages.

Deploy the `dist/` folder to a static host. `scripts/serve.mjs` is the local preview server.
