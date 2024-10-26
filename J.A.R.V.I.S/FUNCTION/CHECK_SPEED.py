from selenium.webdriver.chrome.service import Service as ChromeService
from Base.speak import *
import undetected_chromedriver as uc

chrome_options = uc.ChromeOptions()
chrome_options.add_argument("--headless")  # Run in headless mode (without opening a browser window)

# Create a Chrome driver instance with the specified options
driver = webdriver.Chrome(options=chrome_options)
driver.get('https://fast.com/')

def get_internet_speed():

        # Open the website

        speak("Checking your Internet speed")
        time.sleep(11)

        # Wait for the speed test to complete (adjust the timeout as needed)
        WebDriverWait(driver, 60).until(EC.presence_of_element_located((By.ID, 'speed-value')))

        # Find the element with the speed value
        speed_element = driver.find_element(By.ID, 'speed-value')

        # Get the text value from the element
        speed_value = speed_element.text

        return speed_value

def check_internet_speed():
    speed_result = get_internet_speed()

    if speed_result is not None:
        speak(f"Sir, your internet speed is: {speed_result} Mbps")
    else:
        speak("Error: Unable to retrieve internet speed.")
