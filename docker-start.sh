#!/bin/bash

printf "\n\n\nNpm install:"
npm install

# printf "\n\n\nRollback migration:\n"
# node ace migration:rollback

printf "\n\n\nRun migration:\n"
node ace migration:run

printf "\n\n\nStart node server:"
node ace test
# node ace test --watch
node ace serve --watch --node-args="--inspect=0.0.0.0"
