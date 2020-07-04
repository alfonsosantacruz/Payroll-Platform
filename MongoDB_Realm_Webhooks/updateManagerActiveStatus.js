// Set up as POST request method
// System authentication
// No additional authentication should be required

exports = async function(payload){
  const mongodb = context.services.get('mongodb-atlas');
  const manager = mongodb.db("ws_portal").collection("managers");
  await manager.updateOne(
    {email: payload.query.email},
    {$set: {activeStatus: (payload.query.activeStatus == 'true')}}
  );
}