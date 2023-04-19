// 0:wait2start  1:wait4gen 2:time2moveon
var statuCode=0
var task=''
var memory={}

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



async function updateUI() {
        const textArea = document.querySelector("textArea");
        const textAreaParentParent = textArea.parentElement?.parentElement;
        let bar = document.createElement('div');
        bar.innerHTML='☝︎ type in the textArea , and use this button ☞ <button class="autoBtn"> ➤ </button><div class="loader"></div>'
        bar.classList.add('bar')
        textAreaParentParent?.appendChild(bar)
        var button = bar.querySelector(".autoBtn");
        button.addEventListener("click", buildPrompt);
        const codeArea = document.querySelector("code");
        console.log(codeArea);
        
}


function check(){
        var genBtn=document.querySelector("#__next > div.overflow-hidden.w-full.h-full.relative.flex > div.flex.h-full.max-w-full.flex-1.flex-col > main > div.absolute.bottom-0.left-0.w-full.border-t.md\\:border-t-0.dark\\:border-white\\/20.md\\:border-transparent.md\\:dark\\:border-transparent.md\\:bg-vert-light-gradient.bg-white.dark\\:bg-gray-800.md\\:\\!bg-transparent.dark\\:md\\:bg-vert-dark-gradient.pt-2 > form > div > div.flex.ml-1.md\\:w-full.md\\:m-auto.md\\:mb-2.gap-0.md\\:gap-2.justify-center > button > div")
        if(genBtn && genBtn.textContent=='Stop generating'){
            statuCode=1
        }
}

function buildPrompt(prompt) {
    if(generating==false)return;
    var promptTemplate=' Help me figure out key points for the goal and output  key points in Mermaid format,dont write any program code.'
    if(!prompt)task=textArea.value
    textArea.value = 'Final Goal:'+task+promptTemplate;
    if(prompt)textArea.value='Final Goal:'+task+'\nFocus on the point'+prompt

}
