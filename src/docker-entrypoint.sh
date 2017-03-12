#!/bin/sh
cd /app
npm install
cd /app/bin
if [ "$1" ]
then
    PORT=$1 node ./www
else
    PORT=51360 node ./www
fi
