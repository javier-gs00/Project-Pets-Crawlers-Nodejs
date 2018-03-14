# Project Pets Crawlers

Web crawlers for Project Pets built with Nodejs using the X-Ray web scraping module.

For the moment it contains three usable web crawlers.

To execute a web crawler, from the root of the project

> node sequential/:web_scraper_file_name

and it will crawl and collect all the products from the website. All the data is parsed and immediately saved to the database (MongoDB).

_All the web crawlers are built taking into account the extra load they bring to the crawled websites._
* _No more than one request can be made to a website at a given time_
* _Each request will be made at least one second after the previous one_
* _No more than one web crawler can be running in a single website_