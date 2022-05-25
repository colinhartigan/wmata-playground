from flask import Flask

from src import api
WMATA = api.WMATA()

app = Flask(__name__)

@app.route('/api/stations')
def get_all_stations():
    return WMATA.fetch_station_definitions()