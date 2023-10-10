# Userscript: Combine TiddlyWiki5 and search engine (Google) results

Have you ever been looking for something on Google and when you found the
answer, you wanted to make a note of it, did you realize that you already had
the answer in your [TiddlyWiki](https://tiddlywiki.com/)? To avoid these
situations by *integrating TiddlyWiki search results to Google* , use this
userscript with TiddlyWiki (at least 5.1.22 version) on Node.js.

Because the script searches in multiple TiddlyWikis at once, it can also be
used to *search in all your wikis*.

* https://github.com/linonetwo/tiddlywiki-search-tw5-and-search-engine-at-once-user-script (please star if you like it)

## How to install?

* Install
  [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) or
  a compatible userscript-manager extension
  ([Violentmonkey](https://violentmonkey.github.io/),
  [Tampermonkey](https://www.tampermonkey.net/)) to your browser
* Add this script to it:
  [OpenUserJS - TiddlyWiki5: Combine TW5 and search engine results](https://openuserjs.org/scripts/linonetwo/TiddlyWiki5_Combine_TW5_and_search_engine_results) (click install button)
* Set up `wikis` in the config (don't forget to save the changes)
* Start your Node based TiddlyWikis
* *Enable particular filters in each of them!* See
  https://tiddlywiki.com/#WebServer%20API%3A%20Get%20All%20Tiddlers
* Open your favourite search engine and start searching

![screencast](https://i.imgur.com/D7tZA8C.gif)

## Supported search engines

* [Google](https://www.google.com/)
* [StartPage](https://www.startpage.com/)
* [DuckDuckGo](https://duckduckgo.com/)
* [Ecosia](https://www.ecosia.org/)
* [CN Bing](cn.bing.com)
* [Bing](cn.bing.com)
* [Baidu](www.baidu.com)
