// start
var textArea = document.querySelector("textarea");
var chatBox = textArea.parentNode.parentNode;


let bar = document.createElement('div');
bar.innerHTML='<code>Next Question</code><button class="autoBtn">AUTO ➤</button><div class="loader"></div>'
bar.classList.add('bar')
chatBox.appendChild(bar)


var generating=false

setInterval(
    ()=>{
        var genBtn=document.querySelector("#__next > div.overflow-hidden.w-full.h-full.relative.flex > div.flex.h-full.max-w-full.flex-1.flex-col > main > div.absolute.bottom-0.left-0.w-full.border-t.md\\:border-t-0.dark\\:border-white\\/20.md\\:border-transparent.md\\:dark\\:border-transparent.md\\:bg-vert-light-gradient.bg-white.dark\\:bg-gray-800.md\\:\\!bg-transparent.dark\\:md\\:bg-vert-dark-gradient.pt-2 > form > div > div.flex.ml-1.md\\:w-full.md\\:m-auto.md\\:mb-2.gap-0.md\\:gap-2.justify-center > button > div")
        if(genBtn && genBtn.textContent=='Stop generating'){
            generating=true
        }
    }
    ,1000
)



function buildPrompt() {
    if(generating==false)return;
    var promptTemplate=' Help me figure out key points for the goal and output  key points in Mermaid format,dont write any program code.'
    textArea.value = textArea.value+promptTemplate;

}

var button = document.querySelector(".autoBtn");
button.addEventListener("click", buildPrompt);