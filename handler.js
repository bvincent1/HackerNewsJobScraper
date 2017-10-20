'use strict';

const request = require('request');
const cheerio = require('cheerio');
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
    subject: 'New StartupJobScraper Jobs!',
    text: plaintext,
    html: html
  };

  transporter.sendMail(mail, callback);
}

function join(list1, list2) {
  let l = [];
  for (let i = 0; i < list1.length; i++) {
    l.push({'title': list1[i], 'link': list2[i] || null});
  }
  return l;
}

module.exports.cron = (err, context, callback) => {
  const options = {
    url: 'https://www.startupedmonton.com/jobs/',
    headers: {
      'User-Agent': 'hackerNewsJobScraper'
    }
  };

  request(options, (err, resp, body) => {
    if (err) {
      callback(true, err);
    }
    else {
      const $ = cheerio.load(body);

      try {
        var titles = [];
        var links = [];
        $('.sqs-block-content h3').slice(1).each((i, val) => {
          titles.push($(val).text());
        });

        $('a.sqs-block-button-element').each((i, val) => {
          links.push($(val).attr('href'));
        });

        var data = join(titles, links);
        console.log(data); // log to cloudwatch
        sendEmail(data, (err, info) => {
          if (err) {
            callback(true, err);
          }
          else {
            let msg = JSON.stringify({"getCode": resp && resp.statusCode, "emailCode": info && info.response });
            callback(null, {'message':  msg});
          }
        });
      } catch (err) {
        callback(true, err);
      }
    }
  });
};
