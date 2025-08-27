const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '26-08-20-09game.html'));
});

// dnešní test: /menu/:key -> ./menu/<key>.html
app.get('/menu/:key', (req, res) => {
  res.sendFile(path.join(__dirname, 'menu', req.params.key + '.html'));
});

// budoucí alias jako v produkci
app.get('/ui/menu/:key', (req, res) => {
  res.sendFile(path.join(__dirname, 'menu', req.params.key + '.html'));
});

app.listen(PORT, () => console.log(`Server běží na http://localhost:${PORT}`));
