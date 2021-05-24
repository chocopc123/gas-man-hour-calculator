import { calcManHour } from "./calculate";

export function doGet(): GoogleAppsScript.HTML.HtmlOutput {
  return HtmlService.createTemplateFromFile("src/app")
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

export function run(title = ""): any {
  const apiKey = PropertiesService.getScriptProperties().getProperty("API_KEY");
  const parentDatabaseID =
    PropertiesService.getScriptProperties().getProperty("DATABASE_URL");
  const titleColumnName = "Title";
  const parentTimeColumnName = "Time";
  const endTimeColumnName = "Endtime";
  const categoryColumnName = "Category";

  let postOptions = {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "Notion-Version": "2021-05-13",
      Authorization: `Bearer ${apiKey}`,
    },
    payload: JSON.stringify({
      sorts: [
        {
          property: parentTimeColumnName,
          direction: "descending",
        },
      ],
    }),
  };
  const pageList = getDatabase(postOptions, parentDatabaseID);
  const pageID = getPageId(pageList, title, titleColumnName);

  console.log("最新ページID: " + pageID);
  const getOptions = {
    method: "get",
    headers: {
      "Content-Type": "application/json",
      "Notion-Version": "2021-05-13",
      Authorization: `Bearer ${apiKey}`,
    },
  };
  const databaseID = getBlocks(getOptions, pageID);
  console.log("ページ内データベースID: " + databaseID);
  postOptions = {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "Notion-Version": "2021-05-13",
      Authorization: `Bearer ${apiKey}`,
    },
    payload: JSON.stringify({
      sorts: [
        {
          property: endTimeColumnName,
          direction: "ascending",
        },
      ],
    }),
  };
  const manHourData = getDatabase(postOptions, databaseID);
  const [json, colorJson] = calcManHour(
    manHourData,
    endTimeColumnName,
    categoryColumnName
  );
  return [json, colorJson];
}

function getPageId(pageList: any, title: string, titleColumnName: string) {
  let pageID = null;
  if (title) {
    Object.keys(pageList).forEach(function (key) {
      const pageListTitle = pageList[key].properties[titleColumnName].title[0];
      if (pageListTitle && pageListTitle.plain_text === title) {
        pageID = pageList[key].id;
      }
    });
  }
  if (!pageID) {
    pageID = pageList[0].id;
  }
  return pageID;
}

function getDatabase(options: any, databaseID: string | null) {
  const apiURL = `https://api.notion.com/v1/databases/${databaseID}/query`;
  const response = UrlFetchApp.fetch(apiURL, options).getContentText();
  const responseJson = JSON.parse(response);
  return responseJson.results;
}

function getBlocks(options: any, pageID: string) {
  const apiURL = `https://api.notion.com/v1/blocks/${pageID}/children?page_size=100`;
  const response = UrlFetchApp.fetch(apiURL, options).getContentText();
  const responseJson = JSON.parse(response);
  const results = responseJson.results;
  return results[0].id;
}
