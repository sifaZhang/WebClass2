var express = require('express');
var app = express();
var session = require('express-session');
var conn = require('./dbConfig');

app.set('view engine', 'ejs');

app.use(session({
    secret: 'yoursecret',
    resave: true,
    saveUninitialized: true
}));

app.use('/public', express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  res.render('home');
});

app.get('/auckland', function (req, res) {
  res.render('auckland');
});

app.get('/beaches', function (req, res) {
  res.render('beaches');
});

app.get('/login', function (req, res) {
  res.render('login.ejs');
});

app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
});

app.get('/listMPs', function (req, res) {
    conn.query('SELECT * FROM mps', function (err, results) {
        if (err) {
            console.log(err);
            throw err;
        }
        res.render('listMPs', { title: 'List of NZ MPs', MPsData: results });
    });
});

app.get('/addMPs', function (req, res, next) {
    if (req.session.loggedin) {
        res.render('addMPs');
    } else {
        res.send('Please login to view this page!');
    }
});

app.post('/addMPs', function (req, res, next) {
    var name = req.body.name;
    var party = req.body.party;
    var id = req.body.id;

    if (name && party && id) {
        conn.query('INSERT INTO mps (id, name, party) VALUES (?, ?, ?)', [id, name, party],
            function (err, results) {
                if (err) {
                    console.log(err);
                    throw err;
                }
                res.redirect('/listMPs');
            });
    } else {
        res.send('Please enter all fields!');
        res.end();
    }
});

app.post('/auth', function (req, res) {
    let username = req.body.username;
    let password = req.body.password;

    if (username && password) {
        conn.query('SELECT * FROM users WHERE name = ? AND password = ?', [username, password],
            function (err, results, fields) {
                if (err) {
                    console.log(err);
                    throw err;
                } 
                if (results.length > 0) {
                    req.session.loggedin = true;
                    req.session.user = username;
                    res.redirect('/membersOnly');
                } else {
                    res.send('Invalid name and/or password!');
                }
                res.end();
            });
    } else {
        res.send('Please enter name and password!');
        res.end();
    }
});

app.get('/membersOnly', function (req, res) {
    if (req.session.loggedin) {
        res.render('membersOnly');
    } else {
        res.send('Please login to view this page!');
    }
}   );

app.listen(3000);
console.log('Server is running on port 3000');