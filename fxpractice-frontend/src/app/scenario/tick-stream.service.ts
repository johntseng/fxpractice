import {Injectable} from '@angular/core';
import {ScenarioData, TickBatch} from "./scenario.component";
import {Observable} from "rxjs";

@Injectable()
export class TickStreamService {

  constructor() {
  }

  public createTickStream(scenario: ScenarioData): Observable<TickBatch> {
    let startingWallClockTime = Date.now();
    let nextTickIndex = 0;
    return Observable.create(observer => {
      let intervalId = setInterval(() => {
        let time = Date.now();
        let batch: TickBatch = {
          wallTime: time,
          simulationTime: scenario.simulationStartTime
          + 5 * (time - startingWallClockTime),
          ticks: [],
        };
        if (nextTickIndex >= scenario.simulationTicks.length) {
          observer.complete();
        }
        while (nextTickIndex < scenario.simulationTicks.length) {
          let tick = scenario.simulationTicks[nextTickIndex];
          if (tick.time > batch.simulationTime) {
            break;
          }

          batch.ticks.push(tick);
          nextTickIndex += 1;
        }

        observer.next(batch);
      }, 1000 / 60);

      return () => {
        clearInterval(intervalId)
      };
    });
  }
}

