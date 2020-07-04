// Set up as POST request method
// System authentication
// No additional authentication should be required

exports = async function(payload){
  const mongodb = context.services.get('mongodb-atlas');
  const intern = mongodb.db("ws_portal").collection("interns");
  await intern.updateOne(
    {email: payload.query.internEmail},
    {$set: {role: payload.query.newRole, activeStatus: (payload.query.activeStatus == 'true')}}
  );
}