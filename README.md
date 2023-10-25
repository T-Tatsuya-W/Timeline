# Timeline

## Downloading Dependencies

You will need to ensure you have Node.js and npm installed. They come together and can be installed from the [Official Node.js Website](https://nodejs.org/en/download).
You can check you have these two packages installed by checking their versions with terminal commands.

```
node -v
npm -v
```

Once these are verified, dependencies can be installed with ``npm install``

## Starting up the timeline

Click on `startup.bat` ()or a shortcut to the same file). 

This will

- automatically start the server side program,
- launch the page in a browser.

## To add new entries

All the data is stored in a local excel file `data.xlsx`

Adding new rows of data to this will add more slides to the timeline, ordered by date.

You will have to restart the server in order to have these appear on the timeline,

- ensure your changes have saved
- close the page,
- close the server terminal if it didn't automatically `ctrl + c`
- reopen the timeline by clicking on the startup file
- 

### ## If you ever `git pull` to update the code

please keep a backup of your media and your excel as these might get overwritten in this process.
