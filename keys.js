// Includes all the keys for Google APIs, Google Sheets API and MongoDB
// The format is shared to be compatible with the rest of the app codebase, since these credenials are used in app.js and apis
// However, the tokens are not shared

module.exports = {
	google: {
		clientID: , // ClientID from your GCP project
		clientSecret: , // ClientSecret from your GCP project
	}, 
	sheets : {
		tokenID: "123456789blablabla" // The token ID of the Google Sheet file that is to be connected with
	},
	mongodb: {
		mongoURL: "mongodb+srv://..." // MongoDB URI that connects to the database in MongoDB Atlas
	}
};
