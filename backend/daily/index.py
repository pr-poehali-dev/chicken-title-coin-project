import json
import os
import psycopg2
from datetime import datetime, timedelta

def handler(event: dict, context) -> dict:
    """API для системы ежедневных наград"""
    
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
            user_id = params.get('user_id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                SELECT day_number, claimed_at, reward_type, reward_value
                FROM daily_rewards
                WHERE user_id = %s
                ORDER BY day_number DESC
                LIMIT 1
            """, (user_id,))
            
            last_reward = cur.fetchone()
            
            if last_reward:
                last_day = last_reward[0]
                last_claimed = last_reward[1]
                now = datetime.now()
                
                time_diff = now - last_claimed
                if time_diff < timedelta(hours=20):
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'can_claim': False,
                            'current_day': last_day,
                            'next_claim_in_seconds': int((timedelta(hours=24) - time_diff).total_seconds())
                        }),
                        'isBase64Encoded': False
                    }
                elif time_diff < timedelta(hours=48):
                    next_day = last_day + 1 if last_day < 7 else 1
                else:
                    next_day = 1
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'can_claim': True,
                        'current_day': last_day,
                        'next_day': next_day
                    }),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'can_claim': True,
                        'current_day': 0,
                        'next_day': 1
                    }),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                SELECT day_number, claimed_at
                FROM daily_rewards
                WHERE user_id = %s
                ORDER BY day_number DESC
                LIMIT 1
            """, (user_id,))
            
            last_reward = cur.fetchone()
            now = datetime.now()
            
            if last_reward:
                last_day = last_reward[0]
                last_claimed = last_reward[1]
                time_diff = now - last_claimed
                
                if time_diff < timedelta(hours=20):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Too early to claim'}),
                        'isBase64Encoded': False
                    }
                
                if time_diff < timedelta(hours=48):
                    next_day = last_day + 1 if last_day < 7 else 1
                else:
                    next_day = 1
            else:
                next_day = 1
            
            rewards_map = {
                1: {'type': 'coins', 'value': 100},
                2: {'type': 'coins', 'value': 150},
                3: {'type': 'title', 'value': '[Третий]'},
                4: {'type': 'coins', 'value': 200},
                5: {'type': 'coins', 'value': 500},
                6: {'type': 'coins', 'value': 1000},
                7: {'type': 'title', 'value': '[Ежедневный]'}
            }
            
            reward = rewards_map[next_day]
            
            if reward['type'] == 'coins':
                cur.execute(
                    "UPDATE users SET coins = coins + %s WHERE id = %s",
                    (reward['value'], user_id)
                )
            elif reward['type'] == 'title':
                cur.execute("SELECT id FROM titles WHERE name = %s", (reward['value'],))
                title_id = cur.fetchone()
                if title_id:
                    cur.execute(
                        "INSERT INTO user_titles (user_id, title_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                        (user_id, title_id[0])
                    )
            
            cur.execute(
                "INSERT INTO daily_rewards (user_id, day_number, claimed_at, reward_type, reward_value) VALUES (%s, %s, %s, %s, %s)",
                (user_id, next_day, now, reward['type'], str(reward['value']))
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'day': next_day,
                    'reward': reward
                }),
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
