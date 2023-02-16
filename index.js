const express = require("express");
const mongoose = require('mongoose');
const ejs = require('ejs');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }))  //for accepting post data from frontend in array or string format
app.set("view engine", 'ejs');                      // to render ejs template as HTML 
app.use(express.static('public'));

console.log((new Date()).toLocaleDateString());
//--------------------
mongoose.connect("mongodb://0.0.0.0:27017/EventDriverDB");
const EventDriverSchema = new mongoose.Schema({
    EventDriverId: String,
    IsActive: Number,
    CreatedBy: String,
    ModifiedBy: String,
    CreatedDate: Date,
    ModifiedDate: Date,
    EventCollection: {
        EventId: String,
        EventName: String,
        VehicleId: String,
        SiteId: String,
        IsActive: Number,
        CreatedBy: String,
        ModifiedBy: String,
        CreatedDate: Date
    },
    DriverCollection: {
        DriverId: String,
        DriverName: String,
        IsActive: Number,
        CreatedBy: String,
        ModifiedBy: String,
        CreatedDate: Date,
        ModifiedDate: Date
    }
});
const userSchema = new mongoose.Schema({
    userName: String,
    email: String,
    password: String
});
const eventSchema = new mongoose.Schema({
    eventName: Array
})
const eventModel = mongoose.model("event", eventSchema);
// let events=new eventModel({eventName:['break','over speed','start','door open','door closed']
// });
// events.save();
//-----------------------------------------------------------------
let eventsArray = [];
//----------------- creating Model  i.e. collection in DB --------
const EventDriverModel = mongoose.model('eventDriver', EventDriverSchema);

const userModel = mongoose.model('user', userSchema);

//---- USER NAME & TOTAL COUNT ----------
let totalCount = 0;
let user_name = "";
//----------------------- Home   -----------------------------------
app.get('/', function (req, resp) {
    resp.render("login");
})
// ------------------- LOGIN -------------------------
app.post('/login', (req, resp) => {
    if (req.body.email === null) {
        resp.render("login");
    } else {
        userModel.findOne({ email: req.body.usermail }, (err, result) => {
            if (err) {
                console.log('something is incorrect..');
                resp.redirect('/')
            } else {
                console.log(result);

                if (result != null && req.body.password === result.password) {
                    console.log("user login successful....");
                    console.log("user: " + result.userName);
                    user_name = result.userName;
                    resp.redirect('/eventdriver');
                } else {
                    console.log("invalid crediantials....");
                    resp.redirect('/');
                }
            }
        })
    }
})
//------------------ SIGNUP ----------------------------
app.get('/signup', (req, resp) => {
    resp.render('signup');
})

app.post('/signup', (req, resp) => {
    
    if (req.body.usermail === null || req.body.username === null || req.body.password === null) {
        resp.redirect("/signup");
    } else {
        userModel.findOne({ email: req.body.usermail }, (err, result) => {
            if (err) {
                console.log(err);
                resp.redirect('/');
            } else {
                if (result == null) {
                    let user = new userModel({
                        userName: req.body.username,
                        email: req.body.usermail,
                        password: req.body.password
                    });
                    user.save();
                    user_name = req.body.username;
                    resp.redirect('/eventdriver');
                } else {
                    console.log("user already exists....")
                    resp.redirect('/');
                }
            }
        })
    }
})

// ----------------HOME ---------------
app.get('/eventdriver', (req, resp) => {
    if(user_name===""){
        resp.redirect('/');
        return;
    }
    getDataSize();
    getEventList();
    const EventDriverModel2 = mongoose.model('eventDriver', EventDriverSchema);
    EventDriverModel2.find({ IsActive: 1 }, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result.length);
            console.log("on event page: " + totalCount);
            // console.log(result);
            resp.render("home", { eventDriverObj: result });
        }
    })
});

//------------- ADD EVENT ------------------------------

app.get('/addeventdriver', (req, resp) => {
    if(user_name===""){
        resp.redirect('/');
        return;
    }
    getEventList();
    getDataSize();
    resp.render('addEventDriver', { eventsArray: eventsArray });
});
app.post('/addeventdriver', (req, resp) => {
    if(user_name===""){
        resp.redirect('/');
        return;
    }
    console.log("adding event .." + req.body.eventName + " by user " + user_name);
    console.log(req.body);
    console.log("on add event page count: " + totalCount);
    if (req.body.eventName === "" || req.body.driverName === "") {
        resp.render('addEventDriver', { eventsArray: eventsArray });
    }else {
        totalCount++;
        let newEventDriver = new mongoose.model('eventDriver', EventDriverSchema)({
            EventDriverId: "" + totalCount,
            IsActive: 1,
            CreatedBy: user_name,
            ModifiedBy: user_name,
            CreatedDate: (new Date(getDate().toString())),
            ModifiedDate: (new Date(getDate().toString())),
            EventCollection: {
                EventId: "1",
                EventName: req.body.eventName,
                VehicleId: "BH001",
                SiteId: "1",
                IsActive: 1,
                CreatedBy: "=",
                ModifiedBy: "",
                CreatedDate: (new Date("12-02-2023")).toLocaleDateString('en-GB')
            },
            DriverCollection: {

                DriverId: "1",
                DriverName: req.body.driverName,
                IsActive: 1,
                CreatedBy: "",
                ModifiedBy: "",
                CreatedDate: (new Date("12-02-2023")).toLocaleDateString('en-GB'),
                ModifiedDate: (new Date("12-02-2023")).toLocaleDateString('en-GB')
            }
        });
        newEventDriver.save();
        resp.redirect('/eventdriver');
    }
});

//---------------   EDIT  --------------
app.get('/editevent', (req, resp) => {
    if(user_name===""){
        resp.redirect('/');
        return;
    }
    console.log(req.query);
    getEventList();
    getDataSize();
    EventDriverModel.findOne({ EventDriverId: req.query.id }, (err, result) => {
        if (result != null) {
            resp.render("editEventDriver", { eventDriverObj: result, eventsArray: eventsArray });
        } else {
            resp.redirect("/eventdriver");
        }
    })

});

app.post('/editevent', (req, resp) => {
    if(user_name===""){
        resp.redirect('/');
        return;
    }
    const EventDriverModel2 = mongoose.model('eventDriver', EventDriverSchema);
    if (req.body.eventName === '') {
        EventDriverModel2.findOneAndUpdate({ EventDriverId: req.query.eventdriverId },
            {
                $set: {
                    'DriverCollection.DriverName': req.body.driverName,
                    'ModifiedBy': user_name
                }
            }, (err, result) => {

                if (err || result === null) {
                    console.log(err + "\n Not found");
                    resp.redirect("/eventdriver");
                } else {
                    console.log("udated document...");
                    resp.redirect('/eventdriver');
                }

            })
    } else if (req.body.driverName === '') {
        EventDriverModel2.findOneAndUpdate({ EventDriverId: req.query.eventdriverId },
            {
                $set: {
                    'EventCollection.EventName': req.body.eventName,
                    'ModifiedBy': user_name
                }
            }, (err, result) => {

                if (err || result === null) {
                    console.log(err + "\n Not found");
                    resp.redirect("/eventdriver");
                } else {
                    console.log("udated document...");
                    resp.redirect('/eventdriver');
                }
            })
    } else {
        EventDriverModel2.findOneAndUpdate({ EventDriverId: req.query.eventdriverId },
            {
                $set: {
                    'EventCollection.EventName': req.body.eventName,
                    'DriverCollection.DriverName': req.body.driverName,
                    'ModifiedBy': user_name
                }
            }, (err, result) => {

                if (err || result === null) {
                    console.log(err + "\n Not found");
                    resp.redirect("/eventdriver");
                } else {
                    console.log("udated both document...");
                    resp.redirect('/eventdriver');
                }
            })
    }
})
//------------------- DELETE ------------
app.get('/deleteevent', (req, resp) => {
    if(user_name===""){
        resp.redirect('/');
        return;
    }
    console.log(req.query);
    const EventDriverModel2 = mongoose.model('eventDriver', EventDriverSchema);
    EventDriverModel2.findOneAndUpdate({ EventDriverId: parseInt(req.query.id) },   // <<--- string to int
        {
            $set: {
                'IsActive': 0
            }
        }, (err, result) => {
            if (err || result === null) {
                console.log(err + "\n Not found");
                resp.redirect("/eventdriver");
            } else {
                console.log("partial delete document...");
                resp.redirect('/eventdriver');
            }
        })
});

//----------------------------------
app.listen(3000, () => {
    console.log("server running on port 3000 ....");
})


//-----------------------------------
function getDataSize() {
    mongoose.model('eventDriver', EventDriverSchema).find((err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log("size: " + result.length);
            totalCount = result.length;
        }
    })
}

//------ get list of events -----------

function getEventList() {
    eventModel.find((err, result) => {
        if (err) {
            console.log(err);
        } else {
            // console.log(result);
        }
        eventsArray = result[0].eventName;
        // console.log(eventsArray);
    })
}

//-------------GEt Date in MM//DD/YYYY format
function getDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;

    var yyyy = today.getFullYear();
    return mm + "-" + dd + "-" + yyyy;
}

