from FUNCTION.check_temperature import *
from FUNCTION.CHECK_SPEED import *
from FUNCTION.check_online_offline_status import *
from FUNCTION.clap_with_music import *
from FUNCTION.CLOCK import *
from FUNCTION.find_my_ip import *
from FUNCTION.seo_generator import *


def Function_cmd(text):
    if "check internet speed" in text or "check speed test" in text or "speed test" in text:
        check_internet_speed()
    elif "are you there" in text or "hello there" in text :
        internet_status()
    elif "check temperature" in text or "temperature" in text:
        Temp()
    elif "find my ip" in text or "ip address" in text:
        speak("your ip is " + find_my_ip())
    elif "what is the time" in text or "time" in text or "what time is" in text:
        what_is_the_time()
    elif "start clap with music system" in text or "start smart music system" in text:
        speak("ok now starting")
        clap_to_music()
    elif "activate seo generator" in text or "activate youtube title generator" in text or "activate seo generator" in text:
        seo_app()
    else:
        pass

