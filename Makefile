include .env

test:
	node test.js

install:
	npm install

deploy:
	sls deploy
