let data = [];
// if you want to restart everything, make sure set the messages back to this value
const messages = [{ self: true, cnt: 'Hello The Bot' }];
// const chatWrapperDiv = document.querySelector('#chat-wrapper');
// const chatDiv = document.querySelector('#chat-wrapper .chat');
// const messagesListDiv = document.querySelector('#messages-list');
// const answerOl = document.querySelector('#answer-wrap ol');
let chatWrapperDiv;
let chatDiv;
let messagesListDiv;
let answerOl;

const getData = async () => {
	// const res = await fetch('./data1.json');
	// const json = await res.json();
	// console.log(json);
	// data = json;
	// return json;
	data = mock;
	return mock;
};
document.addEventListener('DOMContentLoaded', () => {
	getData();
	setTimeout(() => {
		toggleChatControl('chat-container');
	}, 1000);
});

const checkAnchorTag = (str = '') => /<a[\s]+([^>]+)>((?:.(?!\<\/a\>))*.)<\/a>/g.test(str);
const getOneByIds = (ids = '') => {
	return data.find((item) => item.ids === ids);
};

const getChildrenByIds = (ids = '') => {
	const parent = getOneByIds(ids);
	return parent.children || [];
};

const createAnswerLi = (ans) => {
	const li = document.createElement('li');
	const btn = document.createElement('button');
	btn.className = 'answer-btn';
	const isAnchorTag = checkAnchorTag(ans.ids);

	if (!isAnchorTag) {
		li.onclick = function () {
			userAddAnswer(ans);
		};
		btn.innerHTML = `<p class="answer-btn--content">${ans.label}</p>`;
	} else {
		btn.innerHTML = ans.ids;
	}

	li.appendChild(btn);
	return li;
};

const renderAnswer = (childrenData = [], forceRow = false) => {
	if (forceRow) {
		answerOl.style.flexDirection = 'row';
	} else {
		answerOl.style.flexDirection = 'column';
	}
	answerOl.innerHTML = '';
	childrenData.forEach((ans) => {
		const li = createAnswerLi(ans);
		answerOl.appendChild(li);
	});
};

let timeoutId;
const displayAnswerWithScroll = (answerData, forceRow = false) => {
	renderAnswer(answerData, forceRow);

	timeoutId = setTimeout(() => {
		const { paddingTop } = getComputedStyle(chatDiv);
		const scrollTop = chatDiv.scrollHeight - chatDiv.clientHeight;
		const paddingTopAsNumber = Number(paddingTop.slice(0, -2));
		if (scrollTop > 0 && paddingTopAsNumber > 0) {
			let newPaddingTop = paddingTopAsNumber - scrollTop;
			if (newPaddingTop > 100) {
				newPaddingTop -= 100; // intense reduce the as much padding on click as we can
			}
			if (newPaddingTop > 0) {
				chatDiv.style.paddingTop = `${newPaddingTop}px`;
			} else {
				chatDiv.style.paddingTop = `0px`;
				chatDiv.scrollTop = chatDiv.scrollHeight - chatDiv.clientHeight;
			}
		} else {
			chatDiv.scrollTop = chatDiv.scrollHeight - chatDiv.clientHeight;
		}
		clearTimeout(timeoutId);
		timeoutId = null;
	}, 300);
};

function userAddAnswer(answer) {
	// transform the label into cnt in order to reuse the createMsg function
	const selectedAnswer = createMsg({ self: true, cnt: answer.label });
	messagesListDiv.insertAdjacentHTML('beforeend', selectedAnswer);
	messages.push({ self: true, cnt: answer.label });

	let questionNode = getOneByIds(answer.ids);
	questionNode = modifyMsg(questionNode, { self: false });
	messages.push(questionNode);
	const questionMsg = createMsg(questionNode);
	messagesListDiv.insertAdjacentHTML('beforeend', questionMsg);

	const answerData = questionNode.children;
	displayAnswerWithScroll(answerData, questionNode.row);
}

const renderMessages = () => {
	// first time
	if (messages.length === 1) {
		const msg = modifyMsg(data[0], { self: false });
		messages.push(msg);
		const answerData = getChildrenByIds(data[0].ids);
		const content = createMsg(msg);
		messagesListDiv.insertAdjacentHTML('beforeend', content);
		displayAnswerWithScroll(answerData, msg.row);
	} else {
		let msgList = '';
		messages.forEach((oldMsg) => {
			msgList += createMsg(oldMsg);
		});
		messagesListDiv.innerHTML = msgList;
		const lastMessage = messages[messages.length - 1];
		const answerData = getChildrenByIds(lastMessage.ids);
		displayAnswerWithScroll(answerData, lastMessage.row);
	}
};
const modifyMsg = (msg, modifier = {}) => ({ ...msg, ...modifier });

// content type to defined HTML structure
const getContentTypeOfMsg = (msg) => {
	if (!!msg.head) return 'complex';
	return 'default';
};

const createMsg = (msg) => {
	if (typeof msg.self === 'undefined') throw new Error('expect msg to be modified first');

	const type = msg.self ? 'self' : 'system';
	let content = msg.cnt;
	const contentType = getContentTypeOfMsg(msg);
	if (contentType === 'complex') {
		content = `
			<p>${msg.head}</p>
			<p>${msg.cnt}</p>
		`;
	}

	return `
		<li class="share ${type}" data-is-${type}>
			<div class="msg-wrap">${content}</div>
		</li>
	`;
};

// click btn open/hide chat
// if you don't want this onclick, you can remove everything except the commented if block, divId params and renderMessages function
const toggleChatControl = (divId = 'something') => {
	// start add chat to a specific divId
	if (divId && document.getElementById(divId)) {
		document.getElementById(divId).innerHTML = defaultChatWrapperLayout; // add the layout to the specific div
		chatWrapperDiv = document.querySelector('#chat-wrapper');
		chatDiv = document.querySelector('#chat-wrapper .chat');
		messagesListDiv = document.querySelector('#messages-list');
		answerOl = document.querySelector('#answer-wrap ol');

		getChatWrapperDivHeight();
		renderMessages();
	}
};

const toggleChatWrapperVisibility = () => {
	// chatWrapperDiv.classList.toggle('active-flex');
};

// calculate the height of chatWrapperDiv so that we can set padding-top of its child: chatDiv
const getChatWrapperDivHeight = () => {
	const style = getComputedStyle(chatWrapperDiv);
	const height = style.height;
	chatDiv.style.paddingTop = `calc(${height} - 200px)`;
};

const defaultChatWrapperLayout = `
	<div id="chat-wrapper">
		<div class="chat">
			<ul id="messages-list">
				<li class="share self" data-is-self>
					<div class="msg-wrap">Hello The Bot</div>
				</li>
			</ul>
			<div class="answer-wrap" id="answer-wrap">
				<span>Choose one</span>
				<ol>
				</ol>
			</div>
		</div>
	</div>
`;
// style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-end"

const mock = [
	{
		ids: 'A00',
		head: 'Main Section Header',
		cnt: 'This is an introduction to the chatbot.<br>Feel free to press any button',
		row: true,
		children: [
			{
				label: 'Section A',
				ids: 'A00a',
			},
			{
				label: 'Section B',
				ids: 'A00b',
			},
			{
				label: 'Section C',
				ids: 'A00c',
			},
			{
				label: 'Section D',
				ids: 'A00d',
			},
		],
	},
	{
		ids: 'A00a',
		head: 'Subsection A Header',
		cnt: 'This is an introduction to the option A.<br>Click available options A or B',
		children: [
			{
				label: 'Im choosing A',
				ids: 'A01a',
			},
			{
				label: 'Im choosing B',
				ids: 'A01b',
			},
		],
	},
	{
		ids: 'A00b',
		head: 'Subsection B Header',
		cnt: 'This is an introduction to the option B.<br>Click available options A or B or C',
		row: true,
		children: [
			{
				label:
					'Im choosing A but this time Question on the button is really long New line in the button Im choosing A but this time Question on the button is really long New line in the button',
				ids: 'A01a',
			},
			{
				label: 'Im choosing B',
				ids: 'A01b',
			},
			{
				label: 'Back to previous<img src="./img/product_1.png">',
				ids: 'A00',
			},
		],
	},
	{
		ids: 'A00c',
		head: 'Subsection C Header',
		cnt: 'This is an introduction to the option C.<br>Click available options A or B or C',
		children: [
			{
				label: 'Im choosing A',
				ids: 'A01a',
			},
			{
				label: 'External link with text Button',
				ids: '<a target="_blank" href="https://google.com"><img src="./img/A00c_optB_link.png"></a>',
			},
			{
				label: 'Back to previous',
				ids: 'A00',
			},
		],
	},
	{
		ids: 'A00d',
		head: 'Subsection D Header',
		cnt: 'This is an introduction to the option D.<br>Click available options A or B',
		children: [
			{
				label: 'Join Hint! (ext link with )',
				ids: '<a target="_blank" href="https://youtube.com"><img src="./img/A00d_optA_link.png"></a>',
			},
			{
				label: 'External link with text Button',
				ids: '<a target="_blank" href="https://google.com"><img src="./img/A00d_optA_link.png"></a>',
			},
			{
				label: 'Back to the begining',
				ids: 'A00',
			},
		],
	},
	{
		ids: 'A01a',
		head: 'End of Quiz',
		cnt: 'Nothing to see here really (A)',
		children: [
			{
				label: 'Back to the beginning',
				ids: 'A00',
			},
		],
	},
	{
		ids: 'A01b',
		head: 'End of Quiz',
		cnt: '<img src="./img/A01b_cnt.jpg">',
		row: true,
		children: [
			{
				label: 'Back to the beginning',
				ids: 'A00',
			},
		],
	},
];
