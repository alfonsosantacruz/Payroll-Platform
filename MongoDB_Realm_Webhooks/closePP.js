// Set up as POST request method
// System authentication
// No additional authentication should be required

exports = async function(payload){
  const mongodb = context.services.get('mongodb-atlas');
  const submission = mongodb.db("ws_portal").collection("submissions");
  const pp = payload.query.pp;
  const submissionsArray = await submission.find({ppClosed: false, pp:payload.query.pp}, {_id: 1}).toArray();
  const subs = [];
  const submissionDate = (new Date()).toString();
  // return submissionsArray;
  for (let i = 0; i < submissionsArray.length; i++){
    subs.push(submissionsArray[i]._id)
  }
  await submission.updateMany(
    {_id: {$in: subs}},
    {$set: {ppClosed: true, submitted: true, dateSubmitted: submissionDate}}
  );
}