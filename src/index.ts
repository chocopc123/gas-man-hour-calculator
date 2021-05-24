import { doGet, run } from "./main";

declare const global: {
  [x: string]: unknown;
};

global.doGet = doGet;
global.run = run;
