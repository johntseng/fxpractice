import {Component, Input, ViewChild} from '@angular/core';
import Options = Highcharts.Options;
import {Observable} from "rxjs";
import * as _ from "lodash";
import * as Highcharts from "highcharts";
import {environment} from "../../environments/environment";
import {TickStreamService} from "./tick-stream.service";
import {FxChartComponent} from "../fx-chart/fx-chart.component";

@Component({
  selector: 'app-scenario',
  templateUrl: './scenario.component.html',
  styleUrls: ['./scenario.component.css']
})
export class ScenarioComponent {
  private _scenario: ScenarioData;
  private currentWallTickTime: number;
  private currentSimulationTime: number;
  private currentTick: Tick;
  private currentPosition: Position;
  private realizedPips: number;

  private pipValue: number = .0001;
  private showDebugPanel: boolean = !environment.production;
  private title: string;
  private totalTrades: number;

  @ViewChild('chart')
  private chart: FxChartComponent;

  constructor(readonly tickStreamService: TickStreamService) {
  }

  @Input()
  set scenario(data: ScenarioData) {
    this._scenario = data;
    if (data) {
      data.finalSimulationTime = _.last(data.simulationTicks).time;
      this.start();
    }
  }

  get scenario(): ScenarioData {
    return this._scenario;
  }

  start(): void {
    this.title = this.scenario.name;

    this.currentSimulationTime = this.scenario.simulationStartTime;
    this.currentTick = null;
    this.currentPosition = null;
    this.realizedPips = 0;
    this.totalTrades = 0;

    this.tickStreamService
      .createTickStream(this.scenario)
      .subscribe(batch => {
        this.currentSimulationTime = batch.simulationTime;
        this.currentWallTickTime = batch.wallTime;

        this.chart.drawBatch(chart => {
          chart.setXAxisRange(
            batch.simulationTime - this.scenario.windowMilliseconds,
            batch.simulationTime);
          for (let tick of batch.ticks) {
            chart.addTick(tick);
            this.currentTick = _.last(batch.ticks);
          }
        });
      }, null, () => {
        console.log('done!');
      });
  }

  canSell(): boolean {
    return !this.currentPosition || this.currentPosition.direction === Direction.Long;
  }

  sell(): void {
    if (this.currentPosition) {
      this.closePosition();
    } else {
      this.currentPosition = {
        direction: Direction.Short,
        entryPrice: this.currentTick.bid
      };
    }
  }

  closePosition(): void {
    this.realizedPips += this.currentPlPips;
    this.currentPosition = null;
    this.totalTrades += 1;
  }

  canBuy(): boolean {
    return !this.currentPosition || this.currentPosition.direction === Direction.Short;
  }

  buy(): void {
    if (this.currentPosition) {
      this.closePosition();
    } else {
      this.currentPosition = {
        direction: Direction.Long,
        entryPrice: this.currentTick.ask
      };
    }
  }

  get currentPlPips(): number {
    if (!this.currentPosition) {
      return null;
    }

    switch (this.currentPosition.direction) {
      case Direction.Long:
        return (this.currentTick.bid - this.currentPosition.entryPrice) / this.pipValue;
      case Direction.Short:
        return (this.currentPosition.entryPrice - this.currentTick.ask) / this.pipValue;
    }
  }

  getClassForNumber(pips): string {
    return pips > 0 ? 'text-success' :
      pips < 0 ? 'text-danger' :
        '';
  }

  get averagePl(): number {
    return this.totalTrades === 0
      ? 0
      : this.realizedPips / this.totalTrades;
  }
}

export class ScenarioData {
  public name: string;
  public windowMilliseconds: number;
  public simulationStartTime: number;
  public initialDataSets: any[];
  public simulationTicks: Tick[];
  public finalSimulationTime: number;
}

export class Tick {
  public time: number;
  public bid: number;
  public ask: number;
}

export class TickBatch {
  public wallTime: number;
  public simulationTime: number;
  public ticks: Tick[];
}


class Position {
  public direction: Direction;
  public entryPrice: number;
}

export enum Direction {
  Long = 1,
  Short = -1
}
