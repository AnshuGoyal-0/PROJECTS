import threading
from MainBrain.brain import *
from Automation._intregation_automation import Automation
from DATA.DLG import *
from BRAIN.welcome_greatings import *
from BRAIN.wish_greatings import *
from Automation.battery_plug_check import *
from Automation.battery_alert import *
from FUNCTION.function_intregation import Function_cmd
from Base.listen import listen
import eel
from FUNCTION.check_online_offline_status import *

# eel.init(r'C:\Users\chatu\OneDrive\Desktop\J.A.R.V.I.S\web')

def comain():
    while True:
        text = input(">>>")
        text = text.replace(" jar","jarvis")
        Automation(text)
        Function_cmd(text)
        Greating(text)

        if text in bye_key_word:
            x = random.choice(res_bye)
            speak(x)
            break
        elif "jarvis" in text:
            response = brain(text)
            speak(response)
        else:
            pass


def main():
    while True:
        wake_cmd = input(">>>")
        if wake_cmd in wake_key_word:
            welcome()
            comain()
        else:
            pass



@eel.expose
def jarvis():
    t1 = threading.Thread(target=main)
    t2 = threading.Thread(target=battery_alert)
    t3 = threading.Thread(target=check_plugin_status)
    t4 = threading.Thread(target=realtime_online_checker)
    t1.start()
    t2.start()
    t3.start()
    t4.start()
    t1.join()
    t2.join()
    t3.join()
    t4.join()

# def run_eel():
#     eel.start('index.html', size=(700, 500))
#
# # Create a thread for Eel
# eel_thread = threading.Thread(target=run_eel)
#
# # Start the Eel thread
# eel_thread.start()
#
# # Delay to ensure Eel has started before running Jarvis
# time.sleep(2)
#
# # Run Jarvis in the main thread
# jarvis()
#
# # Wait for the Eel thread to finish
# eel_thread.join()

jarvis()