import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    """API для чата с обновлением в реальном времени"""
    
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
        
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            limit = int(params.get('limit', 50))
            since_id = params.get('since_id', 0)
            
            if since_id:
                cur.execute("""
                    SELECT cm.id, cm.message, cm.created_at, u.username, 
                           COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '[]') as titles
                    FROM chat_messages cm
                    JOIN users u ON cm.user_id = u.id
                    LEFT JOIN user_titles ut ON u.id = ut.user_id
                    LEFT JOIN titles t ON ut.title_id = t.id
                    WHERE cm.id > %s
                    GROUP BY cm.id, cm.message, cm.created_at, u.username
                    ORDER BY cm.created_at DESC
                    LIMIT %s
                """, (since_id, limit))
            else:
                cur.execute("""
                    SELECT cm.id, cm.message, cm.created_at, u.username,
                           COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '[]') as titles
                    FROM chat_messages cm
                    JOIN users u ON cm.user_id = u.id
                    LEFT JOIN user_titles ut ON u.id = ut.user_id
                    LEFT JOIN titles t ON ut.title_id = t.id
                    GROUP BY cm.id, cm.message, cm.created_at, u.username
                    ORDER BY cm.created_at DESC
                    LIMIT %s
                """, (limit,))
            
            messages = cur.fetchall()
            messages_list = []
            for m in messages:
                messages_list.append({
                    'id': m[0],
                    'message': m[1],
                    'created_at': m[2].isoformat(),
                    'username': m[3],
                    'titles': m[4]
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'messages': list(reversed(messages_list))}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id')
            message = body.get('message', '').strip()
            
            if not message or not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Message and user_id required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                "INSERT INTO chat_messages (user_id, message, created_at) VALUES (%s, %s, %s) RETURNING id",
                (user_id, message, datetime.now())
            )
            conn.commit()
            message_id = cur.fetchone()[0]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message_id': message_id}),
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
