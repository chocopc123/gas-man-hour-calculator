export function calcManHour(
  manHourData: any,
  endTimeColumnName: string,
  categoryColumnName: string
): any {
  const usageJson: any = {};
  const colorJson: any = {};
  let previousEndtime: string;
  let previousCategory: string;
  let previousColor: string;
  let first = true;
  manHourData.forEach(function (data: any): any {
    if (!data.properties[endTimeColumnName].rich_text[0]) {
      return true;
    }
    const endtime =
      data.properties[endTimeColumnName].rich_text[0].plain_text.split(":");
    if (first) {
      previousEndtime = endtime;
      first = false;
      return true;
    }
    const usageHour =
      parseInt(endtime[0].replace(/[^0-9]/g, ""), 10) -
      parseInt(previousEndtime[0].replace(/[^0-9]/g, ""), 10);
    const usageMinutes =
      parseInt(endtime[1].replace(/[^0-9]/g, ""), 10) -
      parseInt(previousEndtime[1].replace(/[^0-9]/g, ""), 10);
    previousEndtime = endtime;

    const usage = usageHour * 60 + usageMinutes;
    let category: string;
    let color: string;
    if (data.properties[categoryColumnName]) {
      category = data.properties[categoryColumnName].select.name;
      color = data.properties[categoryColumnName].select.color;
    } else {
      category = previousCategory;
      color = previousColor;
    }
    if (usageJson[category]) {
      usageJson[category] += usage;
    } else {
      usageJson[category] = usage;
      colorJson[category] = color;
    }
    previousCategory = category;
  });
  return [convertStringTime(usageJson), colorJson];
}

function convertStringTime(json: any) {
  Object.keys(json).forEach(function (key) {
    const hour = Math.floor(json[key] / 60);
    const rem = json[key] % 60;
    const stringTime = createStringTime(hour, rem);
    json[key] = stringTime;
  });
  return json;
}

function createStringTime(hour: number, rem: number) {
  const stringHour = hour + "h";
  if (rem !== 0) {
    return stringHour + rem + "m";
  } else {
    return stringHour;
  }
}
