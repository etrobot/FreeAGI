// 0:wait2start  1:wait4gen 2:time2moveon
var statuCode=0
var tasks
var task

const rootEl = document.querySelector('div[id="__next"]')

window.onload = function () {
    updateUI()
    try {
        new MutationObserver(() => {
            updateUI()
        }).observe(rootEl, { childList: true })
    } catch (e) {
        if (e instanceof Error) {
            console.info("autoGPT Error: ", error)
        }
    }
}

function getBar(){
    const textArea = document.querySelector("textArea");
    const textAreaParentParent = textArea.parentElement?.parentElement;
    let bar = document.createElement('div');
    bar.innerHTML='Auto Ask:  <button id="pasteTasks" class="autoBtn"> Paste Tasks </button> , and click ☞ <button id="autorun" class="autoBtn"> AUTORUN </button><div class="loader"></div>'
    bar.classList.add('autobar')
    var runBtn= bar.querySelector("#autorun");
    runBtn.addEventListener("click", buildPrompt);
    var addBtn = bar.querySelector("#pasteTasks");
    addBtn.addEventListener("click", showPrompt);
    textAreaParentParent?.appendChild(bar)
    return bar
}

async function updateUI() {
    if(!getBar()){
        bar=getBar();
        const codeArea = document.querySelector("code");
        console.log(codeArea);
        checkStatus();
    }
}


// setInterval(checkStatus,2000);

function checkStatus() {
    var genBtn= document.querySelector("#__next > div.overflow-hidden.w-full.h-full.relative.flex > div.flex.h-full.max-w-full.flex-1.flex-col > main > div.absolute.bottom-0.left-0.w-full.border-t.md\\:border-t-0.dark\\:border-white\\/20.md\\:border-transparent.md\\:dark\\:border-transparent.md\\:bg-vert-light-gradient.bg-white.dark\\:bg-gray-800.md\\:\\!bg-transparent.dark\\:md\\:bg-vert-dark-gradient.pt-2 > form > div > div:nth-child(1) > div > button > div")
    replyCode= document.querySelector('code');
    if(genBtn && genBtn.textContent=='Stop generating'){
        statuCode=1
    }else if(genBtn && genBtn.textContent=='Regenerate response'){
        if(tasks){
            for(var i=1;i<tasks.length-2;){
                if(task==tasks[i]){task=tasks[i+1];break;}
            }
        }else if(replyCode){
            tasks=convertMermaid(replyCode.textContent);
            task=tasks[0]
            statuCode=2
        }
    }else{statuCode=0}
    console.log({'tasks':tasks,'task':task,'statuCode':statuCode})
    if(statuCode==2)buildPrompt();
}

function showPrompt() {
    console.log('showPrompt')
    var input = prompt("Enter text:", ""); // 创建带有textarea的prompt弹层

    if (input != null) {
      var textArea = document.createElement("textarea"); // 创建一个textarea元素
      textArea.value = input; // 将用户输入的文本设置为textarea的值
      document.body.appendChild(textArea);
      // 将用户输入的文本保存到变量中
      var userInput = textArea.value;
      console.log(userInput);
    }
  }


function convertMermaid(replyCode){
    var mermaid_content=replyCode.replace(/\(/g, '[').replace(/\)/g, ']');
    console.log(mermaid_content);
    const regex = /\[(.*?)\]/g;
    const matches = mermaid_content.match(regex);
    const result = matches.map(match => match.slice(1, -1)).filter(match => match.length >= 12).filter(match =>match.slice(1, -1) != task);;
    return result
}

function buildPrompt() {
    const textArea = document.querySelector("textArea");
    const promptTemplate=' Help me figure out key points for the goal and output  key points in Mermaid format,dont write any program code.';
    if(!task){
        task=textArea.value;
        textArea.value = 'Final Goal:'+textArea.value+promptTemplate;}
    else{
        textArea.value='Final Goal:'+task+'\nFocus on the point'+promptTemplate;
    }
    statuCode=1;
}
