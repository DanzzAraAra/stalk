# Website Stalker

Website stalker sederhana berbasis web untuk mengambil informasi publik dari berbagai platform media sosial dan layanan online.

## Screenshot

![Website Stalker Preview](https://files.catbox.moe/7g84my.jpg)

## Fitur Stalker

Website ini mendukung fitur stalk untuk platform:

- TikTok  
- Instagram  
- Roblox  
- GitHub  
- Twitter (X)  
- Pinterest  
- YouTube  

## Tech yang Digunakan

- JavaScript
- HTML
- CSS

## 📁 Struktur Folder

```text
├── api
│   └── stalk.js        # Logic scraping / fetch data stalk
├── public
│   ├── index.html      # Tampilan utama website
│   ├── script.js       # Logic frontend
│   └── style.css       # Styling website
├── package.json
└── vercel.json
```
## Cara Kerja

- User memasukkan username / ID target
- Frontend mengirim request ke endpoint API
- `api/stalk.js` melakukan scraping / fetch data
- Data dikembalikan dan ditampilkan di website

## Deployment

Project ini sudah disiapkan untuk deployment menggunakan **Vercel** (`vercel.json` tersedia).

## Catatan

- Data yang diambil hanya **informasi publik**
- Beberapa platform bisa membatasi request "rate limit / block"
- Perubahan struktur website target dapat menyebabkan fitur error

---
