import pymysql

conn = pymysql.connect(
    host='localhost',
    user='root',
    password='ENETR-YOUR-PASSWORD',
    database='room_management_system',
    cursorclass=pymysql.cursors.DictCursor 
)