const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const csvParser = require('csv-parser');

const app = express();

const PORT = 3000;
const jsonFile = "data.json";
const htmlFile = "index.html";
const csvFile = "data.csv";

app.use(express.static(path.join(__dirname)));

app.get('/data', (req, res) => {
    // get json from file
    // const responseData = JSON.parse(fs.readFileSync(jsonFile));

    //create the json as a js object
    console.log('creating json from csv');
    const timelineJS_object = {
        title: {
            media: {
              url: "download.jpeg",
              caption: "Whitney Houston performing on her My Love is Your Love Tour in Hamburg."
            },
            text: {
              headline: "Whitney Houston<br/> 1963 - 2012",
              text: "<p>Houston's voice caught the imagination of the world propelling her to superstardom at an early age becoming one of the most awarded performers of our time. This is a look into the amazing heights she achieved and her personal struggles with substance abuse and a tumultuous marriage.</p>"
            }
        },
        events: []
    };
    console.log('basic template fin');
    fs.createReadStream(csvFile)
        .pipe(csvParser())
        .on('data', (row) => {
            console.log('adding row data', row);
            timelineJS_object.events.push({
                "media": {
                  "url": row['Media'],
                  "caption": row['Media_Caption'],
                  "credit": row['Media_Credit']
                },
                "start_date": {
                  "month": row['Month'],
                  "day": row['Day'],
                  "year": row['Year'],
                },
                "end_date": {
                    "month": row['End_Month'],
                    "day": row['End_Day'],
                    "year": row['End_Year']
                },
                "text": {
                  "headline": row['Headline'],
                  "text": row['Text']
                },
                "background": {
                    "color": row['Background_hex'],
                    "url": row['Background_url']
                }
              });
        })
        .on('end', () => {
            console.log('JSON complete');
            const responseData = timelineJS_object;
            
            console.log(responseData);



            res.json(responseData);
        });

    
    console.log("json data sent to front")
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
