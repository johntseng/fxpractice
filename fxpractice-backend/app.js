"use strict";
var express = require("express");
var bodyParser = require("body-parser");
var pgPromise = require("pg-promise");
var _ = require("lodash");
var moment = require("moment");
var App = (function () {
    function App() {
        var _this = this;
        console.log('starting server');
        var app = this.express = express();
        app.use(bodyParser.json());
        this.initializeDatabase();
        this.initializeAvailableDates();
        app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
        app.get('/', function (request, response) {
            response.json({
                hello: 'world!!!'
            });
        });
        app.get('/tickCount', function (request, response) {
            _this.db.one('select count(*) as count from ticks')
                .then(function (result) {
                response.json({
                    count: result.count
                });
            })
                .catch(function () {
                response.json({
                    error: 'error'
                });
            });
        });
        app.post('/addTick', function (request, response) {
            _this.db.none("insert into ticks (time, bid, ask) values ($(time), $(bid), $(ask));", request.body)
                .then(function () {
                response.json({ success: true });
            })
                .catch(function () {
                response.json({ success: false });
            });
        });
        app.post('/addTicks', function (request, response) {
            Promise.all(request.body.map(function (tick) {
                return _this.db.none("insert into ticks (time, bid, ask) values ($(time), $(bid), $(ask));", tick);
            }))
                .then(function () {
                response.json({ success: true });
            })
                .catch(function () {
                response.json({ success: false });
            });
        });
        app.get('/initial-data', function (request, response) {
            var selectedDate = _.sample(_this.availableDates);
            _this.getScenarioData(selectedDate)
                .then(function (scenario) {
                response.json({
                    availableDates: _this.availableDates,
                    initialScenario: scenario
                });
            })
                .catch(function (error) { return response.json(error); });
        });
    }
    App.prototype.getScenarioData = function (datetime) {
        var date = moment(datetime).utc().startOf('day');
        var windowDuration = 15 * 60 * 1000;
        var simulationStartTime = date.clone().add(8.5, 'hours');
        var simulationStartTimeMSE = simulationStartTime.valueOf();
        var viewStartTime = simulationStartTime.clone().subtract(windowDuration, 'milliseconds');
        var endTime = simulationStartTime.clone().add(1, 'hour');
        return this.db.any("select extract(epoch from time) * 1000 as time, bid, ask\nfrom ticks\nwhere time BETWEEN $(startTime)\n              and  $(endTime);", { startTime: viewStartTime.toISOString(), endTime: endTime.toISOString() })
            .then(function (rawTicks) {
            var allTicks = rawTicks.map(function (t) { return ({
                time: t.time,
                bid: parseFloat(t.bid),
                ask: parseFloat(t.ask)
            }); });
            var initialData = allTicks
                .filter(function (t) { return t.time < simulationStartTimeMSE; });
            return {
                name: "EUR/USD - " + date.format('ddd MMM D, YYYY'),
                windowMilliseconds: windowDuration,
                simulationStartTime: simulationStartTime.valueOf(),
                initialDataSets: [
                    {
                        name: 'Bid',
                        data: initialData.map(function (t) { return [t.time, t.bid]; })
                    },
                    {
                        name: 'Ask',
                        data: initialData.map(function (t) { return [t.time, t.ask]; })
                    }
                ],
                simulationTicks: allTicks
                    .filter(function (t) { return t.time >= simulationStartTimeMSE; })
            };
        });
    };
    App.prototype.initializeDatabase = function () {
        if (process.env.DEBUG) {
            this.db = pgPromise()({
                host: 'localhost',
                database: 'fxpractice',
                user: 'postgres',
                password: 'postgres'
            });
        }
        else {
            this.db = pgPromise()({
                host: 'localhost',
                database: 'johntsen_fxpractice',
                user: 'johntsen_fxpractice_user',
                password: 'C$3Xmo4C^5CXO6W%2YQn',
            });
        }
    };
    App.prototype.initializeAvailableDates = function () {
        var _this = this;
        console.log('loading available dates');
        this.db.any("with t as (\nselect cast(time as date) date\nfrom ticks\nwhere cast(time as time) between '8:00' and '9:00'\n)\nselect date\nfrom t\ngroup by date\norder by date")
            .then(function (results) {
            _this.availableDates = results
                .map(function (row) { return row.date; });
            console.log('available dates initialized');
        }, function (error) {
            console.log(error);
            console.log('available dates failed');
        });
    };
    return App;
}());
module.exports = new App().express;
