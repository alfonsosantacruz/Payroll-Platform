// Set up as POST request method
// System authentication
// No additional authentication should be required

exports = async function(payload){
  const mongodb = context.services.get('mongodb-atlas');
  const intern = mongodb.db("ws_portal").collection("interns");
  const manager = mongodb.db("ws_portal").collection("managers");
  await intern.insertOne(payload.query);
  await intern.updateOne(
    {email: payload.query.email},
    {$set: {submissions: [], totalHours: 0, average: 0, activeStatus: (payload.query.activeStatus == 'true')}}
  );
  const newIntern = await intern.findOne({email: payload.query.email});
  await manager.updateOne(
    {email: payload.query.managerEmail},
    {$push: {interns: newIntern._id}}
  );
}
