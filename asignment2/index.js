const express = require('express');
const path = require('path');

const requestLogger = require('./middleware/requestLogger');
const siteRoutes = require('./routes/siteRoutes');
const formRoutes = require('./routes/formRoutes');

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(express.static(path.join(__dirname, 'public')));

app.use(siteRoutes);
app.use(formRoutes);

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
