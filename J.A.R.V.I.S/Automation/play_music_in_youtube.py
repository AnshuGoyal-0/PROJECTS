import time
import pywhatkit as kt
import random
from DATA.DLG import playsong, playing_dlg
from Base.speak import speak


def play_music_on_youtube(text):
    playdlg = random.choice(playsong)
    speak(playdlg)
    kt.playonyt(text)
    time.sleep(3)
    playdlg =random.choice(playing_dlg)
    speak(playdlg+text)

