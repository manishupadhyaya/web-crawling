//Requiring
const express = require('express')
const request = require('request')
const cheerio = require('cheerio')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

//Express
const app = express();

//Body parser Usage
app.use(express.static(__dirname + '/public'))

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json());
//Requiring Models
const Network = require('./models/Network');

//View Engine
app.set('view engine', 'ejs')

//Mongoose
mongoose.Promise = global.Promise;

const db = 'mongodb://localhost:27017/Network'
mongoose.connect(db, {
        useNewUrlParser: true
    })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

//Request
//Routes
app.get('/home', (req, res) => {
    mongoose.connection.db.dropCollection('networks')
    res.render('home');
})
app.get('/about',(req,res)=>{
    res.render('about');
})
app.get('/search',(req,res)=>{
    res.render('search');
})
app.get('/member',(req,res)=>{
    res.render('member');
})
app.get('/find', (req, res) => {
    // var data = req.body.key;
    // console.log(data);

    Network.find({
    //     $text: {
    //         $search: data
    //     }
    // }, {
    //     score: {
    //         $meta: 'textScore'
    //     }
    }, (err, docs) => {
        res.render('networkShow', {
            docs
        });
    })
})

app.post('/scrape', (req, res) => {
    var data = req.body.key;
    console.log(data);
    var final;
    for(let i=0;i<data.length;i++)
    {
        if(data[i]==' ')
        {
            final+='+';
        }
        else
        {
            final+=data[i];
        }
    }
    console.log(final)
    request(`https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q=${final}&btnG=`, (error, res, html) => {
        if (!error && res.statusCode == 200) {
            const $ = cheerio.load(html);
            $('#gs_res_ccl_mid').each((i, el) => {
                    $(el).find('.gs_rt').each((i, el) => {

                            let title = $(el).find('a').text();
                            let link = $(el).find('a').attr('href');
                            console.log(title, link);
                            const newNetwork = new Network({
                                title,
                                link
                            })
                            newNetwork.save((err) => {
                                if (err) {
                                    console.log("Error in form 2 is: ", err)
                                }
                            })
                        })
            });
        }
    })
    res.redirect('/find')
})
app.post('/showEmail',(req,res)=>{
        // console.log(req.body.link);
        let pdfUrl = req.body.link
        if(pdfUrl.includes('.pdf'))
        {
            var PDFParser = require("./node_modules/pdf2json/PDFParser");
            var pdfParser = new PDFParser(this,1);
            var pdfPipe = request({url: pdfUrl, encoding:null}).pipe(pdfParser);

            pdfPipe.on("pdfParser_dataError", err => console.error(err) );
            pdfPipe.on("pdfParser_dataReady", pdf => {
                let usedFieldsInTheDocument = pdfParser.getRawTextContent();
                console.log(usedFieldsInTheDocument)

                function findEmailAddresses(StrObj) {
                    var separateEmailsBy = ", ";
                    var email = "<none>"; // if no match, use this
                    var emailsArray = StrObj.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\\.[a-zA-Z0-9._-]+)/gi);
                    if (emailsArray) {
                        email = "";
                        for (var i = 0; i < emailsArray.length; i++) {
                            if (i != 0) email += separateEmailsBy;
                            email += emailsArray[i];
                        }
                    }
                    return email;
                }
                console.log(findEmailAddresses(usedFieldsInTheDocument));

            });
        }
})

var port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
})