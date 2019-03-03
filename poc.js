const fs = require('fs');
const {
  google
} = require('googleapis');
const {request} = require('gaxios');


const TOKEN_PATH = 'token.json';

fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  authorize(JSON.parse(content), listFiles);
});


function authorize(credentials, callback) {
  const {
    client_secret,
    client_id,
    redirect_uris
  } = credentials.web;

 
  
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) console.log(err);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}



function listFiles(auth) {
  const drive = google.drive({
    version: 'v3',
    auth
  });

  var file_ids_array = [];
  drive.files.list({
    pageSize: 1000,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length != 0) {
      files.map((file) => {
        fs.appendFileSync('file_names.txt', `${file.name}` +"\t\t\t\t\t\t" +`${file.id}` + '\n', (err) => console.log(err));
        console.log(`${file.name}` +"\t\t\t\t\t\t" +`${file.id}` )
       
      });
    } else {
      console.log('No files found.');
    }
  });

  // setTimeout(download, 10000, 'download');

  function ind_download(file_id, file_type){

    if (fileId != null) {
      var dest = fs.createWriteStream(`${fileId}` + '.' + `${file_type}`);
      drive.files.get({
          fileId: fileId,
          alt: 'media'
        }, {
          responseType: 'stream'
        },
        function (err, res) {
          res.data
            .on('end', () => {
              console.log('[+] Downloaded ' + `${fileId}` + `${file_type}`);
            })
            .on('error', err => {
              console.log('[-] Download Failed ' + `${fileId}` + `${file_type}`, err);
            })
            .pipe(dest);
        }
      );
    }

  }


  function download() {
    console.log('[+] Downloading');
    file_ids_array.forEach(fileId => {
      console.log(fileId);
      if (fileId != null) {
        var dest = fs.createWriteStream(`${fileId}` + '.pdf');
        drive.files.get({
            fileId: fileId,
            alt: 'media'
          }, {
            responseType: 'stream'
          },
          function (err, res) {
            res.data
              .on('end', () => {
                console.log('[+] Downloaded ' + `${fileId}` + '.pdf');
              })
              .on('error', err => {
                console.log('[-] Download Failed ' + `${fileId}` + '.pdf', err);
              })
              .pipe(dest);
          }
        );
      }

    });
  }
}


