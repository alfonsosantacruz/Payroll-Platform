var Intern = require("../models/intern"),
	Submission = require("../models/submission"),
	Manager = require("../models/manager"),
	async = require('async'),
	gsheetAPIs = require("./gsheetAPIs"),
	stats = require("./stats");


function consolidateManager(user) {
	Manager.findOne({email: user.Email}, async function(err, foundManager){
		if (err) {
			console.log(err);
		} else { 
			if (foundManager == null) {
				console.log('Manager not found');
				var newManager = new Manager({
					email: user.Email,
					name: user.Name,
					activeStatus: (user.Active_Status_WS == "TRUE")
				});
				newManager.save(async function(err, manager){
					if(err){
						console.log(err);
					} else {
						console.log('Newly created Manager: ')
						console.log(manager.email);
					 	user.Active_Status_MiPay = manager.activeStatus;
			  			await user.save();
					}
				});
			} else {
				console.log('Printing the user and its status from WS Portal');
				console.log(user.Email);
				console.log(user.Active_Status_WS);
				user.Active_Status_MiPay = user.Active_Status_WS;
			  	await user.save();
				foundManager.set({activeStatus: (user.Active_Status_WS == "TRUE")});
				foundManager.save(function(err, data){
					if(err){
						console.log(err);
					} else {
						console.log('Comparing the saved manager status');
						console.log(data.email);
						console.log(data.activeStatus);
					}
				});
			}
		}
	}); 
}


function consolidateIntern(user) {
	Intern.findOne({email: user.Email}, async function(err, foundIntern){
		if (err) {
			console.log(err);
		} else { 
			if (foundIntern == null) {
				console.log('Intern not found');
				var newIntern = new Intern({
					email: user.Email,
					name: user.Name,
					role: user.Position,
					manager: user.Manager,
					managerEmail: user.Manager_Email,
					activeStatus: (user.Active_Status_WS == "TRUE"),
					totalHours: 0,
					average: 0
				}); newIntern.save(async function(err, intern){
					if(err){
						console.log(err);
					} else {
						console.log('Newly created Intern: ')
						console.log(intern.email);
					 	user.Active_Status_MiPay = intern.activeStatus;
			  			await user.save();
			  			consolidateManagersAndInterns(intern, user);
					}
				});
			} else {
				if(foundIntern.managerEmail != user.Manager_Email){
					consolidateManagersAndInterns(foundIntern, user);
				}
				console.log('Printing the user in the iteration');
				console.log(user.Email);
				console.log(user.Active_Status_WS);
				user.Active_Status_MiPay = user.Active_Status_WS;
			  	await user.save();
				foundIntern.set({role: user.Position, activeStatus: (user.Active_Status_WS == "TRUE")});
				foundIntern.save(function(err, data){
					if(err){
						console.log(err);
					} else {
						console.log('Comparing the saved intern status');
						console.log(data.email);
						console.log(data.activeStatus);
					}
				});
			}
		}
	}); 
}


function consolidateManagersAndInterns (intern, user) {
	Manager.findOne({email: intern.managerEmail}, function(err, foundPreviousManager){
		const internsArray = foundPreviousManager.interns;
		internsArray.forEach(function(intern_id, index){
			if (intern_id == intern._id){
				internsArray.splice(index, 1);
				foundPreviousManager.save(function(err, updatedPreviousManager){
					if(err){
						console.log(err);
					} else {
						console.log(updatedPreviousManager);
					}
				});
			}
		});
	});
	Manager.findOne({email: user.Manager_Email}, function(err, foundNewManager){
		foundNewManager.interns.push(intern);
		foundNewManager.save(function(err, updatedNewManager){
			if(err){
				console.log(err);
			} else {
				console.log(updatedNewManager);
				intern.set({manager: updatedNewManager.name, managerEmail: updatedNewManager.email});
				intern.save(function(err, updatedIntern){
					if(err){
						console.log(err);
					} else {
						console.log(updatedIntern);
					}
				});
			}
		});
	});
}


function done() {
	console.log('User Complete')
}



module.exports = {
	closePP: function closePayPeriod(ppToClose) {
		Submission.find({
			ppClosed: false,
			pp: ppToClose
		}, function(err, submissionsArray){
			if (err) {
				console.log(err);
			} else {
				const submissionDate = (new Date()).toString();
				submissionsArray.forEach(function(activeCard, index){
					activeCard.set({ppClosed : true , submitted: true, dateSubmitted: submissionDate});
					activeCard.save(function(err, updatedCard){
						if (err) {
							console.log(err);
						} else {
							console.log(updatedCard._id);
							console.log(updatedCard.ppClosed)
						}
					});
				});
			}
		});
	},

	closeApprovalPeriod: function closeApprovalPeriod(ppToClose) {
		Submission.find({
			approvalClosed: false,
			ppClosed: true, 
			pp: ppToClose
		}, function(err, submissionsArray){
			if (err) {
				console.log(err);
			} else {
				const approvalDate = (new Date()).toString();
				submissionsArray.forEach(function(activeCard, index){
					activeCard.set({approvalClosed : true , approved: true, dateApproved: approvalDate});
					activeCard.save(function(err, updatedCard){
						if (err) {
							console.log(err);
						} else {
							console.log(updatedCard._id);
							console.log(updatedCard.approvalClosed);
						}
					});
				});
			}
		});
	},

	pushCards: async function pushCards(){
		const ppNameVal = await gsheetAPIs.ppName();
		var blankSubmission = {
			pp: ppNameVal,
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
		Intern.find({
				activeStatus: true
		}, function(err, interns){
			if(err) {
				console.log(err);
			} else {
				console.log(interns);
				interns.forEach(function(activeIntern, index){
					const internSubmissions = activeIntern.submissions;
					Submission.find({_id: {$in: internSubmissions}, pp:ppNameVal}, function(err, activeInternSubmissions){
						if(err){
							console.log(err);
						} else {
							console.log('Active Intern Submissions');
							console.log(activeInternSubmissions);
							if(activeInternSubmissions.length == 0) {
								Submission.create(blankSubmission, function(err, submission){
									activeIntern.submissions.unshift(submission);
									activeIntern.save(function(err, updatedIntern){
										if (err) {
											console.log(err);
										} else {
											console.log(updatedIntern);
										}
									});
								});
							}
						}
					});
				});
			}
		});
	},


	pushAvailablePayPeriods: async function pushAvailablePayPeriods(){
		const ppNameVal = await gsheetAPIs.ppName();
		Manager.find({
				activeStatus: true
		}, function(err, managers){
			if(err) {
				console.log(err);
			} else {
				// console.log(managers);
				managers.forEach(function(activeManager, index){
					if(activeManager.payPeriodsAvailable.indexOf(ppNameVal) == -1) {
						activeManager.payPeriodsAvailable.unshift(ppNameVal);
						activeManager.save(function(err, updatedManager){
							if (err) {
								console.log(err);
							} else {
								console.log(updatedManager);
							}
						});
					}
				});
			}
		});
	},

	consolidateInternsDBs: async function consolidateInternsDBs() {
		var sheet = await gsheetAPIs.getSheet(1);
		var rows = await sheet.getRows();
		console.log(rows.length);
		async.eachSeries(rows, function(user, done) {
			consolidateIntern(user);
			done();
		}, function allDone (err) {
			console.log(err);
		});
	},

	consolidateManagersDBs: async function consolidateManagersDBs() {
		var sheet = await gsheetAPIs.getSheet(2);
		var rows = await sheet.getRows();
		console.log(rows.length);
		async.eachSeries(rows, function(user, done) {
			consolidateManager(user);
			done();
		}, function allDone (err) {
			console.log(err);
		});
	}
};
