import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as pgPromise from 'pg-promise';
import * as _ from 'lodash';
import * as moment from 'moment';

interface IExtensions {
}

class App {
    public express: express.Application;
    private db: pgPromise.IDatabase<IExtensions>;
    private availableDates: Date[];

    constructor() {
        console.log('starting server');
        let app = this.express = express();
        app.use(bodyParser.json());
        this.initializeDatabase();
        this.initializeAvailableDates();

        app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        app.get('/', (request, response) => {
            response.json({
                hello: 'world!!!'
            });
        });

        app.get('/tickCount', (request, response) => {
            this.db.one('select count(*) as count from ticks')
                .then(result => {
                    response.json({
                        count: result.count
                    });
                })
                .catch(() => {
                    response.json({
                        error: 'error'
                    });
                });
        });

        app.post('/addTick', (request, response) => {
            this.db.none("insert into ticks (time, bid, ask) values ($(time), $(bid), $(ask));", request.body)
                .then(() => {
                    response.json({success: true});
                })
                .catch(() => {
                    response.json({success: false});
                });
        });

        app.post('/addTicks', (request, response) => {
            Promise.all(request.body.map(tick => {
                return this.db.none("insert into ticks (time, bid, ask) values ($(time), $(bid), $(ask));", tick);
            }))
                .then(() => {
                    response.json({success: true});
                })
                .catch(() => {
                    response.json({success: false});
                });
        });

        app.get('/initial-data', (request, response) => {
            var selectedDate = _.sample(this.availableDates);
            this.getScenarioData(selectedDate)
                .then(scenario => {
                    response.json({
                        availableDates: this.availableDates,
                        initialScenario: scenario
                    })
                })
                .catch(error => response.json(error));
        });

    }

    private getScenarioData(datetime) {
        let date = moment(datetime).utc().startOf('day');
        let windowDuration = 15 * 60 * 1000;
        let simulationStartTime = date.clone().add(8.5, 'hours');
        let simulationStartTimeMSE = simulationStartTime.valueOf();
        let viewStartTime = simulationStartTime.clone().subtract(windowDuration, 'milliseconds');
        let endTime = simulationStartTime.clone().add(1, 'hour');

        return this.db.any(`select extract(epoch from time) * 1000 as time, bid, ask
from ticks
where time BETWEEN $(startTime)
              and  $(endTime);`, {startTime: viewStartTime.toISOString(), endTime: endTime.toISOString()})
            .then(rawTicks => {
                let allTicks = rawTicks.map(t => ({
                        time:t.time,
                        bid: parseFloat(t.bid),
                        ask: parseFloat(t.ask)
                    }));
                let initialData = allTicks
                    .filter(t => t.time < simulationStartTimeMSE);

                return {
                    name: `EUR/USD - ${date.format('ddd MMM D, YYYY')}`,
                    windowMilliseconds: windowDuration,
                    simulationStartTime: simulationStartTime.valueOf(),
                    initialDataSets: [
                        {
                            name: 'Bid',
                            data: initialData.map(t=> [t.time, t.bid])
                        },
                        {
                            name: 'Ask',
                            data: initialData.map(t=> [t.time, t.ask])
                        }
                    ],
                    simulationTicks: allTicks
                        .filter(t => t.time >= simulationStartTimeMSE)
                };
            });
    }

    private initializeDatabase() {
        if (process.env.DEBUG) {
            this.db = pgPromise()({
                host: 'localhost',
                database: 'fxpractice',
                user: 'postgres',
                password: 'postgres'
            });
        } else {
            this.db = pgPromise()({
                host: 'localhost',
                database: 'johntsen_fxpractice',
                user: 'johntsen_fxpractice_user',
                password: 'C$3Xmo4C^5CXO6W%2YQn',
            });
        }
    }

    private initializeAvailableDates() {
        console.log('loading available dates');
        this.db.any(`with t as (
select cast(time as date) date
from ticks
where cast(time as time) between '8:00' and '9:00'
)
select date
from t
group by date
order by date`)
            .then(results => {
                this.availableDates = results
                    .map(row => row.date);
                console.log('available dates initialized');
            }, (error) => {
                console.log(error);
                console.log('available dates failed');
            })

    }


}

declare var module: any;
module.exports = new App().express;