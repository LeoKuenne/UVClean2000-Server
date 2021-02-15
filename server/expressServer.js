const express = require('express');

const app = express();

app.set('view engine', 'pug');

app.use(express.static(`${__dirname}/dist`));

app.listen(3000, () => {
  console.log('listening on 3000');
});

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/dist/index.html`);
});
