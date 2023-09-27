const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const csvParser = require('csv-parser');
const ExcelJS = require('exceljs');

const app = express();

const PORT = 3000;
const jsonFile = "data.json";
const htmlFile = "index.html";
const csvFile = "data.csv";
const excelFile = "data.xlsx";

app.use(express.static(path.join(__dirname)));

function removeEmptyFields(obj) {
    for (const key in obj) {
        if (obj[key] === null || obj[key] === undefined || obj[key] === '') {
            delete obj[key];
        } else if (typeof obj[key] === 'object') {
            removeEmptyFields(obj[key]); // Recursively check nested objects
    
            // Check if the nested object is empty after removing its empty properties
            if (Object.keys(obj[key]).length === 0) {
            delete obj[key]; // Remove the entire nested object
            }
        }
    }
    return obj;
}
  


app.get('/data', async (req, res) => {

    //create the json as a js object
    console.log('creating json from excel');

    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(excelFile);
        const worksheet = workbook.getWorksheet(1);

        
    

        const timelineJS_object = {
            title: {
                media: {
                url: "images/"+"download.jpeg",
                caption: "Title Page Image caption"
                },
                text: {
                headline: "Headline Text",
                text: "title page example text"
                }
            },
            events: []
        };


        worksheet.eachRow((row, rowNum) => {
            if (rowNum > 1){ //skip the header row
                const rowData = {};
                row.eachCell((cell, colNum) => {
                    rowData[worksheet.getRow(1).getCell(colNum).value] = cell.value;
                });

                timelineJS_object.events.push({
                    "media": {
                    "url": "images/"+rowData['Media'],
                    "caption": rowData['Media_Caption'],
                    "credit": rowData['Media_Credit']
                    },
                    "start_date": {
                    "month": rowData['Month'],
                    "day": rowData['Day'],
                    "year": rowData['Year'],
                    },
                    "end_date": {
                        "month": rowData['End_Month'],
                        "day": rowData['End_Day'],
                        "year": rowData['End_Year']
                    },
                    "text": {
                    "headline": rowData['Headline'],
                    "text": rowData['Text']
                    },
                    "background": {
                        "color": rowData['Background_hex'],
                        "url": rowData['Background_url']
                    },
                });
            }
        });

        // remove empty fields
        cleanedTimelineJSObject = removeEmptyFields(timelineJS_object);

        console.log('JSON creation completed');
        const responsiveData = cleanedTimelineJSObject;
        res.json(responsiveData);
    } catch (error) {
        console.error('Error reading Excel file:',  error);
        res.status(500).json({ error: 'Error reading Excel file'});
    }

});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.post('/notify-close', (req, res) => {
    console.log('Client is closing the page');
    //Server side shutdown
    res.status(200).send('Recieved notifiation');

});