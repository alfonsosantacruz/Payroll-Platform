var express = require("express"),
	router = express.Router(),
	Intern = require("../models/intern"),
	Submission = require("../models/submission"),
	Manager = require("../models/manager"),
	gsheetAPIs = require("../apis/gsheetAPIs"),
	stats = require("../apis/stats");


router.get("/directory", isLoggedIn, function(req, res) {
	var absoluteEmail = res.locals.email;
	Manager.findOne({email: absoluteEmail}, function(err, foundManager){
		if(err) {
			console.log(err);
		} else {
			const internsManager = foundManager.interns;
			console.log(internsManager);
			Intern.find({_id: {$in: internsManager}}, function(err, interns){
				if(err){
					console.log(err);
				} else {
					res.render("directory", {interns: interns});
				}
			});
		}
	});
});

router.get("/home", isLoggedIn, async function(req, res){
	var absoluteEmail = res.locals.email,
		currentPP = await gsheetAPIs.ppName();
	console.log(currentPP);
	console.log(res.locals);
	Manager.findOne({email: absoluteEmail}, function(err, manager){
		if(err) {
			console.log(err);
		} else {
			const internsArray = manager.interns;
			Intern.find({_id: {$in: internsArray}}, async function(err, interns){
				if(err) {
					console.log(err);
				} else {
					console.log(interns)
					Submission.find({pp: currentPP}, function(err, activeSubmissions) {
						if(err) {
							console.log(err);
						} else {
							res.render("managers", {currentPP:currentPP, manager: manager, interns: interns, submissions: activeSubmissions});
						}
					});	
				}
			});
		}
	});
});

router.get("/home/:pp", isLoggedIn, function(req, res){
	var absoluteEmail = res.locals.email;
	const selectedPP = req.params.pp.replace(/%20/g, " ");
	console.log(selectedPP);
	Manager.findOne({email: absoluteEmail}, function(err, manager){
		if(err) {
			console.log(err);
		} else {
			const internsArray = manager.interns;
			Intern.find({_id: {$in: internsArray}}, function(err, interns){
				if(err) {
					console.log(err);
				} else {
					console.log(interns)
					Submission.find({pp: selectedPP}, function(err, activeSubmissions) {
						if(err) {
							console.log(err);
						} else {
							res.render("managers", {currentPP:selectedPP, manager: manager, interns: interns, submissions: activeSubmissions});
						}
					});	
				}
			});
		}
	});
});


router.get("/submissions/:id", isLoggedIn, function(req, res){
	var absoluteEmail = res.locals.email;
	const internId = req.params.id;
	console.log(internId);
	Manager.findOne({email: absoluteEmail}, function(err, manager){
		if(err) {
			console.log(err);
		} else {
			Intern.findOne({_id: internId}).populate("submissions").exec(async function(err, intern){
				if (err) {
					console.log(err);;
				} else {
					const internSubmissions = intern.submissions;
					await stats.calcStats(intern.email);
					res.render("profile", {manager: manager, submission: internSubmissions, user: intern});
				}
			});
		}
	});
});


router.post("/editByManager", function(req, res){
	const subId = req.body.subId;
	const internId = req.body.internId;
	console.log(subId);
	console.log(internId);
	// Submission.update({_id: subId}, {$set: {'submitted': false}}); 
	Submission.findOne({_id: subId}, function(err, foundSubmission){
		if(err) {
			console.log(err);
		} else {
			foundSubmission.set({submitted : false, approved: false});
			foundSubmission.save(function(err, data){
				if(err){
					console.log(err);
				} else {
					console.log(data);
					res.redirect("/submissions/" + internId);
				}
			});
		}
	});	
});


router.post("/manageredit", function(req, res){
	const subId = req.body.subId,
		sTopVal = req.body.sTopVal;
	console.log(subId);
	console.log(sTopVal);
	res.locals.scrollTop = sTopVal;
	Submission.findOne({_id: subId}, function(err, foundSubmission){
		if(err) {
			console.log(err);
		} else {
			foundSubmission.set({approved : false});
			foundSubmission.save(function(err, data){
				if(err){
					console.log(err);
				} else {
					console.log(data);
					res.redirect("/home");
				}
			});
		}
	});	
});

router.post("/reportByManager", function(req, res){
	const 	reportedWeek1 = parseFloat(req.body.week1),
			reportedWeek2 = parseFloat(req.body.week2),
		 	reportedMissed = parseFloat(req.body.missed),
		 	reportedTotal = reportedWeek1 + reportedWeek2 + reportedMissed,
		 	reportedJustification = req.body.justification.replace(/(\r\n|\n|\r)/gm, ""),
		 	subId = req.body.subId,
		 	submissionDate = (new Date()).toString(),
		 	approver = req.body.approverName,
		 	internId = req.body.internId;
 	Intern.findOne({_id: internId}, function(err, foundIntern){
 		if(err) {
 			console.log(err);;
 		} else {
 			Submission.findOne({_id: subId}, function(err, foundSubmission){
				if(err) {
					console.log(err);
				} else {
					foundSubmission.set({
						week1: reportedWeek1,
						week2: reportedWeek2,
						missed: reportedMissed,
						total: reportedTotal,
						description: reportedJustification,
						submitted: true,
						dateSubmitted: submissionDate,
						approved: true,
						dateApproved: submissionDate,
						approvedBy: approver
					});
					foundSubmission.save(async function(err, data){
						if(err){
							console.log(err);
						} else {
							console.log(data);
							await stats.calcStats(foundIntern.email);
							res.redirect("/submissions/" + internId);
						}
					});
				}
			});
 		}
 	});
});


router.post("/approve", function(req, res){
	const 	reportedWeek1 = parseFloat(req.body.week1),
			reportedWeek2 = parseFloat(req.body.week2),
		 	reportedMissed = parseFloat(req.body.missed),
		 	reportedTotal = reportedWeek1 + reportedWeek2 + reportedMissed,
		 	reportedJustification = req.body.justification.replace(/(\r\n|\n|\r)/gm, ""),
		 	subId = req.body.subId,
		 	approvalDate = (new Date()).toString(),
		 	approver = req.body.approverName,
		 	sTopVal = req.body.sTopVal,
		 	internId = req.body.internId;
	console.log('Triggered approve route');
	console.log(sTopVal);
	res.locals.scrollTop = sTopVal;
	Submission.findOne({_id: subId}, function(err, foundSubmission){
		if(err) {
			console.log(err);
		} else {
			foundSubmission.set({
				week1: reportedWeek1,
				week2: reportedWeek2,
				missed: reportedMissed,
				total: reportedTotal,
				description: reportedJustification,
				submitted: true,
				dateSubmitted: approvalDate,
				approved: true,
				dateApproved: approvalDate,
				approvedBy: approver
			});
			foundSubmission.save(async function(err, data){
				if(err){
					console.log(err);
				} else {
					console.log(data);
					Intern.findOne({_id: internId}, async function(err, foundIntern){
						if(err){
							console.log(err);
						} else {
							await stats.calcStats(foundIntern.email);
							console.log(foundIntern);
							res.redirect("/home");
						}
					});
				}
			});
		}
	});
});


router.post("/approveall", isLoggedIn, async function(req, res){
	var absoluteEmail = res.locals.email;
	var currentPP = await gsheetAPIs.ppName();
	console.log(currentPP);
	Manager.findOne({email: absoluteEmail}, function(err, manager){
		if(err) {
			console.log(err);
		} else {
			const internsArray = manager.interns;
			Intern.find({_id: {$in: internsArray}}, function(err, interns){
				if(err) {
					console.log(err);
				} else {
					console.log(interns)
					Submission.find({pp: currentPP}, function(err, activeSubmissions) {
						if(err) {
							console.log(err);
						} else {
							const approvalDate = (new Date()).toString()
							activeSubmissions.forEach(function(submission, index){
	    						interns.forEach(function(intern, indexIntern){
	    							if(intern.submissions.includes(submission._id)){
	    								submission.set({approved: true, dateApproved: approvalDate, approvedBy: manager.name});
	    								submission.save(function(err, updatedSubmission){
	    									if(err) {
	    										console.log(err);
	    									} else {
	    										console.log(updatedSubmission);
	    									}
	    								});
	    							}
	    						});
	    					});
							res.redirect("/home");
						}
					});	
				}
			});
		}
	});
});


router.post("/toggleViewHome", isLoggedIn, function(req, res){
	var absoluteEmail = res.locals.email;
	Manager.findOne({email: absoluteEmail}, function(err, manager){
		if(err) {
			console.log(err);
		} else {
			if (manager.viewPreference == 'Cards'){
				manager.set({viewPreference: 'Rows'})
				manager.save(function(err, updatedManager){
					if (err) {
						console.log(err);
					} else {
						console.log(updatedManager);
						res.redirect("/home");
					}
				});
			} else {
				manager.set({viewPreference: 'Cards'})
				manager.save(function(err, updatedManager){
					if (err) {
						console.log(err);
					} else {
						console.log(updatedManager);
						res.redirect("/home");
					}
				});
			}
		}
	}); 
});


router.post("/toggleViewProfile", isLoggedIn, function(req, res){
	var absoluteEmail = res.locals.email,
	    internId = req.body.internId;
	Manager.findOne({email: absoluteEmail}, function(err, manager){
		if(err) {
			console.log(err);
		} else {
			if (manager.viewPreference == 'Cards'){
				manager.set({viewPreference: 'Rows'})
				manager.save(function(err, updatedManager){
					if (err) {
						console.log(err);
					} else {
						console.log(updatedManager);
						res.redirect("/submissions/" + internId);
					}
				});
			} else {
				manager.set({viewPreference: 'Cards'})
				manager.save(function(err, updatedManager){
					if (err) {
						console.log(err);
					} else {
						console.log(updatedManager);
						res.redirect("/submissions/" + internId);
					}
				});
			}
		}
	}); 
});


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
    	console.log(req.user.email);
    	console.log(req.body);
    	res.locals.email = req.user.email;
        return next();
    }
    res.redirect("/login");
}

module.exports = router;
