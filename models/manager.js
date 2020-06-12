var mongoose = require("mongoose");

var managerSchema = mongoose.Schema({
	email: String,
	name: String
	interns: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Intern"
		}
	]
});

module.exports = mongoose.model("Manager", managerSchema);