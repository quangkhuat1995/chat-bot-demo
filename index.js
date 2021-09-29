let data = [];
const messages = [{ self: true, cnt: 'Hello The Bot' }];
const chatWrapperDiv = document.querySelector('#chat-wrapper');
const chatDiv = document.querySelector('#chat-wrapper .chat');
const messagesListDiv = document.querySelector('#messages-list');
const answerOl = document.querySelector('#answer-wrap ol');

const getData = async () => {
	// const res = await fetch('./data1.json');
	// const json = await res.json();
	// console.log(json);
	// data = json;
	// return json;
	data = mock;
	return mock;
};
document.addEventListener('DOMContentLoaded', getData);

const checkAnchorTag = (str = '') => /<a[\s]+([^>]+)>((?:.(?!\<\/a\>))*.)<\/a>/g.test(str);
const getOneByIds = (ids = '') => {
	return data.find((item) => item.ids === ids);
};

const getChildrenByIds = (ids = '') => {
	const parent = getOneByIds(ids);
	return parent.children || [];
};

const getChildrenDataByIds = (ids = '') => {
	const parent = getOneByIds(ids);
	const childrenIds = parent.children.filter((child) => !checkAnchorTag(child.ids) && child.ids);
	const children = data.filter((item) => childrenIds.includes(item.ids));
	return children;
};

const createAnswerLi = (ans) => {
	const li = document.createElement('li');
	const btn = document.createElement('button');
	btn.className = 'answer-btn';
	const isAnchorTag = checkAnchorTag(ans.ids);

	if (!isAnchorTag) {
		btn.onclick = function () {
			userAddAnswer(ans);
		};
		btn.innerHTML = `<p class="answer-btn--content">${ans.label}</p>`;
	} else {
		btn.innerHTML = ans.ids;
	}

	li.appendChild(btn);
	return li;
};

const renderAnswer = (childrenData = []) => {
	console.log(childrenData);
	answerOl.innerHTML = '';
	childrenData.forEach((ans) => {
		const li = createAnswerLi(ans);
		answerOl.appendChild(li);
	});
};

const displayAnswerWithScroll = (answerData) => {
	renderAnswer(answerData);
	setTimeout(() => {
		chatDiv.scrollTop = chatDiv.scrollHeight - chatDiv.clientHeight;
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
	displayAnswerWithScroll(answerData);
}

const renderMessages = () => {
	// first time
	if (messages.length === 1) {
		const msg = modifyMsg(data[0], { self: false });
		messages.push(msg);
		const answerData = getChildrenByIds(data[0].ids);
		const content = createMsg(msg);
		messagesListDiv.insertAdjacentHTML('beforeend', content);
		displayAnswerWithScroll(answerData);
	} else {
		let msgList = '';
		messages.forEach((oldMsg) => {
			msgList += createMsg(oldMsg);
		});
		messagesListDiv.innerHTML = msgList;
		const lastMessage = messages[messages.length - 1];
		const answerData = getChildrenByIds(lastMessage.ids);
		displayAnswerWithScroll(answerData);
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
const toggleChatControl = (btn) => {
	if (btn.dataset.isopen === 'true') {
		btn.dataset.isopen = 'false';
	} else {
		btn.dataset.isopen = 'true';
		renderMessages();
	}
	toggleChatWrapperVisibility(); // show/hide chat
};

const toggleChatWrapperVisibility = () => {
	// chatWrapperDiv.classList.toggle('active-flex');
};

const mock = [
	{
		ids: 'A00',
		head: 'Main Section Header',
		cnt: 'This is an introduction to the chatbot.<br>Feel free to press any button',
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
		children: [
			{
				label: 'Back to the beginning',
				ids: 'A00',
			},
		],
	},
];
