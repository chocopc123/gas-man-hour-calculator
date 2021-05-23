function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function run(title = null) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
  const parentDatabaseID = PropertiesService.getScriptProperties().getProperty('DATABASE_URL');
  const titleColumnName = 'Title'
  const parentTimeColumnName = 'Time'
  const endTimeColumnName = 'Endtime';
  const categoryColumnName = 'Category';

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
          "property": parentTimeColumnName,
          "direction": "descending"
        }
      ]
    })
  };
  const pageList = getDatabase(options, parentDatabaseID);
  const pageID = getPageId(pageList, title, titleColumnName);

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
          "property": endTimeColumnName,
          "direction": "ascending"
        }
      ]
    })
  };
  const manHourData = getDatabase(options, databaseID);
  const [json, colorJson] = calcManHour(manHourData, endTimeColumnName, categoryColumnName);
  return [json, colorJson];
}

function getPageId(pageList, title, titleColumnName) {
  let pageID = null;
  if(title) {
    Object.keys(pageList).forEach(function(key) {
      const pageListTitle = pageList[key].properties[titleColumnName].title[0];
      if(pageListTitle && pageListTitle.plain_text === title) {
        pageID = pageList[key].id;
      }
    });
  }
  if(!pageID) {
    pageID = pageList[0].id;
  }
  return pageID;
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
