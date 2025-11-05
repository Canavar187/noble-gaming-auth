NobleGamble – Web Demo Deployment

▶ Express.js Setup für statisches Hosting
▶ Alle Module verlinkt über /public/index.html

Lokal starten:
1. Node.js installieren
2. Terminal öffnen im Projektverzeichnis
3. npm init -y
4. npm install express
5. node server.js
→ http://localhost:3000 öffnen

Deployment-Vorschläge:
- Vercel (nur /public)
- Render (komplett mit server.js)
- Glitch.com (einfacher Testserver)

Struktur:
- /public/index.html → Navigation zu Monetarisierung, Admin, Trust, etc.
- /server.js → Lokaler Webserver
