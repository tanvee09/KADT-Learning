const socket = io.connect();
var message_box = document.querySelector(".messages ul");
var message = $(".message");
var send_btn = $(".submit");
var usersList = document.getElementsByClassName("name");
var receiver = $("#profile .wrap").attr("data-send");
var searchuser = document.querySelector("#search input");
receiver = JSON.parse(receiver);

var chat_id = $(".contact-profile").attr("data-id");

socket.once("connect", function () {
    socket.emit("new", receiver)
})

const newMessage = (data) => {
    var div = document.createElement("li");
    div.innerHTML = `<small> ${data.sender.name} </small><p> ${data.msg} </p>`;
    if (data.sender._id.toString().trim() == receiver._id.toString())
        div.setAttribute("class", "sent");
    else
        div.setAttribute("class", "replies");
    message_box.appendChild(div);
    $(".messages").animate({ scrollTop: $(document).height() }, "fast");
}

socket.on("chat-message", (data) => {
    if (chat_id == data.chat_id)
        newMessage({ sender: data.sender, msg: data.msg })
    else
        notify(data.sender, data.msg, data.chat_id);
});

const notify = (sender, msg, msg_chat_id) => {
    var new_chat, messageDisplay;

    if (msg_chat_id.toString().length == 24) {
        new_chat = $("#" + msg_chat_id);
        messageDisplay = new_chat.find(".preview");
        messageDisplay.text(`${sender.name}: ${msg}`);
    }
    else {
        new_chat = $("#" + sender._id);
        messageDisplay = new_chat.find(".preview");
        messageDisplay.text(msg);
    }
}

socket.on("new-user", (newuser) => {
    var user = document.getElementById(newuser.id);
    console.log(user);
    if (user != undefined) {
        user.firstElementChild.setAttribute("class", "contact-status online");
    }
    else {
        var div = document.createElement('li');
        div.setAttribute("class", "contact");
        div.innerHTML = `<a href="<%="/chat/private/"+ ${newuser._id} %>" >
							<div class="wrap" id= ${newuser._id}">
								<span class="contact-status online"></span>
								<img src="http://emilcarlsson.se/assets/louislitt.png" alt="" />
								<div class="meta">
									<p class="name" class="chats"> ${newuser.name.trim()} </p>
									<p class="preview"></p>
								</div>
							</div>
						 </a>`;
    }
})

socket.on("user-disconnected", (user) => {
    var user = document.getElementById(user);
    user.firstElementChild.setAttribute("class", "contact-status offline");
    }
)

socket.on("typing", data => {
    console.log("typing received");
    if (chat_id == data.chat_id) {
        if (data.chat_id.toString().length == 24)
            $(".typing").text(` ${data.sender.name} :typing... `)
        else
            $(".typing").text(` typing...`)
        setTimeout(function () {
            $('.typing').text("")
        }, 5000);
    }
})
send_btn.click(function (event) {
    console.log(message.val(), receiver , chat_id)
    // console.log(receiver)

    if (message.val() != '') {
        socket.emit("chat-message", { msg: message.val(), sender: receiver , chat_id});
        message.val("");
    }
})

searchuser.addEventListener("keyup", function (event) {
    var value = searchuser.value;
    for (user of usersList) {
        var name = user.textContent;
        console.log(user, value ,name.toString().toLowerCase().includes(value.toLowerCase()));

        if (!name.toString().toLowerCase().includes(value.toLowerCase()))
            user.parentElement.parentElement.parentElement.parentElement.style.display = "none";
        else
            user.parentElement.parentElement.parentElement.parentElement.style.display = "block";
    }
})


$(".messages").animate({ scrollTop: $(document).height() }, "fast");

message.keypress(event => {
    socket.emit("typing", { 'sender': receiver, chat_id })
})

$("#profile-img").click(function () {
    $("#status-options").toggleClass("active");
});

$(window).on('keydown', function (e) {
    if (e.which == 13) {
        send_btn.click();
        return false;
    }
});