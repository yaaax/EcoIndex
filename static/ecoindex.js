// This should be in a config file of course
var SERVER_URL = 'http://localhost:8123/getEcoIndexResult';

document.addEventListener('DOMContentLoaded', function () {

    function doPost(urlToTest, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", SERVER_URL, true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var json = JSON.parse(xhr.responseText);
                callback(json);
            }
        };
        var data = JSON.stringify({url : urlToTest});
        xhr.send(data);
    }

    document.getElementById( 'getecoindex' ).addEventListener('submit', function(event) {
        event.preventDefault();

        var urlToTest = document.getElementById('siteurl').value;
        document.getElementById('eco-index-result-loader').classList.remove('none');

        doPost(urlToTest, function (jsonresult) {
            // Not very nice, but it's a start.
            document.getElementById('eco-index-result-loader').classList.add('none');
            document.getElementById('eco-index-result').classList.remove('none');

            document.getElementById('ecoindex-result-ecoindex-current').innerHTML = jsonresult.ecoIndex.current;
            document.getElementById('ecoindex-result-ecoindex-min').innerHTML = jsonresult.ecoIndex.min;
            document.getElementById('ecoindex-result-ecoindex-max').innerHTML = jsonresult.ecoIndex.max;
            document.getElementById('ecoindex-result-ecoindex-median').innerHTML = jsonresult.ecoIndex.median;

            document.getElementById('ecoindex-result-dom-current').innerHTML = jsonresult.dom.current;
            document.getElementById('ecoindex-result-dom-min').innerHTML = jsonresult.dom.min;
            document.getElementById('ecoindex-result-dom-max').innerHTML = jsonresult.dom.max;
            document.getElementById('ecoindex-result-dom-median').innerHTML = jsonresult.dom.median;


            document.getElementById('ecoindex-result-nb-requests-current').innerHTML = jsonresult.nbRequests.current;
            document.getElementById('ecoindex-result-nb-requests-min').innerHTML = jsonresult.nbRequests.min;
            document.getElementById('ecoindex-result-nb-requests-max').innerHTML = jsonresult.nbRequests.max;
            document.getElementById('ecoindex-result-nb-requests-median').innerHTML = jsonresult.nbRequests.median;


            document.getElementById('ecoindex-result-size-current').innerHTML = jsonresult.size.current + ' Mo';
            document.getElementById('ecoindex-result-size-min').innerHTML = jsonresult.size.min + ' Mo';
            document.getElementById('ecoindex-result-size-max').innerHTML = jsonresult.size.max + ' Mo';
            document.getElementById('ecoindex-result-size-median').innerHTML = jsonresult.size.median + ' Mo';
        })
    });
});