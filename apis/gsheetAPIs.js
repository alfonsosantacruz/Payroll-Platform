var { GoogleSpreadsheet } = require('google-spreadsheet'),
	keys = require('../keys');

// path to file with the client secret from GCP
const creds = require('../**************.json')

async function getSheet(n) {
	const doc = new GoogleSpreadsheet(keys.sheets.tokenID);
	await doc.useServiceAccountAuth((creds));
	await doc.loadInfo();
	const sheet = doc.sheetsByIndex[n];

	return sheet
}


module.exports = {
	getSheet: async function getSheet(n) {
		const doc = new GoogleSpreadsheet(keys.sheets.tokenID);
		await doc.useServiceAccountAuth((creds));
		await doc.loadInfo();
		const sheet = doc.sheetsByIndex[n];

		return sheet
	},
	
	scheduleSheet: async function miPayScheduleSheet() {
		const sheet = await getSheet(0);
		const rows = await sheet.getRows();
		
		return rows
	},

	ppName: async function getPPName() {
		const sheet = await getSheet(3);
		await sheet.loadCells('A1:I9');
		const ppName = await sheet.getCellByA1('B9');
		
		return ppName.value
	},

	getWeekNum: async function getWeekNum() {
		const sheet = await getSheet(3);
		await sheet.loadCells('A1:I9');
		const currentWeekNum = await sheet.getCellByA1('B5');
		
		return currentWeekNum.value
	}
};
