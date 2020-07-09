exports = async function(payload) {
    const mongodb = context.services.get('mongodb-atlas');
    const intern = mongodb.db("ws_portal").collection("interns");
    const submission = mongodb.db("ws_portal").collection("submissions");
    const activeInterns = await intern.find({activeStatus: true}).toArray();
    const res = []
    // return pool[0].submissions
    for(var i = 0; i < activeInterns.length; i ++){
      sub = await submission.find({pp: payload.query.pp, _id: {$in: activeInterns[i].submissions}}).toArray();
      res.push([activeInterns[i].email, sub])
    }
    return res
}
