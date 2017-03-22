import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {ChartModule} from 'angular2-highcharts';

import {AppComponent} from './app.component';
import {ScenarioComponent} from './scenario/scenario.component';
import {TickStreamService} from "./scenario/tick-stream.service";
import { FxChartComponent } from './fx-chart/fx-chart.component';


@NgModule({
  declarations: [
    AppComponent,
    ScenarioComponent,
    FxChartComponent,
  ],
  imports: [
    BrowserModule,
    ChartModule,
    FormsModule,
    HttpModule
  ],
  providers: [TickStreamService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
