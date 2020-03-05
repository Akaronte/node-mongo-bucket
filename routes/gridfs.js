const express = require('express');
const router = express.Router();
var mongoose = require('mongoose');
var streamifier = require('streamifier');
var fs = require('fs');

// DB
const mongoURI = "mongodb://localhost:27017/bucket";

// connection
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let gridfsbucket;
conn.once("open", () => {

  gridfsbucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "filesBucket"
  });
});
// curl -F 'file=@/root/plus.png' http://192.168.1.X:3000/uploadfile

//curl -F 'files[]=@/path/to/fileX' -F 'files[]=@/path/to/fileY' ... http://localhost/upload
router.post('/uploadfile', (req, res) => {
    
    let filename = req.files.file.name;
   
    streamifier.createReadStream(req.files.file.data,).
        pipe(gridfsbucket.openUploadStream(filename,{metadata:req.body})).
        on('error', function (error) {
            assert.ifError(error);
        }).
        on('finish', function () {
            console.log('done!');
            res.status(200).json({
                success: true,
                msg: 'File Uploaded successfully..'
            });
        });
})

router.get("/files", (req, res) => {

    gridfsbucket.find().toArray((err, files) => {

      if (!files || files.length === 0) {
        return res.status(404).json({
          err: "no files exist"
        });
      }
      let beauty_files = files.map(file => {
          return file.filename
      })

      return res.json(beauty_files);
    });
  });

router.delete('/delete/:filename', (req, res) => {

  gridfsbucket.find({
      filename: req.params.filename
  })
  .toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: "no files exist"
      });
    }
    gridfsbucket.delete(files[0]._id)
    console.log('delete file')
    res.status(200).json({
      success: true,
      msg: 'File Uploaded successfully..'
  });
  });  
});

//download curl -X GET 'http://192.168.1.X:3000/download/netscan.xml' -o netscan.xml
router.get('/download/:filename', (req, res) => {

    gridfsbucket.find({
      filename: req.params.filename
    })
    .toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: "no files exist"
        });
      }
      gridfsbucket.openDownloadStreamByName(req.params.filename).pipe(res);
    });
})
//write in disk
router.get('/write/:filename', (req, res) => {
    const filename = req.params.filename;

    gridfsbucket.openDownloadStreamByName(filename).
    pipe(fs.createWriteStream('./'+filename)).
        on('error', function (error) {
            console.log("error" + error);
            res.status(404).json({
                msg: error.message
            });
        }).
        on('finish', function () {
            console.log('done!');
            res.send('write successfully!')
        });
})

module.exports = router;