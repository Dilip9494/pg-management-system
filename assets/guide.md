
### **2. Add App Icons**

Create a `manifest.json` file in your root directory:

```json
{
  "name": "PG Management System",
  "short_name": "PG Manager",
  "description": "Manage your PG guest data efficiently",
  "start_url": "/index.html",
  "display": "standalone",
  "background_color": "#667eea",
  "theme_color": "#667eea",
  "orientation": "portrait",
  "icons": [
    {
      "src": "assets/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "assets/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```
