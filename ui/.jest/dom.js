import { JSDOM } from "jsdom"
import fetch from 'node-fetch';

const indexHTML =
  `<html lang="en">
    <body>
      <div id="modal__cover" class="modal__cover hidden"></div>
      <div id="modal" class="ReactDom"></div>
      <div id="header" class="ReactDom"></div>
      <div id="side_panel"></div>
      <div id="lightbox" class="lightbox"></div>
      <div id="loader" class="Loader fixed--important hidden"></div>
    </body>
  </html>`;

const dom = new JSDOM(indexHTML);
global.document = dom.window.document;
global.window = dom.window;
global.navigator = {userAgent: "jest"};

global.fetch = fetch;
