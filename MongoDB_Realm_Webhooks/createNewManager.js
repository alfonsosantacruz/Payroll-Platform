// Set up as POST request method
// System authentication
// No additional authentication should be required

exports = async function(payload){
  const mongodb = context.services.get('mongodb-atlas');
  const manager = mongodb.db("ws_portal").collection("managers");
  const intern = mongodb.db("ws_portal").collection("interns");
  const internsArray = []
  await manager.insertOne(payload.query);
  const cursor = await intern.find({managerEmail: payload.query.email}, {_id: 1}).toArray();
  for (let i = 0; i < cursor.length; i++) {
    internsArray.push(cursor[i]._id);
  };
  await manager.updateOne(
    {email: payload.query.email},
    {$set: {interns: internsArray, payPeriodsAvailable: [], activeStatus: (payload.query.activeStatus == 'true'), viewPreference: 'Cards'}}
  );
  return internsArray
}
