import datetime
import json
from EdgeGPT import ConversationStyle,Chatbot as bingChat
import asyncio
import configparser
import re
from langdetect import detect
import time as t
import logging

def plan(cmd: str):
    # prepare command
    promptTemplate=',make a excutable plan considering using text/code created by ChatGPT, output the breif steps in Mermaid format.reply in language '+LANG
    if cmd == config['cmd']['cmd']:
        prompt0 = 'Final Goal:' + cmd + promptTemplate
    else:
        prompt0 = 'Final Goal:' + config['cmd']['cmd'] + '\nSub-misson:' + cmd + '\nFor the Sub-misson'+ promptTemplate

    # generate plan in mermaid format
    logger.info('asking New Bing about 『%s』...' % prompt0)
    if 'sys' in config.keys() and 'proxy' in config['sys'].keys():
        bingBot = bingChat(cookies=cookies, proxy=config['sys']['proxy'])
    else:
        bingBot = bingChat(cookies=cookies)
    response = asyncio.run(bingBot.ask(prompt=prompt0, conversation_style=ConversationStyle.creative,
                            wss_link="wss://sydney.bing.com/sydney/ChatHub"))
    replyTxt:str=response["item"]["messages"][1]["adaptiveCards"][0]["body"][0]["text"]
    if not 'mermaid' in replyTxt:
        replyTxt=replyTxt.replace('\ngraph ','```mermaid\ngraph ')
        if not replyTxt.endswith('```'):
            replyTxt=replyTxt+'```'
    logger.info(replyTxt)
    pattern = r"```mermaid\n(.*?)```"
    mermaid_content: str = re.search(pattern, replyTxt, re.S).group(1).strip()
    # logger.info(mermaid_content)
    mermaidJson = {
        # 'reply': replyTxt,
        # 'conversation_id': None,
        'mermaid': mermaid_content,
        'steps': {
        }
    }
    matches = re.findall(r'[a-zA-Z]+\[.*?\]', mermaid_content)
    for row in [x for x in matches if cmd not in x]:
        mermaidJson['steps'][row] = {}
    t.sleep(10)
    return mermaidJson


def build_tree(depth: int, mermaidStep: str, current_depth: int = 0) -> dict:
    if depth == 0:
        return {}
    else:
        node = plan(mermaidStep)
        for x in node['steps'].keys():
            node['steps'][x] = build_tree(depth - 1, x, current_depth + 1)
            if current_depth == 0:
                with open('memory.json', 'w', encoding="utf-8") as f:
                    json.dump(node, f)
        return node


if __name__ == '__main__':
    config = configparser.ConfigParser()
    config.read('config.ini')
    LANG=detect(config['cmd']['cmd'])
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)8.8s] %(message)s",
        handlers=[logging.StreamHandler(),
                  logging.FileHandler(f'{datetime.datetime.now().isoformat().replace(":", "-")}.log',
                                      encoding='utf-8')],
    )
    logger=logging.getLogger(__name__)
    with open('./cookies.json', 'r') as f:
        cookies = json.load(f)
        build_tree(2, config['cmd']['cmd'])
