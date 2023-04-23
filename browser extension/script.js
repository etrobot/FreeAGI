// 0:wait2start  1:wait4gen
var statusCode
var tasks
var taskNum = 0
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
    bar.innerHTML = '<span id="task">Paste tasks and click </span><button id="autorun" class="autoBtn"> AUTO ASK </button> &nbsp; <button id="stopauto" class="autoBtn"> ■ </button><div class="loader"></div>'
    bar.classList.add('autobar')
    var runBtn = bar.querySelector("#autorun");
    runBtn.addEventListener("click", buildPrompt);
    var stopBtn = bar.querySelector("#stopauto");
    stopBtn.addEventListener("click", stopAuto);
    if (tasks != undefined)
        bar.querySelector('#task').innerHTML = 'Next Question: ' + tasks[taskNum + 1]
    if (!document.querySelector('polygon')) {
        bar.querySelector('#autorun').style.display = "none"
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
            statusCode = clearInterval(statusCode)
            console.log(tasks)
            buildPrompt();
        } else {
            tasks = tasksFromMermaid
        }
    }
}

function stopAuto() {
    statusCode = clearInterval(statusCode)
    var stopGenBtn = document.querySelector("#__next > div.overflow-hidden.w-full.h-full.relative.flex > div.flex.h-full.max-w-full.flex-1.flex-col > main > div.absolute.bottom-0.left-0.w-full.border-t.md\\:border-t-0.dark\\:border-white\\/20.md\\:border-transparent.md\\:dark\\:border-transparent.md\\:bg-vert-light-gradient.bg-white.dark\\:bg-gray-800.md\\:\\!bg-transparent.dark\\:md\\:bg-vert-dark-gradient.pt-2 > form > div > div:nth-child(1) > div > button")
    if (stopGenBtn && stopGenBtn.textContent == 'Stop generating') stopGenBtn.click()
    document.querySelector('#stopauto').style.display = "none"
    document.querySelector("#autorun").style.display = "block"
    const textArea = document.querySelector("textArea")
    textArea.value = ''
    document.querySelector('.loader').style.display = "none"
    taskNum += 1
}

function convertMermaid(mermaidCode) {
    var regex = /[\(\)\[\]\{\}][^\(\)\[\]\{\}]*[\(\)\[\]\{\}]/g;
    const matches = mermaidCode.match(regex);
    if (!matches) return false
    const results = [];
    const regexGraph = /\s*graph[\s\S]*/;
    const cleanTxt = mermaidCode.replace(regexGraph, '')
    results.push(cleanTxt + '\nPlease analyze the point: ' + matches[0])
    for (let i = 1; i < matches.length; i++) {
        const match = matches[i];
        const result = match.substring(1, match.length - 1);
        if (result != goal && result.length > 7)
            results.push(' next point: ' + result);
    }
    return results
}


function convertMarkdown(txt) {
    var regex = /^\d+\.(.+)$/gm;
    const matches = txt.match(regex);
    if (!matches) {
        tasks = convertMermaid(txt)
        return tasks
    }
    tasks = []
    tasks.push(txt.replace(regex, '') + matches[0])
    for (let i = 1; i < matches.length; i++) {
        tasks.push(matches[i])
    }
    return true
}

function task() {
    if (document.querySelector('polygon')) {
        statusCode = clearInterval(statusCode)
        if (tasks != undefined && taskNum < tasks.length)
            taskNum += 1;
        buildPrompt()
        document.querySelector('.loader').style.display = "block"
    }
}

function buildPrompt() {
    const textArea = document.querySelector("textArea");
    if (!textArea) return
    const promptTemplate = '. Help me figure out key points and output key points in Mermaid format,dont write any program code.';
    if (tasks == undefined) {
        if (textArea.value == '') return
        if (convertMarkdown(textArea.value)) {
            textArea.value = tasks[taskNum]
            statusCode = setInterval(task, 5000)
        }
        else {
            goal = textArea.value;
            textArea.value = 'Final Goal:' + goal + promptTemplate
            statusCode = setInterval(checkTasks, 5000)
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
        } else { textArea.value = 'Final Goal:' + goal + '. Focus on ' + tasks[taskNum] + promptTemplate }
        document.querySelector('#autorun').click()
        document.querySelector('#task').innerHTML = 'Next Question: ' + tasks[taskNum + 1]
        document.querySelector('#stopauto').style.display = 'block'
        statusCode = setInterval(task, 5000)
    }
}
