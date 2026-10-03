# Flushing or Blushing

A static card-game companion at https://abhayk.net/flushingorblushing/.

The homepage explains the game. The controller lives at `/flushingorblushing/controller/` and provides See, Add and Take cards, help, Home navigation and a confirmed New game reset. Cards stay used across refreshes and Home visits in the same browser tab until New game is confirmed.

No installation or build is required. Edit the HTML, CSS and JavaScript directly. Artwork is included in `assets/`. The game uses the physical deck at the table; the controller tracks action usage only.

To preview locally, serve the repository root using any static HTTP server, then open `/flushingorblushing/`. Vercel publishes these static files through the repository's existing deployment setup.
