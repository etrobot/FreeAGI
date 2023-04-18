import datetime
import json
from EdgeGPT import ConversationStyle,Chatbot as bingChat
import asyncio
import configparser
import re
from langdetect import detect
import time as t
import logging

def plan(cmd: str,steps:list=None):
    # prepare command
    promptTemplate=',output the breif steps or key points in Mermaid format. Reply in language '+LANG
    if cmd == config['cmd']['cmd']:
        prompt0 = 'I started a project, final goal:%s.'%cmd + promptTemplate
    else:
        missons=''.join(str(steps.index(x)+1)+'.'+x.replace(']',';').split('[')[-1] for x in steps)
        prompt0 = 'Final Goal:%s'%config['cmd']['cmd']+'\nKey points:%s'%missons + '\nSub-misson:' + cmd[1:] + '\nFor the Sub-misson '+ promptTemplate

    # generate plan in mermaid format
    logger.info('asking New Bing about 『%s』...' % prompt0)
    if 'sys' in config.keys() and 'proxy' in config['sys'].keys():
        bingBot = bingChat(cookies=cookies, proxy=config['sys']['proxy'])
    else:
        bingBot = bingChat(cookies=cookies)
    response = asyncio.run(bingBot.ask(prompt=prompt0, conversation_style=ConversationStyle.creative,
                            wss_link="wss://sydney.bing.com/sydney/ChatHub"))
    replyTxt:str=response["item"]["messages"][1]["adaptiveCards"][0]["body"][0]["text"].replace('graph LR','graph TD')
    if not 'mermaid' in replyTxt:
        replyTxt=replyTxt.replace('\ngraph ','```mermaid\ngraph ')
    logger.info(replyTxt)
    mermaid = re.search(r"```mermaid\n(.*?)```", replyTxt, re.S)
    if mermaid:
        mermaid_content=mermaid.group(1).strip()
    else:
        mermaid = re.search(r"```mermaid\n(.*?)\]\n\n", replyTxt, re.S)
        mermaid_content = mermaid.group(1).strip()
    mermaidJson = {
        # 'reply': replyTxt,
        # 'conversation_id': None,
        'mermaid': mermaid_content,
        'steps': {
        }
    }
    matches = re.findall(r'[a-zA-Z]+\[.*?\]', mermaid_content)
    for row in [x for x in matches if cmd not in x]:
        if(len(row))>8:
            mermaidJson['steps'][row] = {}
    t.sleep(14)
    return mermaidJson


def build_tree(depth: int,mermaidStep: str, current_depth: int = 0,steps:list=None) -> dict:
    if depth == 0:
        return {}
    else:
        node = plan(mermaidStep,steps)
        for x in node['steps'].keys():
            node['steps'][x] = build_tree(depth - 1, x, current_depth + 1,list(node['steps'].keys()))
            if current_depth == 0:
                with open('memory.json', 'w', encoding="utf-8") as f:
                    json.dump(node, f)
        return node


if __name__ == '__main__':
    config = configparser.ConfigParser()
    config.read('config.ini')
    if 'lang' in config['cmd'].keys():
        LANG = config['cmd']['lang']
    else:
        LANG = detect(config['cmd']['cmd'])
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
        build_tree(3, config['cmd']['cmd'])
