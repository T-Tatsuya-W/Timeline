# Timeline

## To setup and run this page

You will need to ensure you have Node.js and npm installed. They come together and can be installed from the [Official Node.js Website](https://nodejs.org/en/download).
You can check you have these two packages installed by checking their versions with terminal commands.
```
node -v
npm -v
```

Once these are verified, dependencies can be installed with ```npm install```

Once these have been installed, the server code can be initiated with ```npm start```
This will tell you where the page is being hosted. Clicking or copying this link into a browser will take you to the site.


## To add new entries
All the data is stored in a locally stored CSV file, adding new rows of data to this will add more slides to the timeline.
You may have to restart the server in order to have these updated to the server since the backend must first convert this into JSON format for the Timeline.js to then work with it.


## Next stages
- Desktop icon to run (simplify running operation to be user friendly for non technical users)
- Add compatibility for other media, (multiple images, slideshow?, background with many images, music, videos, combinations fo images and music, videos etc.
- Links to pages eg Facebook
- Bottom right timeline link to be replaced?
- images in folders with names.
- tidy the csv to be user friendly.
