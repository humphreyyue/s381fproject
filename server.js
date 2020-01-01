var http = require('http');
var fs = require('fs');
var formidable = require("formidable");
var multer  = require('multer')
var express = require('express');
var session = require('cookie-session');
var app = module.exports = express();
var {ObjectId} = require('mongodb'); 
var bodyParser = require('body-parser');




app.set('trust proxy',1);
app.use(express.urlencoded({ extended: false }))
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.use(session({
    secret: 'humphrey',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge:86400} 
  }));

app.use(function(req, res, next) {
    res.locals.login = req.session.login;
    res.locals.username = req.session.username;
  

    next();
  });

var url = 'mongodb+srv://humphreyyue:123123123@project-dxn3p.azure.mongodb.net/test?retryWrites=true&w=majority';
var MongoClient = require('mongodb').MongoClient;
var new_r = {};


app.listen(app.listen(process.env.PORT || 80 ))


app.get('/index', (req, res) => {

    /////////////////////If session existed, next step//////////////////
    MongoClient.connect(url, function (err, db) {
        if(err) throw err;
        var db2 = db.db("project");
        console.log('mongodb is running!');
        console.log("Switched to "+db2.databaseName+" database"); 
        
            db2.collection("photo").find({}).toArray(function(err, data) {
                db.close();
               // console.log(result[0].name);  
                    res.render('index', {result: data})
                });


    });

   // res.render('index');
   });

app.post('/index', (req, res) => {
    res.render('index');
   });

app.get('/map', function(req,res) {
    if ( req.query.latitude = '' || req.query.longitude == '' )
    res.send('Uncorrect GPS message');
    else
    res.render('map', { latitude: req.query.latitude, longitude: req.query.longitude })

});


app.get('/', function(req,res) {
    res.redirect('/create')
});




app.get('/display', (req, res) => {

    MongoClient.connect(url, function (err, db) {
        if(err) throw err;
        //Write databse Insert/Update/Query code here..
        var db2 = db.db("project");
        console.log('mongodb is running!');
        console.log("Switched to "+db2.databaseName+" database"); 
       // res.writeHead(200,{"Content-Type": "text/html"});
      //  res.write('<html><body>');
     //   res.write('Hello   ' + req.session.username );
        
        var id = { _id : ObjectId(req.query._id) }; 
        console.log(req.query._id);
            db2.collection("photo").findOne(id,function(err, data) {
            if (data != null) {
                db.close();
                    res.render('display', { result: data  });     
            }       
            else{
                console.log('null');
                db.close(); }
            }); 
        }); 
 
   });




app.get('/Create', (req, res) => {
    res.render('Create');
   });


app.post('/create', function(req, res, next){
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        console.log('2');
        // console.log(JSON.stringify(files));
            const filename = files.filetoupload.path;
            let title = "untitled";
            //
            let description = "n/a"
            //
            let mimetype = "images/jpeg";
            if (fields.title && fields.title.length > 0) {
                title = fields.title;
            }
            //
            if (fields.description && fields.description.length > 1) {
                description = fields.description;
            }
            //
            if (files.filetoupload.type) {
                mimetype = files.filetoupload.type;
            }
           fs.readFile(files.filetoupload.path, (err,data) => {    
                    MongoClient.connect(url, function (err, db) {
                    const db2 = db.db('project');
                    new_r['title'] = title;
                    new_r['description'] = description;
                    new_r['mimetype'] = mimetype;
                    new_r['image'] = new Buffer.from(data).toString('base64');

                    var _coord = { latitude: fields.latitude , longitude: fields.longitude};
                    var doc = { restaurant_id: fields.r_id ,
                                name: fields.name , 
                               borough: fields.borough,
                               photo: new_r['image'],
                               mimetype: new_r['mimetype'],
                               address: { street: fields.street,
                                   building: fields.building,
                                   zipcode: fields.zipcode,
                                   street: fields.street,
                                   coord: _coord,
                               },

							   
                    }; 
                    console.log(doc);
                    db2.collection("photo").insertOne(doc, function(err, res) {
                        if (err) throw err;
                            console.log("Document inserted");      
                                db.close();
                             }); 
                               })
        });
	

            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('Upload photo was successful');
            res.write('<form action="/index">');
            res.write('<input type="submit" value="Go Back"/>');
            res.write('</form>');
            res.end();

    });
});





//git add .
//git commit -m '版本訊息'
//git push heroku master

// 