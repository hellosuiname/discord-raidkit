import logging
import os
import sqlite3

from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from selenium.webdriver.common.proxy import Proxy
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium import webdriver

from selenium.webdriver.remote.remote_connection import LOGGER
LOGGER.setLevel(logging.WARNING)

from constants import PENDING, SUCCESS, FAILED

BROWSERS = {
    'chrome': 1,
    'firefox': 2,
    'edge': 3
}

script_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(script_dir, '../../DRDB.db')


async def launch_browser(browser: str, selenium_proxy: Proxy = None):
    try:
        if BROWSERS[browser] == 1:
            from selenium.webdriver.chrome.options import Options
            from selenium.webdriver.chrome.service import Service
            options = Options()
            webdriver_instance = webdriver.Chrome
            driver_manager = ChromeDriverManager
            service = Service(executable_path=driver_manager().install())
        elif BROWSERS[browser] == 2:
            from selenium.webdriver.firefox.options import Options
            from selenium.webdriver.firefox.service import Service
            options = Options()
            webdriver_instance = webdriver.Firefox
            driver_manager = GeckoDriverManager
            service = Service(executable_path=driver_manager().install())
        elif BROWSERS[browser] == 3:
            from selenium.webdriver.edge.options import Options
            from selenium.webdriver.edge.service import Service
            options = Options()
            webdriver_instance = webdriver.Edge
            driver_manager = EdgeChromiumDriverManager
            service = Service(executable_path=driver_manager().install())
        else:
            return None
    
        if BROWSERS[browser] in (1, 3):
            options.add_experimental_option('detach', True)
        else:
            options.set_preference('detach', True)
        
        if selenium_proxy is not None:
            options.proxy = selenium_proxy
        
        driver = webdriver_instance(service=service, options=options)
        return driver
    except AttributeError:
        return None


async def perform_login(driver, auth_token):
    try:
        driver.implicitly_wait(30)
        driver.get('https://discord.com/login')

        WebDriverWait(driver, 30).until(
            EC.visibility_of_element_located(
                (
                    By.XPATH,
                    "//h1[contains(text(),'Welcome back!')]"
                )
            )
        )

        script = '''
            function login(token) {
                setInterval(() => {
                    document.body.appendChild(document.createElement `iframe`).contentWindow.localStorage.token = `"${token}"`
                }, 50);
                setTimeout(() => {
                    location.reload();
                }, 2500);
            }'''

        driver.execute_script(script + f'\nlogin("{auth_token}")')
        return True
    except Exception:
        return False


async def login(id_: int, browser: str, token: str) -> bool | None:
    
    def fail(conn, cursor) -> bool:
        cursor.execute("UPDATE Accounts SET login_status = ? WHERE account_id = ?", (FAILED, id_))
        conn.commit()
        conn.close()
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("UPDATE Accounts SET login_status = ? WHERE account_id = ?", (PENDING, id_))
        conn.commit()
        
        driver = await launch_browser(browser)
        if not driver:
            return fail(conn, cursor)
        
        
        result = False
        result = await perform_login(driver, token)
        
        if result:
            cursor.execute("UPDATE Accounts SET login_status = ? WHERE account_id = ?", (SUCCESS, id_))
            conn.commit()
            conn.close()
            return result
        else:
            return fail(conn, cursor)
        
    except Exception:
        return fail(conn, cursor)
