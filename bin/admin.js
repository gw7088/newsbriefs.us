'use strict'

const
    Utils = require('./utils'),
    request = require('request'),
    UIDGenerator = require('uid-generator'),
    uidgen = new UIDGenerator(),
    path = require('path'),
    fs = require('fs')
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

    register_user(options,callback){
        let self=this;
        if (typeof callback!='function') callback = function(){};
        
        var registered_ppl;
        // -----> Give me the list off registered ppl
        fs.readFile(path.resolve('registered.json'), function (error, content) {
            if(error){
                // console.log(error);
                return callback(self.simpleFail('Error registering'));
            }
            registered_ppl = JSON.parse(content);

            // To add or not to add
            if(!registered_ppl[options.email]){
                registered_ppl[options.email] = options;
            }
            else{
                return callback(self.simpleFail('Already registered'));
            }

            // -----> Register them peeps
            var jsonContent = JSON.stringify(registered_ppl);
            fs.writeFile(path.resolve('registered.json'), jsonContent, 'utf8', function (err) {
                if (err) {
                    // console.log(err);
                    return callback(self.simpleFail('Error registering'));
                }
                return callback(self.simpleSuccess('Registration request complete',options));
            });    
        });
    }
}
