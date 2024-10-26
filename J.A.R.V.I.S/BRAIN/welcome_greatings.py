import random
from DATA.DLG import welcomedlg
from Base.speak import speak


def welcome():
    welcome = random.choice(welcomedlg)
    speak(welcome)
