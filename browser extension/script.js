// 0:wait2start  1:wait4gen
var statusCode
var tasks
var taskNum=0
var goal

const rootEl = document.querySelector('div[id="__next"]')

const mutationObserver = new MutationObserver((mutations) => {

    if (!mutations.some(mutation => mutation.removedNodes.length > 0)) return

    console.info("autoRun: Mutation observer triggered")

    if (document.querySelector(".autobar")) return
    try {
        console.info("autoRun: Mutation observer UI triggered")
        addBar();
    } catch (e) {
        if (e instanceof Error) {
            showErrorMessage(e)
        }
    }
})

onload = function () {
    addBar()
    mutationObserver.observe(rootEl, { childList: true, subtree: true })
}

onunload = function () {
    mutationObserver.disconnect()
}

async function addBar() {
    const textArea = document.querySelector("textArea");
    const textAreaParentParent = textArea.parentElement?.parentElement;
    let bar = document.createElement('div');
    bar.innerHTML = '<span id="task">Paste tasks and click </span><button id="autorun" class="autoBtn"> AUTO ASK </button><div class="loader"></div>'
    bar.classList.add('autobar')
    var runBtn = bar.querySelector("#autorun");
    runBtn.addEventListener("click", buildPrompt);
    if(tasks!=undefined)
        bar.querySelector('#task').innerHTML='Next Question: '+tasks[taskNum+1]
    if(!document.querySelector('polygon')){
        bar.querySelector('#autorun').style.display = "none"
        bar.querySelector('.loader').style.display = "block"
    }
    textAreaParentParent?.appendChild(bar)
    return bar
}


function checkTasks() {
    replyCode = document.querySelector('code');
    if (replyCode) {
        var tasksFromMermaid = convertMermaid(replyCode.innerHTML);
        if (tasks!=undefined && JSON.stringify(tasks) == JSON.stringify(tasksFromMermaid)) {
            statusCode = clearInterval(statusCode)
            console.log(tasks)
            buildPrompt();
        } else {
            tasks = tasksFromMermaid
        }
    }
}


function convertMermaid(replyCode) {
    var mermaid_content = replyCode.replace(/\(/g, '[').replace(/\)/g, ']').replace('\n',' ');
    var regex = /\[(.+?)\]/g;
    const matches = mermaid_content.match(regex);
    if(!matches)return
    const results = [];
    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const result = match.substring(1, match.length - 1);
        if(result!=goal && result.length>7)
            results.push(result);
    }
    return results
}


function convertMarkdown(txt) {
     arr= txt.split('\n').map(item => {
        const index = item.indexOf('.');
        return item.slice(index + 1);
      });
      console.log(arr)
      if(arr && arr.length>1){
        tasks=arr
        return true
      }
      return false
}

function task(){
    if(document.querySelector('polygon')){
        statusCode=clearInterval(statusCode)
        if(tasks!=undefined && taskNum<tasks.length)
            taskNum+=1;
            buildPrompt()
    }
}

function buildPrompt() {
    const textArea = document.querySelector("textArea");
    if(!textArea)return
    const promptTemplate = '. Help me figure out key points for the goal and output key points in Mermaid format,dont write any program code.';
    if (tasks==undefined) {
        if(textArea.value=='')return
        if(convertMarkdown(textArea.value)){
            textArea.value=tasks[taskNum]
            statusCode=setInterval(task,5000)
        }
        else{
            goal = textArea.value;
            textArea.value = 'Final Goal:' + goal + promptTemplate
            statusCode = setInterval(checkTasks, 5000)}
    }else {
        if(taskNum==tasks.length || tasks[taskNum]==undefined){
            textArea.value=='';
            tasks=undefined;
            taskNum=0;
            document.querySelector('.loader').style.display = "none"
            return}
        if(goal==undefined){
            textArea.value =tasks[taskNum]
        }else
            {textArea.value = 'Final Goal:' + goal  + '. Focus on the point ' + tasks[taskNum] + promptTemplate}
        document.querySelector('#autorun').click()
        document.querySelector('#task').innerHTML='Next Question: '+tasks[taskNum+1]
        statusCode=setInterval(task,5000)
    }
}
