const mongoose = require('mongoose');
let childrenSchema = mongoose.Schema({
	//name:{first:String,last:String},
	nick:String,
	msg:String,
	//created:{type: Date , default: Date.now}
});
let parentSchema = mongoose.Schema({
  messages : [childrenSchema]
});
module.exports = mongoose.model('message', parentSchema);
