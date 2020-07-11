var mongoose = require("mongoose");

var internSchema = mongoose.Schema({
	email: String,
	name: String,
	role: String,
	manager: String,
	managerEmail: String,
	submissions: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Submission"
		}
	],
	totalHours: Number,
	average: Number,
	activeStatus: Boolean,
	viewPreference: String,
	imagePath: String
});


module.exports = mongoose.model("Intern", internSchema);
