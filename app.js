function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function run() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
  const parentDatabaseID = PropertiesService.getScriptProperties().getProperty('DATABASE_URL');
  let options = {
    'method' : 'post',
    'headers': {
      'Content-Type': 'application/json',
      'Notion-Version': '2021-05-13',
      'Authorization': `Bearer ${apiKey}`,
    },
    'payload': JSON.stringify({
      "sorts": [
        {
          "property": "Time",
          "direction": "descending"
        }
      ]
    })
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
    'headers': {
      'Content-Type': 'application/json',
      'Notion-Version': '2021-05-13',
      'Authorization': `Bearer ${apiKey}`
    },
    'payload': JSON.stringify({
      "sorts": [
        {
          "property": "Endtime",
          "direction": "ascending"
        }
      ]
    })
  };
  const manHourData = getDatabase(options, databaseID);
  const [json, colorJson] = calcManHour(manHourData);
  return [json, colorJson];
}

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
