from flask import Flask

from src import api
WMATA = api.WMATA()

app = Flask(__name__)

@app.route('/api/lines')
def get_all_lines():
    return WMATA.fetch_line_definitions()

@app.route('/api/stations/all')
def get_all_stations():
    return WMATA.fetch_station_definitions()

@app.route('/api/circuits/all')
def get_all_circuits():
    return WMATA.fetch_circuits()

@app.route('/api/trains')
def get_trains():
    return WMATA.fetch_live_positions()