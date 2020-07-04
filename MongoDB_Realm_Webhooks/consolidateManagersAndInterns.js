// Set up as POST request method
// System authentication
// No additional authentication should be required

exports = async function(payload){
  const mongodb = context.services.get('mongodb-atlas');
  const manager = mongodb.db("ws_portal").collection("managers");
  const intern = mongodb.db("ws_portal").collection("interns");
  const newIntern = await intern.findOne({email: payload.query.internEmail});
  await manager.updateOne(
    {email: payload.query.previousManagerEmail},
    {$pull: {interns: newIntern._id}}
  );
  await manager.updateOne(
    {email: payload.query.newManagerEmail},
    {$push: {interns: newIntern._id}}
  );
  await intern.updateOne(
    {email: payload.query.internEmail},
    {$set: {manager: payload.query.newManagerName, managerEmail: payload.query.newManagerEmail, role: payload.query.newRole}}
  );
  
  return {result: 'Update Made'}
}