var express = require('express');
var router = express.Router();
var md5 = require('md5');
var fs = require('fs');
var path = require('path');

/* GET home page. */
router.get('/', function getHomepage(req, res, next) {
  res.render('index', { title: 'Forum' });
});

router.get('/new', function getNewForm(req, res, next) {
  var messages = {
    'missing': 'Some fields were missing or not properly completed',
    'save': 'Unable to save the form information'
  };
  res.render('new', {
    title: 'Forum | New Crowd ',
    message1: req.session.message1,
    message2: req.session.message2,
    people: req.session.people,
  });
});

router.post('/new', function postNewForm(req, res, next) {
  var keys = Object.keys(req.body);
  var peopleInfo = keys.slice(2)
    .filter(function(k) { return req.body[k]; })
    .map(function(k) { return req.body[k]; })
  var numPeople = peopleInfo.length / 2;
  // console.log(peopleInfo, numPeople);

  var people = [];
  for (var i = 0; i < peopleInfo.length; i += 2) {
    people.push({ name: peopleInfo[i], phone: peopleInfo[i + 1] });
  }
  req.body.people = people;

  req.session.message1 = req.body.message1;
  req.session.message2 = req.body.message2;
  req.session.people = req.body.people;

  if (!req.body.message1
    || !req.body.message2
    || !(req.body.people && valid(req.body.people))) {
    return res.redirect('/new?error=missing');
  }

  var configuration = {
    message1: req.body.message1,
    message2: req.body.message2,
    people: req.body.people,
    password: md5((new Date()) + req.body.message1 + req.body.message2).substring(0, 10)
  };

  var id = md5((new Date()) + req.body.message1 + req.body.message2).substring(10, 25);
  var config = path.join(__dirname, '..', 'data', id);
  var configContents = JSON.stringify(configuration, null, 2);

  fs.writeFile(config + '.json', configContents, function (err) {
    if (err) { return res.redirect('/crowd/' + id); }
    return res.redirect('/crowd/' + id);
  })
});

router.get('/crowd/:id', function getCrowdView(req, res, next) {
  if (!req.params.id) { return res.redirect('/new'); }
  var id = req.params.id;

  var config = path.join(__dirname, '..', 'data', id);
  fs.readFile(config + '.json', function (err, data) {
    if (err) { return res.redirect('/new?error=save'); }

    var configContents = JSON.parse(data);
    console.log(configContents)
    res.render('crowd', {
      title: 'Forum | Crowd',
      config: configContents, id
    });
  });
});

router.get('/config', function getConfigAndroid(req, res, next) {
  var id = req.query.id;
  if (!id) {
    return res.json({ status: 'err' });
  }

  var config = path.join(__dirname, '..', 'data', id);
  fs.readFile(config + '.json', function (err, data) {
    if (err) { return res.json({ status: 'err' }); }

    var configContents = JSON.parse(data);

    res.json({
      status: 'ok',
      item: configContents
    });
  });
});

module.exports = router;

function valid(people) {
  if (!people || !people.length) { return false; }

  var valid = true;
  people.forEach(function (person) {
    if (!person
      || !(typeof person.name === 'string')
      || !(typeof person.phone === 'string')
      || !person.phone.match(/^\+1[\d]{10}$/)) {
      valid = false;
    }
  });
  return valid;
}
