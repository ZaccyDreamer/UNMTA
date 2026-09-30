# UNMTA website

A lightweight, static website for the University of Nairobi Microprocessor Technology Association. It uses plain HTML, CSS and JavaScript, with no persistent backend or runtime dependencies.

## Run locally

```sh
npm install
npm run build
python3 -m http.server 8000 --directory public
```

Then open `http://localhost:8000`.

## Deploy to Vercel

Import the repository into Vercel. `vercel.json` sets the static output directory to `public`; no database, server process, environment secrets or build dependencies are required.

## Update the site

- Update community details, activities, image URLs, leadership roles and official social links in `public/data.js`.
- Put confirmed UNMTA photographs in `public/images/` and change their paths in `public/data.js`. Current activity and gallery photography uses remote Unsplash images as temporary stock imagery.
- Add confirmed upcoming event details to the page’s Events section and past event photo links to `pastEvents` in `public/data.js`.
- Add a verified, approved constitution document when available. The legacy constitution was demo content and is intentionally not published as official.

Membership instructions are displayed on the site. WhatsApp is used to contact UNMTA; the website does not collect registration records, process M-Pesa payments, or verify payment completion.
