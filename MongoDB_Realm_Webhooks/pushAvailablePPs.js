// Set up as POST request method
// System authentication
// No additional authentication should be required

exports = async function(payload){
  const mongodb = context.services.get('mongodb-atlas');
  const manager = mongodb.db("ws_portal").collection("managers");
  const submission = mongodb.db("ws_portal").collection("submissions");
  const pp = payload.query.pp;
  const activeManagers = await manager.find({email: payload.query.email},{payPeriodsAvailable:1, _id:0}).toArray();
  // return activeManagers;
  if(activeManagers[0].payPeriodsAvailable.includes(pp)){
    return 'Pay Period already Included. Wont be added to avoid duplicates' 
  } else {
    await manager.updateOne(
      {email: payload.query.email,},
      {$push: {payPeriodsAvailable: {$each: [pp], $position: 0}}
    });
    return 'Added ' + pp
  }
}
