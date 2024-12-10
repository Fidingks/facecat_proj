# -*- coding: utf-8 -*-
import threading
import json
import asyncio
import websockets
import time

class BinanceWebSocketClient:
    def __init__(self, on_message_callback=None):
        # self.url = "wss://156.232.10.79/ws"
        self.url = "ws://156.232.10.79:8000/ws"
        self.connection = None
        self.subscribed_streams = set()
        self.id_counter = 1001
        self.loop = asyncio.new_event_loop()
        self.thread = None
        self.on_message_callback = on_message_callback  # Callback function for incoming messages

    def start(self):
        """Start the WebSocket connection in a new thread."""
        print("连接到bianance")
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.thread.start()
        # 等待连接建立
        time.sleep(1)

    def _run(self):
        """Run the WebSocket connection in the asyncio loop."""
        asyncio.set_event_loop(self.loop)
        self.loop.run_until_complete(self.connect())
        self.loop.run_forever()

    async def connect(self):
        """Connect to Binance WebSocket and start handling messages."""
        try:
            self.connection = await websockets.connect(self.url)
            print("Connected to Binance WebSocket")
            asyncio.create_task(self.handle_messages())
        except Exception as e:
            print(f"Connection error: {e}")

    async def handle_messages(self):
        while True:
            try:
                message = await self.connection.recv()
                data = json.loads(message)
                if self.on_message_callback:
                    self.on_message_callback(data)  # Send data to the GUI callback
            except websockets.ConnectionClosed:
                print("Connection closed, attempting to reconnect...")
                break
            except Exception as e:
                print(f"Error: {e}")
                break

    def subscribe(self, stream):
        """Subscribe to specified streams."""
    
        if stream not in self.subscribed_streams:
            self.subscribed_streams.add(stream)
            message = {
                "method": "SUBSCRIBE",
                "params": [stream],
                "id": self.id_counter
            }
            # 确保连接已建立
            if self.connection:
                asyncio.run_coroutine_threadsafe(self.connection.send(json.dumps(message)), self.loop)
                print(f"Subscribed to {stream}")
                self.id_counter += 1
            else:
                print("WebSocket connection not established")

    def unsubscribe(self, stream):
        """Unsubscribe from specified streams."""
        if stream in self.subscribed_streams:
            self.subscribed_streams.remove(stream)
            message = {
                "method": "UNSUBSCRIBE",
                "params": [stream],
                "id": self.id_counter
            }
            # 确保连接已建立
            if self.connection:
                asyncio.run_coroutine_threadsafe(self.connection.send(json.dumps(message)), self.loop)
                print(f"Unsubscribed from {stream}")
                self.id_counter += 1
            else:
                print("WebSocket connection not established")
                    
    def lsit_subscription(self):
        """Unsubscribe from specified streams."""
        message = {
        "method": "LIST_SUBSCRIPTIONS",
        "id": self.id_counter
        }
        # 确保连接已建立
        if self.connection:
            asyncio.run_coroutine_threadsafe(self.connection.send(json.dumps(message)), self.loop)
            print(f"list all subscriptions")
            self.id_counter += 1
        else:
            print("WebSocket connection not established")

    def stop(self):
        """Stop the WebSocket connection and close the loop."""
        if self.loop.is_running():
            self.loop.call_soon_threadsafe(self.loop.stop)
        if self.thread.is_alive():
            self.thread.join()
        print("WebSocket connection stopped")
