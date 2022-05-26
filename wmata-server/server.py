from flask import Flask

from src import api
WMATA = api.WMATA()

app = Flask(__name__)

@app.route('/api/stations/all/<int:range>')
def get_all_stations(range):
    return WMATA.fetch_station_definitions(latlong_range=range)

@app.route('/api/circuits/all')
def get_all_circuits():
    return WMATA.fetch_circuits()