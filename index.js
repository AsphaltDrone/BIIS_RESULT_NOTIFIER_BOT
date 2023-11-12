const axios = require('axios').default;
const express = require('express');
const { xml2json } = require('xml-js');
const { parse } = require('node-html-parser');
const { jsrsaenc } = require('./helper.js');
require('dotenv').config();
const myID = process.env.myID;
const myPass = process.env.myPass;
const token = process.env.TG_Token;

var tg_res_msg = 'empty';
var cookie = '';

async function loadKey(username, pass, mode) {
    try {
        tg_res_msg = 'empty';
        cookie = '';
        const { data, headers } = await axios.get('https://biis.buet.ac.bd/BIIS_WEB/keyGeneration.do');
        const res = JSON.parse(xml2json(data, { compact: true, spaces: 2 }));
        const key = res['xml']['key']['_text'];
        const modulus = res['xml']['modulus']['_text'];
        const keylen = res['xml']['keylen']['_text'];
        cookie = headers['set-cookie'][0].split(';')[0];
        pass = jsrsaenc(key, modulus, keylen, pass);

        await loginAction(username, pass, mode, cookie);

    } catch (error) {
        console.error(error);
    }
}

async function loginAction(username, pass, mode, cookie) {
    try {
        const { data } = await axios.post('https://biis.buet.ac.bd/BIIS_WEB/CheckValidity.do',
            {
                userName: username,
                passWord: pass
            },
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'cookie': cookie
                }
            });

        let isGoodLogin = JSON.stringify(data).includes('Logout');

        if (isGoodLogin) {
            if (mode === 0) {
                await getTaheraCGPA(cookie);
            }
            else if (mode === 1) {
                await getDetailedCGPA(cookie);
            }
        }
        else {
            console.log("Bad Login")
        }

    } catch (error) {
        console.error(error);
    }
}

async function getTaheraCGPA(cookie) {
    try {
        const { data } = await axios.get('https://biis.buet.ac.bd/BIIS_WEB/scStep2.do?scid=69',
            {
                headers: {
                    'cookie': cookie
                }
            });

        const root = parse(data);
        const cgpa = root.querySelectorAll('th')[49].textContent;

        tg_res_msg = `Your Tahera CGPA is :${cgpa}`;

    } catch (error) {
        console.error(error);
    }
}

async function getDetailedCGPA(cookie) {
    try {
        const res1 = await axios.get('https://biis.buet.ac.bd/BIIS_WEB/ListSemesters.do',
            {
                headers: {
                    'cookie': cookie
                }
            });

        let root = parse(res1.data);
        const selectedSemester = root.querySelectorAll('option')[2].rawAttributes.value;

        const { data } = await axios.post('https://biis.buet.ac.bd/BIIS_WEB/ProcessPGS.do',
            {
                selectedSemester: selectedSemester,
                B1: 'Show'
            },
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'cookie': cookie
                }
            });

        root = parse(data);
        const result = root.querySelectorAll("tr[id^='theID']");
        
        const currGPAElem = findElementByString('GPA');
        let currGPA = 'empty';
        if(currGPAElem != null) {
            currGPA = currGPAElem.textContent.replace(/\s/g, '').split(':')[1];
        }        

        let resultElemObj = {}, resultObj = [];

        for (let index = 0; index < result.length; index++) {
            const element = result[index];

            resultElemObj.courseNumber = element.childNodes[1].textContent.trim();
            resultElemObj.creditHour = element.childNodes[5].textContent.trim();
            resultElemObj.gotGrade = element.childNodes[9].textContent.trim();

            resultObj.push(resultElemObj);

            resultElemObj = {};
        }

        tg_res_msg = '<pre>\n' + createTable(resultObj) + '\n</pre>\n' + `\n Current GPA : ${currGPA}`;

    } catch (error) {
        console.error(error);
    }
}

// loadKey(myID, myPass);


const app = express();
app.use(express.json());

async function sendTGMsg() {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: process.env.ChatID,
        text: tg_res_msg,
        parse_mode: 'HTML',
    })
        .then(response => {
            console.log('Message sent');
        })
        .catch(error => {
            console.error('Error sending message:', error);
        });
}

// Function to be executed when the button is clicked
async function handleClick0() {
    // Add your desired functionality here
    await loadKey(myID, myPass, 0);
    await sendTGMsg();
}

// Function to be executed when the button is clicked
async function handleClick1() {
    // Add your desired functionality here
    await loadKey(myID, myPass, 1);
    await sendTGMsg();
}

app.get('/', (req, res) => {
    res.send(`
    <html>
      <head>
      <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh; /* This ensures that the container takes up the full height of the viewport */
        margin: 0;
        }

        h1 {
        text-align: center;
        }

        button {
        margin-top: 20px; /* Adjust the margin as needed */
        }
    </style>
        <title>Your Web App</title>
      </head>
      <body>
        <h1>Hello, World!</h1>
        <button onclick="handleClick0()">GET TAHERA RESULT</button>
        <br>
        <br>
        <br>
        <button onclick="handleClick1()">GET Detailed RESULT</button>
        <script>
          function handleClick0() {
            // Make a request to the server to execute the function
            fetch('/handleClick0', { method: 'POST' });
          }
          function handleClick1() {
            // Make a request to the server to execute the function
            fetch('/handleClick1', { method: 'POST' });
          }
        </script>
      </body>
    </html>
  `);
});

// Route to handle button click on the server
app.post('/handleClick0', (req, res) => {
    // Execute your function here
    handleClick0();
    res.sendStatus(200); // Send a response to the client
});

app.post('/handleClick1', (req, res) => {
    // Execute your function here
    handleClick1();
    res.sendStatus(200); // Send a response to the client
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});




// Thanks ChatGPT
function createTable(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return "No data to display.";
    }

    // Get the headers from the first object in the array
    const headers = Object.keys(data[0]);

    // Calculate the maximum width for each column
    const columnWidths = headers.reduce((acc, header) => {
        acc[header] = Math.max(...data.map(row => String(row[header]).length), header.length);
        return acc;
    }, {});

    // Create the header row
    const headerRow = headers.map(header => `${header.padEnd(columnWidths[header])}`).join(' | ');

    // Create the separator row
    const separatorRow = headers.map(header => '-'.repeat(columnWidths[header])).join('-+-');

    // Create the data rows
    const dataRows = data.map(row =>
        headers.map(header => `${String(row[header]).padEnd(columnWidths[header])}`).join(' | ')
    );

    // Combine all rows into the final table string
    const tableString = `${headerRow}\n${separatorRow}\n${dataRows.join('\n')}`;

    return tableString;
}

function findElementByString(root, searchString) {
    var elements = root.getElementsByTagName("*");

    for (var i = 0; i < elements.length; i++) {
        if (elements[i].textContent.includes(searchString)) {
            return elements[i];
        }
    }

    return null; // If no matching element is found
}