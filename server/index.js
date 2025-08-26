require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const Database = require('better-sqlite3');

const PORT = process.env.PORT || 5000;
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const dbFile = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbFile);
db.pragma('journal_mode = WAL');

// Create table if not exists
db.prepare(`CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  title TEXT,
  type TEXT,
  createdAt INTEGER,
  lat REAL,
  lng REAL,
  note TEXT,
  filePath TEXT,
  preview TEXT
)`).run();

const upload = multer({ dest: UPLOADS_DIR });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// Get all memories
app.get('/api/memories', (req, res) => {
  const rows = db.prepare('SELECT * FROM memories ORDER BY createdAt DESC').all();
  res.json(rows);
});

// Create memory with optional file upload
app.post('/api/memories', upload.single('file'), (req, res) => {
  try {
    const id = req.body.id || ('m_' + Date.now());
    const title = req.body.title || null;
    const type = req.body.type || (req.file ? 'photo' : 'text');
    const createdAt = Number(req.body.createdAt) || Date.now();
    const lat = parseFloat(req.body.lat);
    const lng = parseFloat(req.body.lng);
    const note = req.body.note || null;
    let filePath = null;
    let preview = req.body.preview || null;

    if (req.file) {
      // move to uploads with original name as safety
      const ext = path.extname(req.file.originalname) || '';
      const newName = id + ext;
      const dest = path.join(UPLOADS_DIR, newName);
      fs.renameSync(req.file.path, dest);
      filePath = '/uploads/' + newName;
      // set preview to filePath for images
      preview = preview || filePath;
    }

    const stmt = db.prepare('INSERT INTO memories (id,title,type,createdAt,lat,lng,note,filePath,preview) VALUES (?,?,?,?,?,?,?,?,?)');
    stmt.run(id, title, type, createdAt, lat, lng, note, filePath, preview);

    res.json({ success: true, id, filePath, preview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to save memory' });
  }
});

// simple health
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log('Server running on', PORT);
});
