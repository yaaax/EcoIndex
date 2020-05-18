const request = require('request');
const express = require('express');
const fs = require('fs');

const testURL = 'http://www.ecoindex.fr/processRequest/';
const statusURL = 'http://www.ecoindex.fr/ecoIndex_status/?id=';
const resultURL = 'http://www.ecoindex.fr/resultats/?id=';
const PORT = 8123;

/*
    Lance un serveur web qui écoute sur le port en constant et répond en donnant le résultat éco index
    pour des requetes du type :

    POST http://localhost:8123/getEcoIndexResult
    { url : 'https://docroms.com' }
 */


function post(url, formData) {
    return new Promise((resolve, reject) => {
        request.post({url: url, form: formData, method: 'POST'},
            (error, res, body) => {
                if (error) {
                    reject(error)
                }
                if (res.statusCode === 200) {
                    resolve(body);
                } else {
                    reject(res.statusCode);
                }
            }
        );
    });
}


function get(url) {
    return new Promise((resolve, reject) => {
        request.post({url: url, method: 'GET'},
            (error, res, body) => {
                if (error) {
                    reject(error)
                }
                if (res.statusCode === 200) {
                    resolve(body);
                } else {
                    reject(res.statusCode);
                }
            }
        );
    });
}


function sleep(timeMS) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, timeMS);
    });
}

async function getAuditId(urlUnderTest) {
    console.log(`Get audit id for ${urlUnderTest}`);
    const formData = {
        url : urlUnderTest
    };
    const ecoIndexBody = await post(testURL, formData);
    return ecoIndexBody.split("\n")
        .filter(l => l.match(/resultats/))
        .map(l => l.substr(l.indexOf("=") + 1))
        .map(l => l.substr(0, l.indexOf("\"")))[0];
}


async function waitForAnalysis(auditId) {
    console.log(`Wait for analysis for ${auditId}`);
    const ko = '---finAnalyseKO---';
    const ok = '---finAnalyseOK---';
    const pending = 'votre demande est en attente de traitement';
    let result = pending;
    while (result === pending) {
        await sleep(2000);
        console.log(`Get analysis status for ${auditId}`);
        result = await get(statusURL + auditId);
        result = result.trim();
        console.log(`Got analysis status for ${auditId} : ${result}`);
    }
    if (result === ok) {
        console.log(`Audit ok for ${auditId}`);
        return auditId;
    }
    console.log(`Audit KO for ${auditId}`);
    throw new Error("Analysis ko !")
}

function getResult(auditId) {
    console.log(`Get result HTML for ${auditId}`);

    return get(resultURL + auditId);
}


function parseResult(htmlResult) {
    const extractData = (linePattern, startPattern, stopPattern) => {
        return htmlResult.split("\n")
            .filter(l => l.match(linePattern))
            .filter(l => l.match('html'))
            .map(l => l.substr(l.indexOf(startPattern)).replace(startPattern, ''))
            .map(l => l.substr(0, l.indexOf(stopPattern)))[0].trim()
    };
    return {
        ecoIndex : {
            current : parseFloat(extractData('lab_eco_ths', "<b>", "</b>")),
            min : 0,
            max : 100,
            median : parseFloat(extractData('lab_eco_moy', ": ", "'"))
        },
        dom : {
            current : parseFloat(extractData('lab_dom_ths', "<b>", "</b>")),
            min : 0,
            max : parseFloat(extractData('lab_dom_max', ": ", " élém.")),
            median : parseFloat(extractData('lab_dom_med', ":", " élém."))
        },
        nbRequests : {
            current : parseFloat(extractData('lab_req_ths', "<b>", "</b>")),
            min : 0,
            max : parseFloat(extractData('lab_req_max', ": ", " req.")),
            median : parseFloat(extractData('lab_req_med', ":", " req."))
        },
        size : {
            current : parseFloat(extractData('lab_siz_ths', "<b>", "</b>")),
            min : 0,
            max : parseFloat(extractData('lab_siz_max', ": ", " Mo")),
            median : parseFloat(extractData('lab_siz_med', ":", " Mo"))
        }
    };
}

async function getEcoIndexResult(urlUnderTest) {
    const auditId = await getAuditId(urlUnderTest);
    await waitForAnalysis(auditId);
    const htmlResult = await getResult( auditId );
    return parseResult(htmlResult);
}


const app = express();
app.use(express.json());

app.post('/getEcoIndexResult', function (req, res) {
    const urlUnderTest = req.body.url;
    getEcoIndexResult(urlUnderTest)
        .then((result) => res.json(result));
});

console.log(`Listening on ${ PORT }`);
app.listen(PORT);
