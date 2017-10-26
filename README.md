# HackerNewsJobScraper

## Description
Poll hacker new's [job posting page](https://news.ycombinator.com/jobs) firebase api and email the keyword match results to me. Simple cron job that runs Monday to Friday at 8am MST.

## Installation
This uses the [Serverless](https://serverless.com/) framework and [AWS Lambda](http://docs.aws.amazon.com/lambda/latest/dg/welcome.html) natively. It is entirely possible to configure it to use a different provider via `serverless.yml`, but I wont go into that and will proceed as if we are using AWS.

Ensure you have the latest serverless release. Clone, fork, or copy this repo and create a `.env` file at the project root. In that file you will need to declare the email provider host name, your email, and your password. This file will remain on your local machine only ([.gitignore](https://github.com/bvincent1/StartupJobScraper/blob/master/.gitignore#L8)), and the env variables will be safely stored on aws via serverless.

```bash
# example .env file
export SUBSCRIBE_EMAIL_HOST=smpt.zoho.com
export SUBSCRIBE_EMAIL_USER=subcribe@zoho.com
export SUBSCRIBE_EMAIL_PASS=whatever_pass
```

*Special Note* This implementation only works with smtp authorization. Gmail doesn't support this anymore, and therefore will require a different service. I use [zoho.com](https://www.zoho.com/) and their mail service for this project.

To install the dependencies run
`make install`

and then run
`make deploy`

For local testing and / or local running simply run
`make test`
