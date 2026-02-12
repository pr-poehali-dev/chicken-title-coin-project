import json
import os
import hashlib
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    """API для регистрации и авторизации пользователей"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            username = body.get('username', '').strip()
            password = body.get('password', '')
            
            if not username or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Username and password required'}),
                    'isBase64Encoded': False
                }
            
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            if action == 'register':
                try:
                    cur.execute(
                        "INSERT INTO users (username, password_hash, coins, created_at, last_login) VALUES (%s, %s, 100, %s, %s) RETURNING id, username, coins, is_admin",
                        (username, password_hash, datetime.now(), datetime.now())
                    )
                    conn.commit()
                    user_data = cur.fetchone()
                    
                    cur.execute("SELECT id FROM titles WHERE name = '[NEWBIE]'")
                    newbie_title = cur.fetchone()
                    if newbie_title:
                        cur.execute(
                            "INSERT INTO user_titles (user_id, title_id) VALUES (%s, %s)",
                            (user_data[0], newbie_title[0])
                        )
                        conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'success': True,
                            'user': {
                                'id': user_data[0],
                                'username': user_data[1],
                                'coins': user_data[2],
                                'is_admin': user_data[3]
                            }
                        }),
                        'isBase64Encoded': False
                    }
                except psycopg2.IntegrityError:
                    conn.rollback()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Username already exists'}),
                        'isBase64Encoded': False
                    }
            
            elif action == 'login':
                cur.execute(
                    "SELECT id, username, coins, is_admin, time_spent_seconds FROM users WHERE username = %s AND password_hash = %s",
                    (username, password_hash)
                )
                user_data = cur.fetchone()
                
                if user_data:
                    cur.execute(
                        "UPDATE users SET last_login = %s WHERE id = %s",
                        (datetime.now(), user_data[0])
                    )
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'success': True,
                            'user': {
                                'id': user_data[0],
                                'username': user_data[1],
                                'coins': user_data[2],
                                'is_admin': user_data[3],
                                'time_spent_seconds': user_data[4]
                            }
                        }),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid credentials'}),
                        'isBase64Encoded': False
                    }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()
