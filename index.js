import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://appreciation-app-a3f5c-default-rtdb.firebaseio.com/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const submissionBoardDB = ref(database, "submissionBoard")

const userInputEl = document.getElementById("user-input")
const fromUserEl = document.getElementById("from-user")
const toUserEl = document.getElementById("to-user")

const publishBtn = document.getElementById("publish-btn")

const submissionBoardEl = document.getElementById("submission-board-list")

publishBtn.addEventListener("click", function(){
    let userSubmission ={
        fromUser: fromUserEl.value,
        toUser: toUserEl.value,
        userSubmission: userInputEl.value,
        likes: {
            count: 0
        },
        timestamp: Date.now()
    } 
    push(submissionBoardDB, userSubmission)
    clearUserInput()
})

onValue(submissionBoardDB, function(snapshot){
    if (snapshot.exists()){
        let userSubmissionArray = Object.entries(snapshot.val())

        userSubmissionArray.sort((a, b) => b[1].timestamp - a[1].timestamp);

        // console.log(userSubmissionArray)
        refreshSubmissionBoard()
        for(let i = 0; i < userSubmissionArray.length; i++){
            let currentSubmission = userSubmissionArray[i]
            let submissionID = userSubmissionArray[i][0]
            
            let submissionContent = userSubmissionArray[i][1].userSubmission
            
            appendItemToBoard(currentSubmission)
        }
        
    }
    else{
        submissionBoardEl.innerHTML = "No submissions yet ... "
        submissionBoardEl.style.color = "#EDDDD4"
        submissionBoardEl.style.fontSize = "18px"
    }
})

function clearUserInput(){
    userInputEl.value = ""
    toUserEl.value = ""
    fromUserEl.value = ""
}

function refreshSubmissionBoard(){
    submissionBoardEl.innerHTML = ""
}

function appendItemToBoard(submission){
    let submissionID = submission[0]
    let submissionContent = submission[1].userSubmission
    let fromUserSubmission = submission[1].fromUser
    let toUserSubmission = submission[1].toUser
    let subTimestamp = new Date(submission[1].timestamp)
    let date = subTimestamp.toLocaleString();

    let likeCount = submission[1].likes ? submission[1].likes.count : 0;

    
    let newSubmission = document.createElement("li")
    newSubmission.innerHTML = 
    `<div class="submission-content">
        <span class='user-id'>To ${toUserSubmission}</span> <span class='date'>(${date})</span><br><br>
        <p class='sub-content'>${submissionContent}</p>    <br>
        <span class='user-id'>From ${fromUserSubmission}<span>

        <div class='like-container'>
            <img id='likeIcon' src='assets/likeicon.png'>
            <span id="likeCount">${likeCount}</span>
        </div>
    </div>
    `
    const likeIcon = newSubmission.querySelector("#likeIcon");
    const likeCountSpan = newSubmission.querySelector("#likeCount");

    likeIcon.addEventListener("click", function(){
        likeCount++; 
        likeCountSpan.textContent = likeCount;
        const submissionRef = ref(submissionBoardDB, submissionID)
        update(submissionRef, {
            "likes/count": likeCount
        })
        
    })

    submissionBoardEl.append(newSubmission) 
}