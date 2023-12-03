const express = require('express');

const app = express();
const port = process.env.PORT || 5000;
// const path = require('path');
// const bodyParser = require('body-parser');
const indexFile = require('./routes/index');

app.use(express.json());
app.use(indexFile);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
