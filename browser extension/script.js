var intervalCode
var tasks
var taskNum = 0
var goal
var reftxt

const rootEl = document.querySelector('div[id="__next"]')

const mutationObserver = new MutationObserver((mutations) => {

    if (!mutations.some(mutation => mutation.removedNodes.length > 0)) return

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
    bar.innerHTML = '<span id="task">Paste tasks and click </span><button id="autorun" class="autoBtn"> AUTO ASK </button> &nbsp; <button id="stopauto" class="autoBtn"> ■ </button><div class="loader"></div>'
    bar.classList.add('autobar')
    var runBtn = bar.querySelector("#autorun");
    runBtn.addEventListener("click", buildPrompt);
    var stopBtn = bar.querySelector("#stopauto");
    stopBtn.addEventListener("click", stopAuto);
    stopBtn.disabled = true
    if (tasks != undefined)
        bar.querySelector('#task').innerHTML = 'Next Question: ' + tasks[taskNum]
    if (!document.querySelector('polygon') && intervalCode != undefined) {
        stopBtn.disabled = false
        runBtn.disabled = true
        bar.querySelector('.loader').style.display = "block"
    }
    textAreaParentParent?.appendChild(bar)
    return bar
}


function checkTasks() {
    mermaidCode = document.querySelector('code');
    if (mermaidCode) {
        var tasksFromMermaid = convertMermaid(mermaidCode.innerHTML);
        if (tasks != undefined && JSON.stringify(tasks) == JSON.stringify(tasksFromMermaid)) {
            clearInterval(intervalCode)
            console.log(tasks)
            buildPrompt();
        } else {
            tasks = tasksFromMermaid
        }
    }
}

function stopAuto() {
    clearInterval(intervalCode)
    tasks=undefined
    taskNum = 0
    goal=undefined
    reftxt=undefined
    const textArea = document.querySelector("textArea")
    textArea.value = ''
    genBtn=Array.from(document.querySelectorAll('div')).find(el => el.textContent === 'Stop generating')
    console.log(genBtn)
    if (genBtn) genBtn.querySelector('button').click()
    document.querySelector('#autorun').disabled = false
    document.querySelector('.loader').style.display = "none"
}

function convertMermaid(mermaidCode) {
    var regex = /[\(\)\[\]\{\}][^\(\)\[\]\{\}]*[\(\)\[\]\{\}]/g;
    const matches = mermaidCode.match(regex);
    if (!matches) return false
    const results = [];
    const regexGraph = /\s*graph[\s\S]*/;
    reftxt = mermaidCode.replace(regexGraph, '')
    for (let i = 1; i < matches.length; i++) {
        const match = matches[i];
        const result = match.substring(1, match.length - 1);
        if (result != goal && result.length > 7)
            results.push(result);
    }
    return results
}


function convertMarkdown(txt) {
    var regex = /(\d+\.)\s*([^\n]+)/g;
    const matches = txt.match(regex);
    if(!matches){
        tasks= convertMermaid(txt)
        return tasks
    }
    tasks=[]
    tasks.push(txt.replace(regex, '')+matches[0])
    for (let i = 1; i < matches.length; i++) {
        tasks.push(matches[i])
    }
    return true
}

function task() {
    if (document.querySelector('polygon')) {
        document.querySelector('#autorun').disabled = false
        document.querySelector('.loader').style.display = "none"
        clearInterval(intervalCode)
        if (tasks != undefined && taskNum <= tasks.length) {
            buildPrompt()
        }
    }else{
        document.querySelector('#autorun').disabled = true
    }
}

function buildPrompt() {
    const textArea = document.querySelector("textArea");
    document.querySelector('.loader').style.display = "block"
    if (!textArea) return
    document.querySelector('#stopauto').disabled = false
    const promptTemplate = '. Help me figure out key points for the goal and output key points in Mermaid format,dont write any program code.';
    if (tasks == undefined) {
        if (textArea.value == '') return
        if (convertMarkdown(textArea.value)) {
            textArea.value = tasks[taskNum]
            taskNum += 1
            intervalCode = setInterval(task, 3000)
        }
        else {
            goal = textArea.value;
            textArea.value = 'Final Goal:' + goal + promptTemplate
            intervalCode = setInterval(checkTasks, 3000)
        }
    } else {
        if (taskNum == tasks.length || tasks[taskNum] == undefined) {
            textArea.value == '';
            tasks = undefined;
            taskNum = 0;
            document.querySelector('.loader').style.display = "none"
            return
        }
        if (goal == undefined) {
            textArea.value = tasks[taskNum]
        } else { 
            textArea.value = 'Final Goal:' + goal + '.\nPlease analyze the point: ' + tasks[taskNum] + promptTemplate
        }
        document.querySelector('#autorun').click()
        taskNum += 1;
        document.querySelector('#task').innerHTML = 'Next Question: ' + tasks[taskNum]
        intervalCode = setInterval(task, 3000)
    }
}