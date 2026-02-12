import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    """API для работы с титулами, квестами и прогрессом игрока"""
    
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
        
        params = event.get('queryStringParameters', {}) or {}
        action = params.get('action')
        user_id = params.get('user_id')
        
        if method == 'GET':
            if action == 'titles':
                cur.execute("SELECT id, name, price, description, color, is_exclusive FROM titles ORDER BY price")
                titles = cur.fetchall()
                
                titles_list = []
                for t in titles:
                    titles_list.append({
                        'id': t[0],
                        'name': t[1],
                        'price': t[2],
                        'description': t[3],
                        'color': t[4],
                        'is_exclusive': t[5]
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'titles': titles_list}),
                    'isBase64Encoded': False
                }
            
            elif action == 'quests':
                cur.execute("SELECT id, title, description, reward, quest_type, target_value, category FROM quests ORDER BY category, reward")
                quests = cur.fetchall()
                
                quests_list = []
                for q in quests:
                    quests_list.append({
                        'id': q[0],
                        'title': q[1],
                        'description': q[2],
                        'reward': q[3],
                        'quest_type': q[4],
                        'target_value': q[5],
                        'category': q[6]
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'quests': quests_list}),
                    'isBase64Encoded': False
                }
            
            elif action == 'user_data' and user_id:
                cur.execute("""
                    SELECT u.id, u.username, u.coins, u.is_admin, u.time_spent_seconds,
                           COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '[]') as titles,
                           COALESCE(json_agg(DISTINCT jsonb_build_object('quest_id', q.id, 'progress', uq.progress, 'completed', uq.completed)) FILTER (WHERE q.id IS NOT NULL), '[]') as quests
                    FROM users u
                    LEFT JOIN user_titles ut ON u.id = ut.user_id
                    LEFT JOIN titles t ON ut.title_id = t.id
                    LEFT JOIN user_quests uq ON u.id = uq.user_id
                    LEFT JOIN quests q ON uq.quest_id = q.id
                    WHERE u.id = %s
                    GROUP BY u.id
                """, (user_id,))
                
                user_data = cur.fetchone()
                if user_data:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'user': {
                                'id': user_data[0],
                                'username': user_data[1],
                                'coins': user_data[2],
                                'is_admin': user_data[3],
                                'time_spent_seconds': user_data[4],
                                'titles': user_data[5],
                                'quests': user_data[6]
                            }
                        }),
                        'isBase64Encoded': False
                    }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            user_id = body.get('user_id')
            
            if action == 'buy_title':
                title_id = body.get('title_id')
                
                cur.execute("SELECT coins FROM users WHERE id = %s", (user_id,))
                user_coins = cur.fetchone()[0]
                
                cur.execute("SELECT price FROM titles WHERE id = %s", (title_id,))
                title_price = cur.fetchone()[0]
                
                if user_coins >= title_price:
                    cur.execute(
                        "INSERT INTO user_titles (user_id, title_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                        (user_id, title_id)
                    )
                    cur.execute(
                        "UPDATE users SET coins = coins - %s WHERE id = %s",
                        (title_price, user_id)
                    )
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True}),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Not enough coins'}),
                        'isBase64Encoded': False
                    }
            
            elif action == 'update_time':
                time_spent = body.get('time_spent_seconds', 0)
                cur.execute(
                    "UPDATE users SET time_spent_seconds = %s WHERE id = %s",
                    (time_spent, user_id)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid request'}),
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
