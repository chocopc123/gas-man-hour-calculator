function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function run() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
  const parentDatabaseID = PropertiesService.getScriptProperties().getProperty('DATABASE_URL');
  let options = {
    'method' : 'post',
    'contentType': 'application/json',
    'headers': {
      'Notion-Version': '2021-05-13',
      'Authorization': `Bearer ${apiKey}`
    },
    "sorts": [
      {
        "property": "Time",
        "direction": "descending"
      }
    ]
  };
  const pageID = getDatabase(options, parentDatabaseID)[0].id;
  console.log('最新ページID: ' + pageID);
  options = {
    'method' : 'get',
    'contentType': 'application/json',
    'headers': {
      'Notion-Version': '2021-05-13',
      'Authorization': `Bearer ${apiKey}`
    }
  };
  const databaseID = getBlocks(options, pageID)
  console.log('ページ内データベースID: ' + databaseID);
  options = {
    'method' : 'post',
    'contentType': 'application/json',
    'headers': {
      'Notion-Version': '2021-05-13',
      'Authorization': `Bearer ${apiKey}`
    },
    "sorts": [
      {
        "property": "Endtime",
        "direction": "ascending"
      }
    ]
  };
  const manHourData = getDatabase(options, databaseID);
  const manHourResult = calcManHour(manHourData);
  console.log(manHourResult);
  return manHourResult;
}


/**        関数        **/
function getDatabase(options, databaseID) {
  const apiURL = `https://api.notion.com/v1/databases/${databaseID}/query`;
  const response = UrlFetchApp.fetch(apiURL, options).getContentText();
  const responseJson = JSON.parse(response);
  return responseJson.results;
}

function getBlocks(options, pageID) {
  const apiURL = `https://api.notion.com/v1/blocks/${pageID}/children?page_size=100`;
  const response = UrlFetchApp.fetch(apiURL, options).getContentText();
  const responseJson = JSON.parse(response);
  const results = responseJson.results;
  return results[0].id;
}

function calcManHour(manHourData) {
  const usageJson = {};
  manHourData.forEach(function(data) {
    if(!data.properties.Category) {
      return true;
    }
    const index = data.properties.Category.select.name;
    const usage = data.properties.Usage.rich_text[0].plain_text;
    if(usageJson[index]){
      usageJson[index] += convertIntMinutes(usage);
    } else {
      usageJson[index] = convertIntMinutes(usage);
    }
  });
  return convertStringTime(usageJson);
}

function convertIntMinutes(time) {
  if(time.includes('h')){
    const numbers = time.split('h');
    let minutes = parseInt(numbers[0], 10) * 60
    if(numbers[1]) {
      minutes += parseInt(numbers[1], 10);
    }
    return minutes;
  }
  return parseInt(time, 10);
}

function convertStringTime(json) {
  Object.keys(json).forEach(function(key) {
    const hour = Math.floor(json[key] / 60);
    const rem = json[key] % 60;
    const stringTime = createStringTime(hour, rem);
    json[key] = stringTime;
  });
  return json;
}

function createStringTime(hour, rem) {
  const stringHour = hour + 'h';
  if(rem !== 0) {
    return stringHour + rem + 'm';
  } else {
    return stringHour;
  }
}

function testOutputJson(json) {
  Object.keys(json).forEach(function(key) {
    console.log(key + ': ' + json[key]);
  });
}