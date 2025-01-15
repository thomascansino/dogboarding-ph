const fs = require('fs');
const { Readable } = require('stream');
const { google } = require('googleapis');
const SCOPE = ['https://www.googleapis.com/auth/drive'];

// Initialize Google Drive API w/ authorization
const authorize = async () => {
    const jwtClient = new google.auth.JWT( // use JWT client
        process.env.GOOGLE_CLIENT_EMAIL, // service account email
        null, 
        process.env.GOOGLE_PRIVATE_KEY, // service account private key
        SCOPE, // url of google apis
    );

    await jwtClient.authorize(); 

    return jwtClient;
};

// Upload file to google drive then retrieve its public URL
const uploadToDrive = (authClient, file, filename, folderId, isUnique) => {
    return new Promise(async (resolve, reject) => { // this will return the file's public URL
        
        const drive = google.drive({ version: 'v3', auth: authClient });

        // file metadata
        const fileMetaData = {
            name: filename, // file name to be displayed in google drive
            parents: [folderId], // google drive folder ID
        };
        
        // Convert buffer to readable stream
        const bufferStream = new Readable(); // add readable stream object
        bufferStream.push(file.buffer); // add buffer into the readable stream
        bufferStream.push(null); // signal the end of stream

        // media object
        const media = {
            mimeType: file.mimetype, // file mime type
            body: bufferStream, // must be a readable stream
        };
       

        try {
            // delete existing files with the same name
            if ( isUnique ) {
                // search for existing files with the same name in the specified folder
                const searchResponse = await drive.files.list({
                    // q:                       = query parameter in files.list method to filter the files returned based on specific criteria
                    // '${folderId}' in parents = file must be located within the specified folder id
                    // name = '${filename}'     = filter to include only those that matches the filename
                    // trashed = false          = files.list method includes trashed files by default, exclude them in this scenario
                    q: `'${folderId}' in parents and name = '${filename}' and trashed = false`,
                    fields: 'files(id, name)', // specify which fields to include in the response (e.g. files = { id, property })
                });

                const existingFiles = searchResponse.data.files;

                // delete existing files with the same name
                if (existingFiles.length > 0) {
                    for (const existingFile of existingFiles) { // iterate through existingFiles and delete files with the same name 1 by 1
                        await drive.files.delete({ fileId: existingFile.id });
                        console.log(`Deleted existing file: ${existingFile.name} (ID: ${existingFile.id})`);
                    };
                };
            };

            // upload file to google drive
            const fileResponse = await drive.files.create({
                resource: fileMetaData,
                media: media,
                fields: 'id', // return file ID
            });

            const fileId = fileResponse.data.id; // file ID

            // set file permissions to make it public
            await drive.permissions.create({
                fileId: fileId, // file ID
                requestBody: {
                    role: 'reader', // reader for public
                    type: 'anyone', // anyone with the link can access
                },
            });

            // resolve with the file's public URL
            resolve(fileId);

        } catch (err) {
            console.error('Error uploading to Google Drive:', err);
            // reject the file if there's an error while executing the function
            reject(err);
        };

    });
};

// Delete file in google drive via file id
const deleteFileInDrive = async (authClient, fileId) => {

    const drive = google.drive({ version: 'v3', auth: authClient });
    
    try {
        await drive.files.delete({ fileId });
        console.log('File deleted successfully in drive:', fileId);
    } catch (err) {
        console.error('Error deleting file in Google Drive:', err);
    };

};

// Delete files in google drive via chat id
const deleteFileInDriveViaChatId = async (authClient, chatId, folderId) => {
    const drive = google.drive({ version: 'v3', auth: authClient });

    try {
        // search for existing files with the same name in the specified folder
        const searchResponse = await drive.files.list({
            // q:                               = query parameter in files.list method to filter the files returned based on specific criteria
            // '${folderId}' in parents         = file must be located within the specified folder id
            // name contains '${filename}'      = filter to include only those that contains the substring filename
            // trashed = false                  = files.list method includes trashed files by default, exclude them in this scenario
            q: `'${folderId}' in parents and name contains '${chatId}' and trashed = false`,
            fields: 'files(id, name)', // specify which fields to include in the response (e.g. files = { id, property })
        });

        const existingFiles = searchResponse.data.files;

        // delete existing files that matches the query
        if (existingFiles.length > 0) {
            // iterate through existingFiles and delete all files that matches the query.
            await Promise.all(
                existingFiles.map(async (file) => {
                    await drive.files.delete({ fileId: file.id });
                    console.log(`Deleted existing file: ${file.name} (ID: ${file.id})`);
                }),
            );
        };

        return;
    } catch (err) {
        console.error('Error deleting files in Google Drive:', err);
    };
};

module.exports = { 
    authorize, 
    uploadToDrive, 
    deleteFileInDrive,
    deleteFileInDriveViaChatId
};

