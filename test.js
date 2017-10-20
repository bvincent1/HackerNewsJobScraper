'use strict'
const handler = require('./handler')
handler.cron(null, null, (err, output) => {
  console.log(output);
});
