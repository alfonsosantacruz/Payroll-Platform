var Intern = require("../models/intern"),
	Submission = require("../models/submission");

module.exports = {
	calcStats: async function calculateStats(inputEmail){
		let totalHours = 0
		let average = 0
		Intern.findOne({email: inputEmail}, function(err, intern){
			if (err) {
				console.log(err);;
			} else {
				const internSubmissions = intern.submissions;
				Submission.find({
					_id: { $in: internSubmissions}
				}, function(err, submissions){
					if(err){
						console.log(err);
					} else {
						submissions.forEach(function(sub, index){
							// console.log(sub.total);
							totalHours += sub.total;
						});
					} average = totalHours/(submissions.length*2)
					  // console.log(average);
					  // console.log(totalHours);
					  intern.set({totalHours: totalHours, average: average});
					  intern.save(function(err, updatedIntern){
					  	if (err) {
					  		console.log(err);
					  	} else {
					  		console.log(updatedIntern);
					  	}
					});
				}); 
			} 
		});
	},

	bestTotal: async function suggestTotal(currentTotal, numWeeks) {
		let recommendedTotal = 7.5*(numWeeks + 2) - currentTotal;
		if(recommendedTotal < 0){
			return 0
		} else if (recommendedTotal > 15){
			return 15
		} else {
			return recommendedTotal
		}
	}
};
