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

jsdom.env({
    html: indexHTML,
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.71 Safari/534.24'},
    scripts: ['http://code.jquery.com/jquery-1.5.min.js'],
    done: function(errors, window) {
        console.log('Probably lat,lng for Paris', window.$('.geo').eq(0).text());
    }
});

console.log('adsasddass')

global.document = dom.window.document;
global.window = dom.window;
global.navigator = {userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.71 Safari/534.24'};

global.body = {createTextRange: jest.fn()}

global.fetch = fetch;
