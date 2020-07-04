// Set up as POST request method
// System authentication
// No additional authentication should be required

exports = async function(payload){
  const mongodb = context.services.get('mongodb-atlas');
  const intern = mongodb.db("ws_portal").collection("interns");
  const submission = mongodb.db("ws_portal").collection("submissions");
  const pp = payload.query.pp;
  const blankSubmission = {
    pp: pp,
    week1: 0,
		week2: 0,
		missed: 0,
		total: 0,
		description: '',
		submitted: false,
		dateSubmitted: '',
		approved: false,
		dateApproved: '',
		ppClosed: false,
		approvalClosed: false
  };
  const activeIntern = await intern.find({email: payload.query.email},{submissions:1, _id:0}).toArray();
  // return activeIntern[0].submissions;
  const internSubmissions = await submission.find({_id: {$in: activeIntern[0].submissions}, pp:pp}).toArray();
  // return internSubmissions;
  if (internSubmissions.length == 0) {
    const sub = await submission.insertOne(blankSubmission);
    await intern.updateOne(
      {email: payload.query.email},
      {$push: {submissions: {$each: [sub.insertedId], $position: 0}}
    });
    return sub.insertedId;
  } else {
    return 'Not executed to avoid duplicates';
  }
}