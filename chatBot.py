from revChatGPT.V1 import Chatbot
import configparser

config = configparser.ConfigParser()
config.read('config.ini')

if __name__=='__main__':
  chatbot = Chatbot(config={
    "access_token": config['ChatGPT']['access_token'],
    "proxy":"http://127.0.0.1:7890"

  })

  command='\nMake plans cosidering the help of ChatGPT.'
  prompt0='I have 2 hours per day for this object:earn money online'+command
  conversation_id=''
  for data in chatbot.ask(prompt=prompt0):
    conversation_id=data['conversation_id']
  prompt1='Please choose the easiest solution to implement, make a plan that can finish in %s days, and output it in Mermaid format.'%5
  response = ""
  for data in chatbot.ask( prompt= prompt1,conversation_id=conversation_id):
    response = data["message"]
  print(response)
