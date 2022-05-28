import os
import requests
import json

from dotenv import load_dotenv
load_dotenv()


class WMATA:

    def __init__(self):
        self.base_url = "https://api.wmata.com"
        self.headers = {
            "api_key": os.environ.get("WMATA_KEY")
        }
        self.line_colors = {
            "RD": "#be1337",
            "BL": "#0795d3",
            "OR": "#da8707",
            "YL": "#f5d415",
            "GR": "#00b050",
            "SV": "#a2a4a1",
            "NS": "#eeeeee",
        }
        self.cache = {
            "stations": {
                "data": {},
                "expires_at": "",
            }
        }

    def _fetch(self, endpoint, params=None):
        target = f"{self.base_url}{endpoint}"

        response = requests.get(target, headers=self.headers, params=params)
        try:
            return json.loads(response.text)
        except:  # as no data is set, an exception will be raised later in the method
            raise Exception("error bruh")

    def fetch_line_definitions(self):
        data = self._fetch("/Rail.svc/json/jLines")

        payload = {"Lines": {}}
        
        for line in data["Lines"]:
            line["ColorHex"] = self.line_colors.get(line["LineCode"])
            payload["Lines"][line["LineCode"]] = line

        return payload

    def fetch_station_definitions(self, line_code: str = None):

        data = self._fetch("/Rail.svc/json/jStations", params={"LineCode": line_code})

        return data

    def fetch_live_positions(self):
        data = self._fetch("/TrainPositions/TrainPositions?contentType=json")

        for train in data["TrainPositions"]:
            train["LineColor"] = self.line_colors.get(train["LineCode"])

        return data
 
    def fetch_circuits(self):
        data = self._fetch("/TrainPositions/StandardRoutes?contentType=json")
        
        for route in data["StandardRoutes"]:
            route["LineColor"] = self.line_colors.get(route["LineCode"])

        return data

    def _check_cache(self, key):
        pass