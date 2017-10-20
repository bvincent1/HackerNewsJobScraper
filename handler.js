'use strict';

const request = require('request');
const rp = require('request-promise');
const nodemailer = require('nodemailer');

const TARGET = 'benjc.vincent@gmail.com'

function sendEmail(data, callback) {
  let smtpConfig = {
    host: process.env.SUBSCRIBE_EMAIL_HOST,
    port: 587,
    secure: false,
    auth: {
        user: process.env.SUBSCRIBE_EMAIL_USER,
        pass: process.env.SUBSCRIBE_EMAIL_PASS
    }
  };

  let transporter = nodemailer.createTransport(smtpConfig);

  let plaintext = '';
  let html = '';

  for (let job of data) {
    plaintext += job.title + '\n' + job.link + '\n\n'
    html += '<p><b><a href="' + job.link + '">' + job.title + '</a></b></p>'
  }

  let mail = {
    from: '"Subscribe" <subscribe@hacknslash.io>',
    to: TARGET,
    subject: 'New HackerNewsJobScraper Jobs!',
    text: plaintext || 'No new jobs today!',
    html: html || '<p><b>No new jobs today!</b></p>'
  };

  transporter.sendMail(mail, callback);
}

function checkJob(job) {
  if (job.title && job.title.toLowerCase().indexOf('edmonton') > -1) {
    return {title: job.title, link: job.url, id: job.id};
  }
  if (job.text && job.text.toLowerCase().indexOf('edmonton') > -1) {
    return {title: job.title, link: job.url, id: job.id};
  }

  return null;
}

function getJson(uri) {
  const options = {
    headers: {
      'User-Agent': 'HackerNewsJobScraper'
    },
    uri: uri,
    json: true
  };
  return rp(options);
}

module.exports.cron = (err, context, callback) => {
  let uri =  'https://hacker-news.firebaseio.com/v0/jobstories.json?print=pretty';

  getJson(uri).then((data) => {
    let responses = data.map((id) => {
      return getJson(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`);
    });

    Promise.all(responses).then((jobObjects) => {
      let jobs =  jobObjects
        .filter((job) => { return checkJob(job); });

      console.log(jobs); // log to cloudwatch
      sendEmail(jobs, (err, info) => {
        if (err) {
          callback(true, err);
        }
        else {
          const msg = JSON.stringify({
            "getCode": '200',
            "emailCode": info && info.response
          });
          callback(null, {'message':  msg});
        }
      });
    }).catch(function (err) {
        callback(true, err);
    });
  })
  .catch((err) => {
    callback(true, err)
  });
};
