const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const csvParser = require('csv-parser');
const ExcelJS = require('exceljs');

const app = express();
const server = http.createServer(app);

const PORT = 3000;
const jsonFile = "data.json";
const htmlFile = "index.html";
const csvFile = "data.csv";
const excelFile = "data.xlsx";
const mediaFoldersFolder = "media";

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




function makeMedia(folderName){
    try {
        const files = fs.readdirSync(mediaFoldersFolder+"/"+folderName);
        console.log("success reading media folder");
        if (files.length < 1){
            console.log("folder empty");
            return null;
        }else if (files.length == 1){
            console.log("folder "+folderName+" has one file");
            console.log(files);
            return(mediaFoldersFolder+"/"+folderName+"/"+files[0]);
        }else{
            // folder has multiple media. make appropriate html
            console.log("MultiMedia Maker");
            console.log(files);
            console.log("loading multi ");
            

            // Create an empty string to store the HTML elements
            let htmlContent = `<!DOCTYPE html><html><body>\n`;

            // Loop through the list of media files and add the appropriate HTML for each
            files.forEach(file => {
                const fileExtension = path.extname(file);
                if (fileExtension.match(/\.(jpg|jpeg|png|gif)$/i)) {
                    // Images
                    htmlContent += `\n<img src="${folderName}/${file}">\n`;
                } else if (fileExtension === '.mp3') {
                    // Audio
                    htmlContent += `\n<audio controls>\n<source src="${folderName}/${file}" type="audio/mpeg">\nYour browser does not support the audio element.\n</audio>\n`;
                } else if (fileExtension === '.mp4') {
                    // Video
                    htmlContent += `\n<video width="640" height="360" controls>\n<source src="${folderName}/${file}" type="video/mp4">\nYour browser does not support the video tag.\n</video>\n`;
                }
            });

            // Close the HTML body and document
            htmlContent += `\n</body></html>`;

            // Save the HTML content to a file in a folder (e.g., "generated")
            fs.writeFileSync('./'+mediaFoldersFolder+'/'+folderName+'.html', htmlContent);

            return("<iframe src = "+mediaFoldersFolder+"/"+folderName+".html width = 100% height = 100% frameborder=0 style=border: none draggable=true></iframe>")




            // gotta return something like this 
            // "<iframe src = testiframe.html width = 100% height = 100% frameborder=0 style=border: none draggable=true></iframe>",
        }

    } catch (error) {
        console.error(`Error reading directory: ${error}`);

    }
}

function deleteHTMLFilesInFolder(folderName) {
    fs.readdirSync(folderName).forEach(file => {
        const filePath = path.join(folderName, file);
        if (path.extname(file) === '.html') {
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${file}`);
        }
    });
}


app.get('/data', async (req, res) => {

    //create the json as a js object
    console.log('creating json from excel');


    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(excelFile);
        const worksheet = workbook.getWorksheet(1);

        //delete old html files from mediaFoldersFolder
        deleteHTMLFilesInFolder(mediaFoldersFolder);

        
    

        var timelineJS_object = {};


        worksheet.eachRow((row, rowNum) => {


            if (rowNum == 2){
                // for title page
                const rowData = {};
                row.eachCell((cell, colNum) => {
                    rowData[worksheet.getRow(1).getCell(colNum).value] = cell.value;
                });
                timelineJS_object = {
                    title: {
                        ...(rowData['Media'] ? {
                            "media": 
                                {
                                "url": makeMedia(rowData['Media']),
                                "caption": rowData['Media_Caption'],
                                "credit": rowData['Media_Credit']
                                }
                        } : {}),

                        text: {
                        headline: rowData['Headline'],
                        text: rowData['Text']
                        }
                    },
                    events: []
                };
            }
            if (rowNum > 2){ //skip the header row
                const rowData = {};
                row.eachCell((cell, colNum) => {
                    rowData[worksheet.getRow(1).getCell(colNum).value] = cell.value;
                });

                timelineJS_object.events.push({

                    ...(rowData['Media'] ? {
                        "media": 
                            {
                            "url": makeMedia(rowData['Media']),
                            "caption": rowData['Media_Caption'],
                            "credit": rowData['Media_Credit']
                            }
                    } : {})

                    /* FOR MULTIMEDIA
                    "media": 
                            {
                            "url": "<iframe src = testiframe.html width = 100% height = 100% frameborder=0 style=border: none draggable=true></iframe>",
                            "caption": rowData['Media_Caption'],
                            "credit": rowData['Media_Credit']
                            }
                    */
                    
                    ,
                    "start_date": {
                        "month": rowData['Month'],
                        "day": rowData['Day'],
                        "year": rowData['Year'],
                        "hour": rowData['Hour'],
                        "minute": rowData['Minute']
                    },
                    "end_date": {
                        "month": rowData['End_Month'],
                        "day": rowData['End_Day'],
                        "year": rowData['End_Year'],
                        "hour": rowData['End_Hour'],
                        "minute": rowData['End_Minute']
                    },
                    "text": {
                        "headline": rowData['Headline'],
                        "text": rowData['Text']
                    },
                    "background": {
                        "color": rowData['Background_hex'],
                        "url": makeMedia(rowData['Background_url'])
                    },
                });
            }
        });

        // remove empty fields
        
        const cleanedTimelineJSObject = removeEmptyFields(timelineJS_object);
        // console.log(JSON.stringify(timelineJS_object));

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
    console.log('Server recieved shutdown command');

    // shut down express server
    server.close(() => {
        console.log('Server has been shut down');
        process.exit(0);
    });

    //Server side shutdown
    res.status(200).send('Recieved notifiation');

});