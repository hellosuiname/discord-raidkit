import os
import sqlite3
import requests
import asyncio
import aiohttp

from constants import PENDING, SUCCESS, FAILED, API_BASE

script_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(script_dir, '../../DRDB.db')


async def perform_nuke(token: str, proxies = None):
    
    async def delete_channel(id_: int, headers: dict):
        
        async def make_delete_channel_request(session):
            while True:
                async with session.delete(f"{API_BASE}/channels/{id_}") as resp:
                    if resp.status in (200, 201, 204):
                        return
                    elif resp.status == 429:
                        retry_after = int(resp.headers.get('Retry-After', '1'))
                        await asyncio.sleep(retry_after)
                    else:
                        raise aiohttp.ClientError
        
        if proxies is None:
            async with aiohttp.ClientSession(headers=headers) as session:
                await make_delete_channel_request(session)
    
    async def delete_guild(id_: int, is_owner: bool, headers: dict):
        
        async def make_delete_guild_request(session):
            url = f'{API_BASE}/guilds/{id_}' if is_owner else f'{API_BASE}/users/@me/guilds/{id_}'
            while True:
                async with session.delete(url) as resp:
                    if resp.status in (200, 201, 204):
                        return
                    elif resp.status == 429:
                        retry_after = int(resp.headers.get('Retry-After', '1'))
                        await asyncio.sleep(retry_after)
                    else:
                        raise aiohttp.ClientError
        
        if proxies is None:
            async with aiohttp.ClientSession(headers=headers) as session:
                await make_delete_guild_request(session)
    
    async def delete_friend(id_: int, headers: dict):
            
            async def make_delete_friend_request(session):
                while True:
                    async with session.delete(f"{API_BASE}/users/@me/relationships/{id_}") as resp:
                        if resp.status in (200, 201, 204):
                            return
                        elif resp.status == 429:
                            retry_after = int(resp.headers.get('Retry-After', '1'))
                            await asyncio.sleep(retry_after)
                        else:
                            raise aiohttp.ClientError
            
            if proxies is None:
                async with aiohttp.ClientSession(headers=headers) as session:
                    await make_delete_friend_request(session)
    
    async def delete_connection(type_: str, id_: int, headers: dict):
        
        async def make_delete_connection_request(session):
            while True:
                async with session.delete(f"{API_BASE}/users/@me/connections/{type_}/{id_}") as resp:
                    if resp.status in (200, 201, 204):
                        return
                    elif resp.status == 429:
                        retry_after = int(resp.headers.get('Retry-After', '1'))
                        await asyncio.sleep(retry_after)
                    else:
                        raise aiohttp.ClientError
        
        if proxies is None:
            async with aiohttp.ClientSession(headers=headers) as session:
                await make_delete_connection_request(session)
    
    async def deauth_app(id_: int, headers: dict):
            
            async def make_deauth_app_request(session):
                while True:
                    async with session.delete(f"{API_BASE}/oauth2/tokens/{id_}") as resp:
                        if resp.status in (200, 201, 204):
                            return
                        elif resp.status == 429:
                            retry_after = int(resp.headers.get('Retry-After', '1'))
                            await asyncio.sleep(retry_after)
                        else:
                            raise aiohttp.ClientError
            
            if proxies is None:
                async with aiohttp.ClientSession(headers=headers) as session:
                    await make_deauth_app_request(session)
         
    headers = {
        'Authorization': token,
    }
    
    channels = requests.get(f"{API_BASE}/users/@me/channels", headers=headers).json()
    await asyncio.gather(*[delete_channel(channel['id'], headers) for channel in channels])
    
    guilds = requests.get(f"{API_BASE}/users/@me/guilds", headers=headers).json()
    await asyncio.gather(*[delete_guild(guild['id'], guild['owner'], headers) for guild in guilds])
    
    friends = requests.get(f"{API_BASE}/users/@me/relationships", headers=headers).json()
    await asyncio.gather(*[delete_friend(friend['id'], headers) for friend in friends])
    
    connections = requests.get(f"{API_BASE}/users/@me/connections", headers=headers).json()
    await asyncio.gather(*[delete_connection(connection['type'], connection['id'], headers) for connection in connections])

    app_tokens = requests.get(f"{API_BASE}/oauth2/tokens", headers=headers).json()
    await asyncio.gather(*[deauth_app(app_token['id'], headers) for app_token in app_tokens])
    
    requests.delete(f'{API_BASE}/hypesquad/online', headers=headers)
    
    settings = {
        "locale": "ja",
        "show_current_game": False,
        "default_guilds_restricted": True,
        "inline_attatchment_media": False,
        "inline_embed_media": False,
        "gif_auto_play": False,
        "render_embeds": False,
        "render_reactions": False,
        "animate_emoji": False,
        "enable_tts_command": False,
        "message_display_compact": True,
        "convert_emoticons": False,
        "explicit_content_filter": 0,
        "disable_games_tab": True,
        "theme": "light",
        "detect_platform_accounts": False,
        "stream_notifications_enabled": False,
        "animate_stickers": False,
        "view_nsfw_guilds": True,
    }
    
    requests.patch(f'{API_BASE}/users/@me/settings', headers=headers, json=settings)
    return True

async def nuke(id_: int, token: str):
    
    def fail(conn, cursor) -> bool:
        cursor.execute("UPDATE Accounts SET nuke_status = ? WHERE account_id = ?", (FAILED, id_))
        conn.commit()
        conn.close()
        return False
    
    #try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("UPDATE Accounts SET nuke_status = ? WHERE account_id = ?", (PENDING, id_))
    conn.commit()
    
    result = False
    
    result = await perform_nuke(token)
    
    if result:
        cursor.execute("UPDATE Accounts SET nuke_status = ? WHERE account_id = ?", (SUCCESS, id_))
        conn.commit()
        conn.close()
        return result
    else:
        return fail(conn, cursor)
        
    #except Exception:
    #    return fail(conn, cursor)
