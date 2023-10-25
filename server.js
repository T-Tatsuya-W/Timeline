const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const ExcelJS = require('exceljs');

const app = express();
const server = http.createServer(app);

const PORT = 3000;

// DATA LOCATIONS 
const excelFile = "data.xlsx";
const mediaFoldersFolder = "media";

app.use(express.static(path.join(__dirname)));

//Function to filter json for unused fields
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

// Function to create html from folders of media
function makeMedia(folderName){
    if (folderName){
        try {
            const files = fs.readdirSync(mediaFoldersFolder+"/"+folderName);
            if (files.length < 1){
                console.log("Nothing detected in folder "+folderName);
                return null;
            }else if (files.length == 1){
                return(mediaFoldersFolder+"/"+folderName+"/"+files[0]);
            }else{
                // Empty HTML document string
                let htmlContent = `<!DOCTYPE html><html><body>\n`;

                // Loop through files adding the appropriate HTML
                files.forEach(file => {
                    const fileExtension = path.extname(file);
                    if (fileExtension.match(/\.(jpg|jpeg|png|gif)$/i)) {
                        // Images
                        htmlContent += `\n<img src="${folderName}/${file}" style="width: 100%" >\n`;
                    } else if (fileExtension === '.mp3') {
                        // Audio
                        htmlContent += `\n<audio controls>\n<source src="${folderName}/${file}" type="audio/mpeg">\nYour browser does not support the audio element.\n</audio>\n`;
                    } else if (fileExtension === '.mp4') {
                        // Video
                        htmlContent += `\n<video width="640" height="360" controls>\n<source src="${folderName}/${file}" type="video/mp4" >\nYour browser does not support the video tag.\n</video>\n`;
                    }
                });

                // Close the HTML body and document
                htmlContent += `\n</body></html>`;
                fs.writeFileSync('./'+mediaFoldersFolder+'/'+folderName+'.html', htmlContent);
                return("<iframe src = "+mediaFoldersFolder+"/"+folderName+".html width = 100% height = 100% frameborder=0 style=border: none draggable=true></iframe>")
            }
        } catch (error) {
            console.error(`Error reading directory: ${error}`);
        }
    }
}

// Function to delete previously made html files
function deleteHTMLFilesInFolder(folderName) {
    fs.readdirSync(folderName).forEach(file => {
        const filePath = path.join(folderName, file);
        if (path.extname(file) === '.html') {
            fs.unlinkSync(filePath);
        }
    });
}

// JS for main server operations
app.get('/data', async (req, res) => {

    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(excelFile);
        const worksheet = workbook.getWorksheet(1);

        deleteHTMLFilesInFolder(mediaFoldersFolder);

        var timelineJS_object = {};

        worksheet.eachRow((row, rowNum) => {
            if (rowNum == 2){ // for title page
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
            } else if (rowNum > 2){ //skip the header row
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

        const cleanedTimelineJSObject = removeEmptyFields(timelineJS_object);

        const responsiveData = cleanedTimelineJSObject;
        res.json(responsiveData);

    } catch (error) {
        console.error('Error reading Excel file:',  error);
        res.status(500).json({ error: 'Error reading Excel file'});
    }

});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Press F11 to enter fullscreen');
  console.log('ctrl+C to manually terminate server\n');
});

app.post('/notify-close', (req, res) => {
    console.log('Server recieved shutdown command');

    // shut down express server
    server.close(() => {
        console.log('Server has been shut down');
        process.exit(0);
    });

    //clean up html files
    deleteHTMLFilesInFolder();

    //Server side shutdown
    res.status(200).send('Recieved notifiation');

});