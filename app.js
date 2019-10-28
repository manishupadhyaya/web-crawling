//Requiring
const express = require('express')
const request = require('request')
const cheerio = require('cheerio')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
//Express
const app = express();

//Body parser Usage
app.use(bodyParser.urlencoded({
    extended: true
}))
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
app.get('/', (req, res) => {
    res.render('network');
})

app.post('/find', (req, res) => {
    var data = req.body.key;
    console.log(data);

    Network.find({
        $text: {
            $search: data
        }
    }, {
        score: {
            $meta: 'textScore'
        }
    }, (err, docs) => {
        res.render('networkShow', {
            docs
        });
    })
})

app.get('/scrape1', (req, res) => {
    request('https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q=computer+network&btnG=', (error, res, html) => {
        if (!error && res.statusCode == 200) {
            const $ = cheerio.load(html);
            $('#gs_res_ccl_mid').each((i, el) => {
                    $(el).find('.gs_rt').each((i, el) => {

                            let title = $(el).find('a').text();
                            let link = $(el).find('a').attr('href');
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
})


app.get('/scrape2',(req,res)=>{
    request('https://scholar.google.com/scholar?start=10&q=computer+network&hl=en&as_sdt=0,5')
})

var port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
})