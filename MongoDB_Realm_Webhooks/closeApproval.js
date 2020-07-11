// Set up as POST request method
// System authentication
// No additional authentication should be required

exports = async function(payload){
  const mongodb = context.services.get('mongodb-atlas');
  const submission = mongodb.db("ws_portal").collection("submissions");
  const approvedSubs = await submission.find({approvalClosed: false, ppClosed: true, pp:payload.query.pp, approved: true}, {_id: 1}).toArray();
  const untouchedSubs = await submission.find({approvalClosed: false, ppClosed: true, pp:payload.query.pp, approved: false}, {_id: 1}).toArray();
  const approvedSubsArray = [];
  const untouchedSubsArray = [];
  const submissionDate = (new Date()).toString();
  // return submissionsArray;
  
  for (let i = 0; i < approvedSubs.length; i++){
    approvedSubsArray.push(approvedSubs[i]._id)
  }
  
  for (let i = 0; i < untouchedSubs.length; i++){
    untouchedSubsArray.push(untouchedSubs[i]._id)
  }
  
  await submission.updateMany(
    {_id: {$in: approvedSubsArray}},
    {$set: {approvalClosed: true}}
  );
  
  await submission.updateMany(
    {_id: {$in: untouchedSubsArray}},
    {$set: {approvalClosed: true, approved: true, dateApproved: submissionDate, approvedBy: 'MiPay Default Approval'}}
  );
}
