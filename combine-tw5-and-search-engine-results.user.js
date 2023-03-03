// ==UserScript==
// @name TiddlyWiki5: Combine TW5 and search engine results
// @description Combine TiddlyWiki and your preferred search engine to find your own answers more easily
// @version 1.2.1
// @author bimlas
// @supportURL https://github.com/tiddly-gittly/userscript-combine-tw5-and-search-engine-results/issues
// @downloadURL https://github.com/tiddly-gittly/userscript-combine-tw5-and-search-engine-results/raw/master/combine-tw5-and-search-engine-results.user.js
// @icon https://tiddlywiki.com/favicon.ico
// @namespace Violentmonkey Scripts
// @require https://openuserjs.org/src/libs/sizzle/GM_config.js
// @match *://www.google.com/search*
// @match *://cn.bing.com/*
// @match *://www.baidu.com/*
// @match *://www.startpage.com/*
// @match *://duckduckgo.com/*
// @match *://www.ecosia.org/search*
// @grant GM_xmlhttpRequest
// ==/UserScript==

// READ THE DOCUMENTATION BEFORE TRYING TO USE THE SCRIPT!
// https://github.com/bimlas/userscript-combine-tw5-and-search-engine-results

GM_config.init(
{
  'id': 'wikiConfig', // The id used for this instance of GM_config
  'fields': // Fields object
  {
    'wikis': // This is the id of the field
    {
      'label': 'Wiki List (Each in a new line)', // Appears next to field
      'type': 'textarea', // Makes this setting a text field
      'default': 'http://localhost:5212' // Default value if user doesn't change it
    },
    'searchFilter': {
      'label': 'Search sub filter (You need to enable it, see https://tiddlywiki.com/#WebServer%20API%3A%20Get%20All%20Tiddlers ) (only search title if not enabled this way)',
      'labelPos': 'above',
      'type': 'textarea', // Makes this setting a text field
      'default': '[!is[shadow]!is[system]!field:calendarEntry[yes]search[${query}]]' // Default value if user doesn't change it
    }
  }
});

const wikis = GM_config.get('wikis').split('\n').filter(Boolean);
const searchFilter = GM_config.get('searchFilter');

const buildWikiFilter = function(query) {
  const parts = searchFilter.split('${query}');
  return `${parts[0]}${query}${parts[1]}`;
}
// if allow all filter is not enabled, use fallback filter
// https://tiddlywiki.com/#WebServer%20API%3A%20Get%20All%20Tiddlers
const buildWikiFilterFallback = function(query) {
  return `[all[tiddlers]!is[system]sort[title]]`;
}

// NOTE: If you want to show results in the sidebar, change this option to
// 'sidebar', but remember that the sidebar is not always visible (for example,
// if the window is too narrow).
const placementOfResults = 'sidebar';

const searchEngineConfigs = {
  'www.google.com': {
    searchInputSelector: 'input[name=q]',
    searchResultsSelector: {
      main: '#center_col',
      // better use id, so if it no exist, we can recreate one
      sidebar: '#rhs'
    }
  },
  'cn.bing.com': {
    searchInputSelector: 'input#sb_form_q',
    searchResultsSelector: {
      main: '#b_results',
      sidebar: '#b_context'
    }
  },
  'www.baidu.com': {
    searchInputSelector: 'input#kw',
    searchResultsSelector: {
      main: '#content_left',
      sidebar: '#content_right'
    }
  },
  // StartPage changes its URL and website structure, so the script does not work in all cases
  'www.startpage.com': {
    searchInputSelector: '#q',
    searchResultsSelector: {
      main: 'div.mainline-results',
      sidebar: 'div.sidebar-results'
    }
  },
  'duckduckgo.com': {
    searchInputSelector: 'input[name=q]',
    searchResultsSelector: {
      main: '#links.results',
      sidebar: 'div.sidebar-modules'
    }
  },
  'www.ecosia.org': {
    searchInputSelector: 'input[name=q]',
    searchResultsSelector: {
      main: 'div.mainline',
      sidebar: 'div.sidebar'
    }
  },
}
const searchEngine = searchEngineConfigs[document.domain];

function fetchJSON(origin, url) {
  return new Promise((resolve, reject) => {
    try {
    GM.xmlHttpRequest({
      method: "GET",
      headers: {
        "Origin": origin,
      },
      url: url,
      onload: function(response) {
        if (response.status !== 200) {
          return reject()
        }
        resolve(JSON.parse(response.responseText));
      },
      onerror: (error) => {console.error(error); reject(error)},
      onabort: (error) => {console.error(error); reject(error)},
    });
    } catch (error) {
      console.error(error); reject(error)
    }
  });
}

function getTiddlerLink(wiki, title) {
  const urlEncodedTitle = encodeURIComponent(title);
  const singleViewUrl = `${wiki}/${urlEncodedTitle}`;
  const normalViewUrl = `${wiki}/#${urlEncodedTitle}`;
  return `<a href="${singleViewUrl}">${title}</a> (<a href="${normalViewUrl}">#</a>)`;
}

function getWikiTitle(wiki) {
  return new Promise((resolve, reject) => {
    const urlEncodedQuery = encodeURIComponent('$:/SiteTitle');
    const url = `${wiki}/recipes/default/tiddlers/${urlEncodedQuery}`;
    fetchJSON(wiki, url)
    .then(results => {
      resolve(results.text);
    });
  });
}

let searchEngineResults = document.querySelector(searchEngine.searchResultsSelector[placementOfResults]);
// google remove the sidebar, we have to create one manually
if (searchEngineResults === null && placementOfResults === 'sidebar') {
  const mainContentParent = document.querySelector('#center_col').parentElement;
  const sidebarElement = document.createElement('div');
  sidebarElement.id = searchEngine.searchResultsSelector[placementOfResults].replace('#', '');
  mainContentParent.appendChild(sidebarElement);
  searchEngineResults = sidebarElement;
}

let configButtonAdded = false;
function makeConfigButton() {
  const button = document.createElement('button');
  button.innerText = "⚙️TW";
  button.style = "background-color: rgba(255, 255, 255, 0.05);border: none;cursor: pointer;";
  button.onclick = () => GM_config.open();
  return button;
}

if (!configButtonAdded) {
  searchEngineResults.prepend(makeConfigButton());
  configButtonAdded = true;
}

function addToPage(text) {
  const resultContainer = document.createElement('div');
  resultContainer.style.display = 'inline-flex';
  resultContainer.style.flexDirection = 'column';
  resultContainer.style.margin = '1em';
  resultContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
  resultContainer.innerHTML = text;
  searchEngineResults.append(resultContainer);
}

function makeHtmlListFromTiddlers(wiki, listOfTiddlers) {
  const htmlList = listOfTiddlers.reduce((text, tiddler) => {
    return text + `<li>${getTiddlerLink(wiki, tiddler.title)}</li>`;
  }, '');
  return `<ul>${htmlList}</ul>`;
}

const query = document.querySelector(searchEngine.searchInputSelector).value;
const urlEncodedQuery = encodeURIComponent(buildWikiFilter(query));
let searchResults = '';
wikis.forEach(wiki => {
  const url = `${wiki}/recipes/default/tiddlers.json?filter=${urlEncodedQuery}`;
  Promise.all([
    fetchJSON(wiki, url).catch(() => {
      const query = document.querySelector(searchEngine.searchInputSelector).value;
      const urlEncodedQuery = encodeURIComponent(buildWikiFilterFallback(query));
      const url = `${wiki}/recipes/default/tiddlers.json?filter=${urlEncodedQuery}`;
      return fetchJSON(wiki, url).then(results => {
        // sort manually, because can't sort on server using filter, user not allow it using https://tiddlywiki.com/#WebServer%20API%3A%20Get%20All%20Tiddlers
        return results.filter(tiddler => tiddler.title.includes(query));
      });
    }),
    getWikiTitle(wiki)
  ])
  .then(([results, wikiTitle]) => {
    if(!results.length) return;
    const wikiLink = `<small><a href="${wiki}">${wiki}</a></small>`;
    const header = `<h3>${wikiTitle}</h3>${wikiLink}<p>`;
    addToPage(`<div style="margin: 1em;">${header}<p>${makeHtmlListFromTiddlers(wiki, results)}</p><div>`);
  });
});
