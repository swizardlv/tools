var Yelp = require('yelp');
var jsonfile = require('jsonfile');
var yelp = new Yelp({
    consumer_key: <consumer_key>,
    consumer_secret: <consumer_secret>,
    token: <token>,
    token_secret: <token_secret>
});

// See http://www.yelp.com/developers/documentation/v2/search_api

//for the first time to get the total amount of business

function getYelp(_location, _category, _keyword) {
    // body...

    var keyword = _keyword || "all";
    var category = _category || "all";
    var location = _location || "National Harbor, MD";
    console.log(keyword);
    var yelpResponse = {};
    var total = 0;
    var promiseArray = [];
    var option = { location: location, limit: 1 };

    if (!(keyword === "all")) {
        option.term = keyword;
       // console.log(option);
    }

    if (!(category === "all")) {
        option.category_filter = category;
       // console.log(option);
    }
    console.log(option);
    yelp.search(option)
        .then(function(data) {
            //console.log(data);
            if (data) {
                yelpResponse = data;
                total = data.total;
                yelpResponse.businesses = [];
                console.log(category + " total amount is " + total);
                for (var i = 0; i < total && i < 1000; i = i + 20) {
                    getYelpbyOffset(i)();
                }

                Promise.all(promiseArray).then(function() {
                    // console.log("all promises complete");
                    //console.log(yelpResponse);
                    if (yelpResponse.businesses.length > 0) {
                        console.log("write to json file for "+category+" "+keyword);
                        var file = "/tmp/json/" + category + "_" + keyword + ".json";


                        jsonfile.writeFile(file, yelpResponse, function(err) {
                            console.error(err)
                        });
                    }

                });
            }

        })
        .catch(function(err) {
            console.error(err);
        });

    function getYelpbyOffset(offset) {
        var _offset = offset;

        return function() {
           // console.log("get data begin from offset:  " + _offset);
            var _option = { location: location, offset: _offset };
            if (!(keyword == "all")) {
                _option.term = keyword;
               // console.log(_option);
            }
            console.log(_option);

            if (!(category === "all")) {
                _option.category_filter = category;
               // console.log(_option);
            }
            var _promise = yelp.search(_option)
                .then(function(data) {
                    // console.log(data);
                    if (data && data.businesses) {


                        yelpResponse.businesses = yelpResponse.businesses.concat(data.businesses);
                    }

                })
                .catch(function(err) {
                    console.error(err);
                });
            promiseArray.push(_promise);
        }

    }
}
exports.myYelp = myYelp;
