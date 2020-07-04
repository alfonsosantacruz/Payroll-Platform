// Use of MongoDB Realm Webhooks

function consolidateInterns() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Intern')
  var interns = sheet.getDataRange().getValues();
  
  // Collects data stored in MongoDB Atlas for interns
  var webhook_interns = 'interns_webhook_get' // Insert webhook URL
  var mongoDBData_interns = UrlFetchApp.fetch(webhook_interns);
  var jsonObj_interns = JSON.parse(mongoDBData_interns);

// Prepares arrays to store unique email identifiers for interns and managers from MongoDB Atlas
  var internsArray = [];
  
  // Retrieves the email of the interns in MongoDB Atlas
  for (var i = 0; i < jsonObj_interns.length; i++) {internsArray.push(jsonObj_interns[i]['email']);}
  
  // Loops for the interns in the Sheet and checks whether they are in MongoDB Atlas
  for (var i = 1; i < interns.length; i++) {
    if (internsArray.includes(interns[i][1]) == true) {
      // check for updates and make changes
      var mongoManager = jsonObj_interns[internsArray.indexOf(interns[i][1])]['managerEmail'];
      var sheetManager = interns[i][4];
      var mongoRole = jsonObj_interns[internsArray.indexOf(interns[i][1])]['role'];
      var sheetRole = interns[i][2];
      
      if (mongoManager != sheetManager) {
        // Make the manager change
        var internEmail = jsonObj_interns[internsArray.indexOf(interns[i][1])]['email'];
        
        var formData = {
          'previousManagerEmail': mongoManager,
          'newManagerEmail': sheetManager,
          'newManagerName': interns[i][3],
          'newRole': sheetRole,
          'internEmail': internEmail
        };
        
        var params = {
          'method': 'post',
          'payload': formData
        };
        
        // webhook to make the managers change
        UrlFetchApp.fetch('consolidateManagersAndInterns', params); // Insert webhook URL
        
        // Difference in activeStatus in the sheet
        // Difference in the role
      } else if (mongoRole != sheetRole || interns[i][8] != interns[i][7]) {
        var internEmail = jsonObj_interns[internsArray.indexOf(interns[i][1])]['email'];
        
        var formData = {
          'newRole': sheetRole,
          'internEmail': internEmail,
          'activeStatus': interns[i][8]
        };
        
        var params = {
          'method': 'post',
          'payload': formData
        };
        
        // webhook to make the role change
        UrlFetchApp.fetch('consolidateStatusAndNewRole', params); // Insert webhook URL
      
        sheet.getRange(i + 1, 8).setValue(interns[i][8]);
      }
      
    } else {
      // Does not have the intern from sheet on MongoDB. Needs to be added
      // add intern to MongoDB
      var formData = {
        'name': interns[i][0],
        'email': interns[i][1],
        'role': interns[i][2],
        'manager': interns[i][3],
        'managerEmail': interns[i][4],
        'activeStatus': interns[i][8]
      };
      
      var params = {
        'method': 'post',
        'payload': formData
      };
      
      // webhook to create an intern and append to managers interns list
      UrlFetchApp.fetch('createNewIntern', params); // Insert webhook URL
      
      sheet.getRange(i + 1, 8).setValue(interns[i][8]);
    }
  } 
}


function consolidateManagers() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Manager');
  var managers = sheet.getDataRange().getValues();

  // Collects data stored in MongoDB Atlas for managers
  var webhook_managers = 'managers_webhook_get' // Insert webhook URL
  var mongoDBData_managers = UrlFetchApp.fetch(webhook_managers);
  var jsonObj_managers = JSON.parse(mongoDBData_managers);
  
  var managersArray = [];
  
  // Logger.log(jsonObj_managers);
    // Retrieves the email of the managers in MongoDB Atlas
  for (var i = 0; i < jsonObj_managers.length; i++) {
    if(managersArray.includes(jsonObj_managers[i]['email']) == false) {
      managersArray.push(jsonObj_managers[i]['email']);
    }
  }
  Logger.log(managersArray);
  
  // Loops through the managers in the Sheet and checks whether they are in MongoDB Atlas
  for (var i = 1; i < managers.length; i++) {
    if(managersArray.includes(managers[i][1]) == false) {
      var formData = {
        'name': managers[i][0],
        'email': managers[i][1],
        'activeStatus': managers[i][3]
      };
      
      var params = {
        'method': 'post',
        'payload': formData
      };
      
      // webhook to create an intern and append to managers interns list
      UrlFetchApp.fetch('createNewManager', params); // Insert webhook URL
      
      sheet.getRange(i + 1, 3).setValue(managers[i][3]);
    } else {
      // Check whether the activeStatus has changed
      if (managers[i][4] != managers[i][3]){
        var formData = {
        'email': managers[i][1],
        'activeStatus': managers[i][3]
      };
      
      var params = {
        'method': 'post',
        'payload': formData
      };
      
      // webhook to create an intern and append to managers interns list
      UrlFetchApp.fetch('updateManagerActiveStatus', params); // Insert webhook URL
      
      sheet.getRange(i + 1, 3).setValue(managers[i][3]);
      }
    }
  }
};



function pushCards() {
  var internSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Intern');
  var interns = internSheet.getDataRange().getValues();
  var cronsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Cron');
  var pp = cronsSheet.getRange(9, 2).getValue().toString();
  Logger.log(pp);
  for (var i = 1; i < interns.length; i ++) {
    if (interns[i][7] == true) {
      var formData = {
        'email':interns[i][1],
        'pp': pp
      };
      var params = {
        'method': 'post',
        'payload': formData
      };
      
      // Pushes cards to MongoDB through the webhook
      var resp = UrlFetchApp.fetch('incoming_webhook/pushCards', params); // Insert webhook URL
      Logger.log(interns[i][1]);
      Logger.log(resp.getContentText());
    }
  }
}



function pushAvailablePPs() {
  var managerSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Manager');
  var managers = managerSheet.getDataRange().getValues();
  var cronsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Cron');
  var pp = cronsSheet.getRange(9, 2).getValue().toString();
  Logger.log(pp);
  for (var i = 1; i < managers.length; i ++) {
    if (managers[i][2] == true) {
      var formData = {
        'email':managers[i][1],
        'pp': pp
      };
      var params = {
        'method': 'post',
        'payload': formData
      };
      
      // Pushes cards to MongoDB through the webhook
      var resp = UrlFetchApp.fetch('pushAvailablePPs', params); // Insert webhook URL
      Logger.log(managers[i][1]);
      Logger.log(resp.getContentText());
    }
  }
}



function closePP() {
  var cronsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Cron');
  var pp = cronsSheet.getRange(9, 2).getValue().toString();
  Logger.log(pp);
  
  var formData = {
    'pp': pp
  };
  
  var params = {
  'method': 'post',
  'payload': formData
  }; 
  
  UrlFetchApp.fetch('closePP', params); // Insert webhook URL
}



function closeApproval() {
  var cronsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Cron');
  var pp = cronsSheet.getRange(9, 3).getValue().toString();
  Logger.log(pp);
  
  var formData = {
    'pp': pp
  };
  
  var params = {
  'method': 'post',
  'payload': formData
  }; 
  
  UrlFetchApp.fetch('closeApproval', params); // Insert webhook URL
}

