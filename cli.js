#!/usr/bin/env node
import minimist from "minimist";
import fetch from "node-fetch";
import moment from "moment-timezone";

const args = minimist(process.argv.slice(2))

if (args.h){
    console.log(`Usage: galosh.js [options] -[n|s] LATITUDE -[e|w] LONGITUDE -z TIME_ZONE
        -h            Show this help message and exit.
        -n, -s        Latitude: N positive; S negative.
        -e, -w        Longitude: E positive; W negative.
        -z            Time zone: uses tz.guess() from moment-timezone by default.
        -d 0-6        Day to retrieve weather: 0 is today; defaults to 1.
        -j            Echo pretty JSON from open-meteo API and exit.
    `);
    process.exit(0);
}

let lat = 0;
let long = 0;

if(args.n && args.s) {
    console.log('Provide only one Latitude');
    process.exit(0);
}
if(args.n) {
    lat = args.n;
} else if (args.s) {
    lat = -args.s;
}

if(args.e && args.w) {
    console.log('Provide only one Longitude');
    process.exit(0);
}
if(args.e) {
    long = args.e;
} else if (args.w) {
    long = -args.w;
}

// always take a guess at the timezone in case the user does not specify.
let tz = moment.tz.guess();

// if timezone is specified, update its value
if(args.z) {
    tz = args.z;
}

let day_to_check = 1; // default the day to check to tomorrow.
if((args.d || args.d===0) && args.d <= 6) { //be careful to still update result even if user specifies today by using a 0
    day_to_check = args.d;
} else if (args.d > 6 || args.d < 0) {
    console.log("your days argument is out of bounds.")
}

// Make API call for the specified lat and long and timezone
const response =
    await fetch(
    'https://api.open-meteo.com/v1/forecast?latitude='
    + lat
    + '&longitude='
    + long +
    '&daily=precipitation_hours&timezone='
    + tz);

const data = await response.json();

let needYourGaloshes = ''
if(data.daily.precipitation_hours[day_to_check] >= 0){
    needYourGaloshes = 'You might need your galoshes ';
} else {
    needYourGaloshes = "You probably won't need your galoshes ";
}

if (day_to_check === 0) {
    needYourGaloshes = needYourGaloshes + "today.";
} else if (day_to_check > 1) {
    needYourGaloshes = needYourGaloshes + "in " + day_to_check + " days.";
} else {
    needYourGaloshes = needYourGaloshes + "tomorrow.";
}

if(args.j) {
    console.log(data);
    process.exit(0)
}

console.log(needYourGaloshes);
