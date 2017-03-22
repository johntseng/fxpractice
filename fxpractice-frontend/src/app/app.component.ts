import {Component, OnInit} from '@angular/core';
import {Http, Response} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {environment} from "../environments/environment";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  private availableDates: number[];
  private scenario: any;

  constructor(private http: Http) {
  }

  ngOnInit(): void {
    this.title = "fdsa";
    this.http.get(environment.apiBaseUrl + '/initial-data')
      .toPromise()
      .then(response => {
        var data = response.json();
        this.availableDates = data.availableDates;
        this.scenario = data.initialScenario;
      })
  }

  title = 'app works!';
}


