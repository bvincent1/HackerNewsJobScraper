include .env

test:
	node test.js

deploy:
	sls deploy
