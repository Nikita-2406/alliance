import mysql.connector
from mysql.connector import Error

class Database:
    def __init__(self):
        self.host = "localhost"
        self.user = "root"
        self.password = "UxJELzckwwhU123"
        self.database = "app_store"
        self.connection = None

    def connect(self):
        try:
            self.connection = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database
            )
            return self.connection
        except Error as e:
            print(f"Error connecting to MySQL: {e}")
            return None

    def disconnect(self):
        if self.connection and self.connection.is_connected():
            self.connection.close()

    def get_connection(self):
        if not self.connection or not self.connection.is_connected():
            self.connect()
        return self.connection