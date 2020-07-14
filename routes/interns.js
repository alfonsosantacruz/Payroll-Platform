var express = require("express"),
	router = express.Router(),
	Intern = require("../models/intern"),
	Submission = require("../models/submission"),
	Manager = require("../models/manager"),
	gsheetAPIs = require("../apis/gsheetAPIs"),
	stats = require("../apis/stats");


router.get("/", isLoggedIn, function(req, res){
	var absoluteEmail = res.locals.email;
	Intern.findOne({email: absoluteEmail}, function(err, intern){
		if(err) {
			console.log(err);
		} else if (intern == null){
			console.log('Found null intern');
			console.log(intern);
			Manager.findOne({email: absoluteEmail}, function(err, manager){
				if(err) {
					console.log(err);
				} else if (manager == null) {
					console.log('Found null manager')
					res.redirect("/notFound");
				} else {
					console.log(manager);
					res.redirect("/home")
				}
			});
		} else {
			res.redirect("/submissions");
		}
	});
});


router.get("/schedule", isLoggedIn, async (req, res, next) => {
	var absoluteEmail = res.locals.email;
	Manager.findOne({email: absoluteEmail}, async function(err, foundManager){
		if(err) {
			console.log(err);
		} else if (foundManager == null) {
			Intern.findOne({email: absoluteEmail}, async function(err, foundIntern){
				if (err) {
					console.log(err);
				} else {
					try {
						const rows = await gsheetAPIs.scheduleSheet();
						res.render("schedule", {rows:rows, user:'Intern'});
					} catch(err) {
						console.log(err);
						next(err);
					}
				}
			});
		} else {
			try {
				const rows = await gsheetAPIs.scheduleSheet();
				res.render("schedule", {rows: rows, user: 'Manager'});
			} catch(err) {
				console.log(err);
				next(err);
			}
		}
	});
});


router.get("/submissions", isLoggedIn, function(req, res){
	var absoluteEmail = res.locals.email;
	Intern.findOne({email: absoluteEmail}).populate("submissions").exec(async function(err, intern){
		if (err) {
			console.log(err);;
		} else {
			await stats.calcStats(absoluteEmail);
			res.render("dashboard", {user: intern});
		}
	});
});


router.post("/edit", function(req, res){
	const subId = req.body.subId;
	console.log(subId);
	// Submission.update({_id: subId}, {$set: {'submitted': false}}); 
	Submission.findOne({_id: subId}, function(err, foundSubmission){
		if(err) {
			console.log(err);
		} else {
			foundSubmission.set({submitted : false});
			foundSubmission.save(function(err, data){
				if(err){
					console.log(err);
				} else {
					console.log(data);
					res.redirect("/submissions");
				}
			});
		}
	});	
});


router.post("/report", isLoggedIn, function(req, res){
	const 	reportedWeek1 = parseFloat(req.body.week1),
			reportedWeek2 = parseFloat(req.body.week2),
		 	reportedMissed = parseFloat(req.body.missed),
		 	reportedTotal = reportedWeek1 + reportedWeek2 + reportedMissed,
		 	reportedJustification = req.body.justification,
		 	subId = req.body.subId,
		 	submissionDate = (new Date()).toString(),
		 	absoluteEmail = res.locals.email;
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
				dateSubmitted: submissionDate
			});
			foundSubmission.save(async function(err, data){
				if(err){
					console.log(err);
				} else {
					console.log(data);
					await stats.calcStats(absoluteEmail);
					res.redirect("/submissions");
				}
			});
		}
	});
});


router.post("/toggleViewSubmissions", isLoggedIn, function(req, res){
	var absoluteEmail = res.locals.email;
	Intern.findOne({email: absoluteEmail}, function(err, intern){
		if(err) {
			console.log(err);
		} else {
			if (intern.viewPreference == 'Cards'){
				intern.set({viewPreference: 'Rows'})
				intern.save(function(err, updatedIntern){
					if (err) {
						console.log(err);
					} else {
						console.log(updatedIntern);
						res.redirect("/submissions");
					}
				});
			} else {
				intern.set({viewPreference: 'Cards'})
				intern.save(function(err, updatedIntern){
					if (err) {
						console.log(err);
					} else {
						console.log(updatedIntern);
						res.redirect("/submissions");
					}
				});
			}
		}
	}); 
});


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
    	console.log(req.user.email);
    	res.locals.email = req.user.email;
        return next();
    }
    res.redirect("/login");
}

module.exports = router;
