import os, requests, json

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
        }

    def _fetch(self, endpoint, params=None):
        target = f"{self.base_url}{endpoint}"

        response = requests.get(target, headers=self.headers, params=params)
        try:
            return json.loads(response.text)
        except:  # as no data is set, an exception will be raised later in the method
            raise Exception("error bruh")
        

    def fetch_station_definitions(self, line_code: str=None, latlong_range: int=1000):
        data = self._fetch("/Rail.svc/json/jStations", params={"LineCode": line_code})

        max_lat = max([station["Lat"] for station in data["Stations"]])
        max_lon = max([station["Lon"] for station in data["Stations"]])
        min_lat = min([station["Lat"] for station in data["Stations"]])
        min_lon = min([station["Lon"] for station in data["Stations"]])

        for station in data["Stations"]:
            station["Lat"] = round((station["Lat"] - min_lat) / (max_lat - min_lat) * latlong_range)
            station["Lon"] = round((station["Lon"] - min_lon) / (max_lon - min_lon) * latlong_range)
            station["ColorHex"] = self.line_colors.get(station["LineCode1"])
        
        return data