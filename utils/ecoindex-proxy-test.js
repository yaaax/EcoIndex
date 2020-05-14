const request = require('request');


const testURL = 'http://localhost:8123/getEcoIndexResult';


function post(url, data) {
    return new Promise((resolve, reject) => {
        var options = {
            uri: url,
            method: 'POST',
            json: data
        };
        request(options, function (error, response, body) {
            if (error) {
                reject(error)
            }
            if (response.statusCode === 200) {
                resolve(body);
            } else {
                reject(response.statusCode);
            }
        });
    });
}



post(testURL, {url : 'https://docroms.com'})
    .then((result) => {
        return console.log(result)
    })
    .catch((error) => {
        console.log(error);
    });

