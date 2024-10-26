import time

import pyautogui as ui
from DATA.DLG import open_dld
import random

from Base.speak import speak


def open(text):
    x = random.choice(open_dld)
    speak(x+""+text)
    time.sleep(0.5)
    ui.hotkey("win")
    time.sleep(0.2)
    ui.write(text)
    time.sleep(0.5)
    ui.press("enter")

