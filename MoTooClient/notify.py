import requests

def send_wechat_notice(content): # 发送通知到微信
    url = "http://120.48.136.60:8080/api/sendtxtmsg"
    payload = {
        "wxid": "wxid_6uj28bul7xqc22",
        "content": content,
        "atlist": []
        }
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        print("通知成功")
    else:
        print("通知失败")

def notify(level, content):
    if level == 1:
        send_wechat_notice("一级警报消息\n" + content)