import os
import asyncio
import websockets
import json
# import sqlite3

import constants
from actions.login import login
from actions.nuke import nuke

script_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(script_dir, '../DRDB.db')


class DRWebSocket:
    def __init__(self, host="localhost", port=8765):
        self.host = host
        self.port = port
        self.handlers = {
            constants.PING: self.handle_ping,
            constants.LOGIN: self.handle_login,
            constants.NUKE: self.handle_nuke
        }
        self.clients = set()

    """
    async def poll_database(self):
        last_id = 0
        while True:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT id, bot_id, change_type FROM bots_changes_log WHERE id > ? ORDER BY id ASC", (last_id,))
            rows = cursor.fetchall()
            for row in rows:
                message_id, bot_id, change_type = row
                if change_type == "ADDED" or change_type == "UPDATED":
                    cursor.execute("SELECT bot_token, is_on FROM bots WHERE bot_id = ?", (bot_id,))
                    row = cursor.fetchone()
                    notification = '{"obj": "BOT", "change_type": "%s", "bot_id": %d, "bot_token": "%s", "is_on": %d}' % (change_type, bot_id, row[0], row[1])
                elif change_type == "DELETED":
                    notification = '{"obj": "BOT", "change_type": "%s", "bot_id": %d}' % (change_type, bot_id)
                await self.notify_clients(notification)
                last_id = message_id
            conn.close()
            await asyncio.sleep(3)
    """
    
    async def notify_clients(self, message):
        for client in self.clients:
            await client.send(message)
    
    async def handle_ping(self, websocket, data):
        await websocket.send(json.dumps({"action": "pong"}))
        
    async def handle_login(self, websocket, data):
        await websocket.send(json.dumps({"action": constants.LOGIN, "status": constants.PENDING, "id": data["id"]}))
        result = await login(data["id"], data["browser"], data["token"])
        if result:
            await websocket.send(json.dumps({"action": constants.LOGIN, "status": constants.SUCCESS, "id": data["id"]}))
        else:
            await websocket.send(json.dumps({"action": constants.LOGIN, "status": constants.FAILED, "id": data["id"]}))
    
    async def handle_nuke(self, websocket, data):
        await websocket.send(json.dumps({"action": constants.NUKE, "status": constants.PENDING, "id": data["id"]}))
        result = await nuke(data["id"], data["token"])
        if result:
            await websocket.send(json.dumps({"action": constants.NUKE, "status": constants.SUCCESS, "id": data["id"]}))
        else:
            await websocket.send(json.dumps({"action": constants.NUKE, "status": constants.FAILED, "id": data["id"]}))

    async def echo(self, websocket, _):
        self.clients.add(websocket)
        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                except json.JSONDecodeError:
                    await websocket.send("Invalid JSON received.")
                    continue

                if "action" in data:
                    if data["action"] == constants.LOGIN:
                        await self.handle_login(websocket, data)
                    elif data["action"] == constants.NUKE:
                        await self.handle_nuke(websocket, data)
                    else:
                        await websocket.send(f"Unknown action: {data['action']}")
                else:
                    await websocket.send("No action specified.")
        except websockets.ConnectionClosed:
            pass
        finally:
            self.clients.remove(websocket)

    def start(self):
        start_server = websockets.serve(self.echo, self.host, self.port)
        asyncio.get_event_loop().run_until_complete(start_server)
        asyncio.get_event_loop().run_forever()


def main():
    # conn = sqlite3.connect(db_path)
    # cursor = conn.cursor()
    # cursor.execute("DELETE FROM bots_changes_log;")
    # conn.commit()
    # conn.close()
    # del cursor
    # del conn
    
    server = DRWebSocket()

    asyncio.get_event_loop().run_until_complete(websockets.serve(server.echo, server.host, server.port))
    # asyncio.get_event_loop().run_until_complete(asyncio.gather(
    #     websockets.serve(server.echo, server.host, server.port),
    #     server.poll_database()
    # ))
    asyncio.get_event_loop().run_forever()


main()
