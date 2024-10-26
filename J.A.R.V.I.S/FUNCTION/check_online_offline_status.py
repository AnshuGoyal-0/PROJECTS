import requests # pip install requests
from Base.speak import *
from FUNCTION.speak2 import fspeak


def is_online(url="http://www.google.com", timeout=5):
    try:
        # Try to make a GET request to the specified URL
        response = requests.get(url, timeout=timeout)
        # Check if the response status code is in the success range (200-299)
        return response.status_code >= 200 and response.status_code < 300
    except requests.ConnectionError:
        return False

# Example usage
def internet_status():
    if is_online():
        x = "YES SIR ! I AM READY AND ONLINE"
        speak(x)
    else:
        x = "HEY THERE SIR ! I AM FRIDAY , SORRY BUT JARVIS IS CURRENTLY NOT ONLINE"
        print(x)


def internet_status2():
    if is_online():
        return "Hey Sir, where are you? We are online now. System status: ONLINE"
    else:
        return "Hey Sir, system status: NOT ONLINE"


def realtime_online_checker():
    prev_status = None

    while True:
        try:
            current_status = internet_status2()

            if current_status != prev_status:
                fspeak(current_status)
                prev_status = current_status
        except Exception as e:
            print(e)
            pass
