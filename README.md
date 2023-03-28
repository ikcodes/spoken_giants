# Spoken Giants

A Keystone.js-built marketing site for Spoken Giants, featuring an interactive user signup. *Live at https://spokengiants.com*.

KeystoneJS Docs: https://v4.keystonejs.com/documentation/

This site is built in MVC architecture. Models pull data from Mongo in JSON and use routes/views
to populate the frontend.

### Stack

- SASS
- Pug
- Node.js
  -> Express.js
  -> Keystone.js
- MongoDB


### CMS

The use case for Keystone centers around the CMS, accessible at a private URL. This populates custom blocks of content, as well as various diagrams, videos, etc. around the site. This keeps developer maintenance to a minimum and skyrockets the speed and flexibility of layman-level updates.

### Other notes on Keystone.js
- This site uses **_VERSION 4_**. V5 saw major changes so be sure to work in accordance with V4.
- Dev only possible with network connection.
- CMS'd images are sourced REMOTELY w/ Cloudinary
- To add something to the CMS, simply register and edit the data model in /models

### Eversign

The interactive signup uses Eversign (docs: https://eversign.com/api/documentation) to render a signable version of the Membership Agreement, found in the agreement dir. The signed document is then distributed internally, a process which was specifically requested to be hardcoded, at least for the time being.
