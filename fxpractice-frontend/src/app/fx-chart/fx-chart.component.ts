import {Component, OnInit, Input} from '@angular/core';
import {ScenarioData, TickBatch, Tick} from "../scenario/scenario.component";
import * as Highcharts from "highcharts";
import {Action} from "rxjs/scheduler/Action";

@Component({
  selector: 'app-fx-chart',
  templateUrl: './fx-chart.component.html',
  styleUrls: ['./fx-chart.component.css']
})
export class FxChartComponent implements OnInit {
  private id: string = this.makeid();
  private chart: Highcharts.ChartObject;
  private redraw: boolean;
  private bidSeries: Highcharts.SeriesObject;
  private askSeries: Highcharts.SeriesObject;
  private xAxis: Highcharts.AxisObject;

  constructor() { }

  @Input() scenario: ScenarioData;


  ngOnInit(): void {
    setTimeout(() => {

      let chart = this.chart = Highcharts.chart(this.id, {
        title: {
          text: null
        },
        xAxis: {
          type: 'datetime',
          min: this.scenario.simulationStartTime - this.scenario.windowMilliseconds,
          max: this.scenario.simulationStartTime
        },
        yAxis: {
          title: {
            text: null
          },
          opposite: true
        },
        legend: {
          enabled: false
        },
        series: this.scenario.initialDataSets,
        plotOptions: {
          series: {
            marker: {
              enabled: false
            },
            animation: false
          }
        },
        chart: {
          animation: false
        }
      });

      this.bidSeries = chart.series[0];
      this.askSeries = chart.series[1];
      this.xAxis = chart.xAxis[0];
    }, 0);
  }

  drawBatch(action: (chart: FxChartComponent) => void) {
    this.redraw = false;
    action(this);
    this.chart.redraw(false);
    this.redraw = true;
  }

  setXAxisRange(min: number, max: number) {
    this.xAxis.setExtremes(min, max, this.redraw);
  }

  addTick(tick: Tick) {
    this.bidSeries.addPoint([tick.time, tick.bid], false);
    this.askSeries.addPoint([tick.time, tick.ask], false);
    if (this.redraw) {
      this.chart.redraw(false);
    }
  }

  setPositionPnL(price: number, pnL: number) {

  }

  markBuy(time: number, price: number) {

  }

  markSell(time: number, price: number) {

  }

  private static makeid() : string {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 10; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

}
