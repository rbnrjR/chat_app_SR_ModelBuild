const redis = require('redis'),
      client = redis.createClient(),
      mongoose = require('mongoose'),
      db = mongoose.createConnection('mongodb://localhost/rubanraj');
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connected to MongoDB');
});
client.on('connect', function() {
  console.log('connected to redis');
});
let i = 2;
client.hgetall('chatText:'+i, (err, reply) => {
  if (err) {
    console.log(err);
  }
  db.collection('details').save(reply, (err) => {
    if (err) {
      console.log(err);
    }
  });
});
