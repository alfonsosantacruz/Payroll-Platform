// Set up as GET request method
// System authentication
// No additional authentication should be required

exports = function(payload){
  const mongodb = context.services.get('mongodb-atlas');
  const collection = mongodb.db("ws_portal").collection("interns");
  return collection.find({}).toArray();
}