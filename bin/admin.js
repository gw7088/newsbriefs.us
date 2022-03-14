'use strict'

const
    Utils = require('./utils'),
    request = require('request'),
    UIDGenerator = require('uid-generator'),
    uidgen = new UIDGenerator(),
    path = require('path'),
    fs = require('fs'),
    { JSDOM } = require( "jsdom" ),
    { window } = new JSDOM( "" ),
    $ = require( "jquery" )( window ),
    puppeteer = require('puppeteer')
;

module.exports = class Admin extends Utils{

    getToken(callback){
        if (typeof callback!='function') callback = function(){};
        uidgen.generate((err, uid) => {
            if (err) throw err;
            callback(uid);
        });
    }

    lets_test_socketIO(options,callback){
        if (typeof callback!='function') callback = function(){};

        return callback(options);
    }

    get_user_information(options,callback){
        if (typeof callback!='function') callback = function(){};

        let url = 'https://ip.nf/me.json';
        request(url,(error, response, body)=>{
            // console.log(response);
            // console.log(body);
            let motherData = {};
            let userInfo = JSON.parse(response.body);

            return callback(userInfo);
            /** -----> Needed for YELP Api
             * Client ID: oaOwNTt9uIT5DXPzhrjhwA
             * API Key: 1HqRCD2Nedx90EHJDRMTLqqHgGaWjkVcosjXFZMwighBv2bx2Nuy0bKCYwRLDFMw-Icba-BQ_8J1d530WmGc_2oXXHR68aS67sYjExHSAHLKgae5aNEOUh7mof4JYHYx
             * 
             * latitude
             * longitude
             * 
             */
            // -----> Resturants: https://api.yelp.com/v3/businesses/search?&latitude=${userInfo.ip.latitude}&longitude=${userInfo.ip.longitude}&categories=restaurants,all
            // -----> Activities: https://api.yelp.com/v3/businesses/search?&latitude=${userInfo.ip.latitude}&longitude=${userInfo.ip.longitude}&categories=active,all
            // -----> Misc: 
            let options = {
                'method': 'GET',
                'url': `https://api.yelp.com/v3/businesses/search?&latitude=${userInfo.ip.latitude}&longitude=${userInfo.ip.longitude}&categories=restaurants,all`,
                'headers': {
                  'Authorization': 'Bearer 1HqRCD2Nedx90EHJDRMTLqqHgGaWjkVcosjXFZMwighBv2bx2Nuy0bKCYwRLDFMw-Icba-BQ_8J1d530WmGc_2oXXHR68aS67sYjExHSAHLKgae5aNEOUh7mof4JYHYx'
                }
            };
            // console.log(options.url);
            request(options,(error, response, body)=>{
                if (error) throw new Error(error);
                // console.log(response.body);
                let resultFood = JSON.parse(response.body);
                motherData.food = resultFood;

                options.url = `https://api.yelp.com/v3/businesses/search?&latitude=${userInfo.ip.latitude}&longitude=${userInfo.ip.longitude}&categories=active,all`
                // console.log(options.url);
                request(options,(error, response, body)=>{
                    if (error) throw new Error(error);
                    // console.log(response.body);   
                    let resultFun = JSON.parse(response.body);
                    motherData.activities = resultFun;

                    // console.log(JSON.stringify(motherData));

                    return callback(motherData);
                });
            });
        });
    }

    load_articles(options,callback){
        let self=this;
        if (typeof callback!='function') callback = function(){};
        
        var articles;
        // -----> Give me the list off registered ppl
        fs.readFile(path.resolve('articles.json'), function (error, content) {
            if(error){
                // console.log(error);
                return callback(self.simpleFail('Error loading articles'));
            }
            articles = JSON.parse(content);
            return callback(self.simpleSuccess('Successfully loaded articles',articles));
        });
    }


    /**
     * Gets news data from here...
     */
    grab_news_data_npr = async () => {
        let browser = await puppeteer.launch({headless:true});
        let page = await browser.newPage();

        await page.setViewport({ width: 1100, height: 800 })
        await page.goto(`https://www.npr.org/sections/news/`,{waitUntil:'networkidle0'});

        await page.waitForSelector('#overflow');

        let titles = [];
        let topics = [];
        let teasers = [];
        let pictures = [];

        // Get Topics
        topics = await page.evaluate(() => {
            let results = [];
            let items = document.querySelectorAll('h3.slug');
            items.forEach((item) => {
                results.push(item.innerText);
            });
            return results;
        });
        // Get Titles
        titles = await page.evaluate(() => {
            let results = [];
            let items = document.querySelectorAll('h2.title');
            items.forEach((item) => {
                results.push(item.innerText);
            });
            return results;
        });
        // Get Teasers
        teasers = await page.evaluate(() => {
            let results = [];
            let items = document.querySelectorAll('p.teaser');
            items.forEach((item) => {
                results.push(item.innerText);
            });
            return results;
        });
        // pictures = await page.evaluate(() => {
        //     let results = [];
        //     let items = document.querySelectorAll('h2.title');
        //     items.forEach((item) => {
        //         results.push({
        //             // url:  item.getAttribute('href'),
        //             text: item.innerText,
        //         });
        //     });
        //     return results;
        // });

        let articles = {};
        for(var i in titles){
            let article = {
                topic:topics[i],
                title:titles[i],
                teaser:teasers[i],
            };
            if(!articles[i]) articles[i] = article;
        }

        let jsonArticles = JSON.stringify(articles);
        fs.writeFile(path.resolve('articles.json'), jsonArticles, 'utf8', function (err) {
            if (err) {
                console.log(err);
                return 'false';
            }
        });    
    }
}
