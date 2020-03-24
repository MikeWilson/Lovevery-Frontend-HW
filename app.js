window.addEventListener('load', async () => {
    refreshMessages();
});

const refreshMessages = () => {
    getAllMessages().then(data => {

        //First compile message feed
        const formattedMessages = formateMessagesForHandlebars(data);
        const messagesRoot = $('#messages-root');
        const messagesTemplate = Handlebars.compile($('#messages-template').html());
        messagesRoot.html(messagesTemplate({
            formattedMessages
        }));

        // Then compile names filter list
        const names = Object.keys(JSON.parse(data.body));
        const namesRoot = $('#names-root');
        const namesTemplate = Handlebars.compile($('#names-template').html());
        namesRoot.html(namesTemplate({
            names
        }));
    })
}

const getAllMessages = async () => {
    const proxyurl = 'https://cors-anywhere.herokuapp.com/';
    const url = 'https://abraxvasbh.execute-api.us-east-2.amazonaws.com/proto/messages';
    let response = await fetch(proxyurl + url);
    let data = await response.json();
    return data;
};

const filterByName = () => {
    var whichName = $('#name-select').val();
    if (whichName) {
        getAllMessagesFromuser(whichName).then(data => {
            const formattedMessages = JSON.parse(data.body);

            // Handlebars is expecting key "name" not "user"
            formattedMessages.name = formattedMessages.user;
            delete formattedMessages.user;

            const messagesRoot = $('#messages-root');
            const messagesTemplate = Handlebars.compile($('#name-filtered-messages-template').html());
            messagesRoot.html(messagesTemplate({
                formattedMessages
            }));

        })
    } else {
        clearFilter();
    }
}

const clearFilter = () => {
    $('#name-select').val("");
    getAllMessages().then(data => {
        const formattedMessages = formateMessagesForHandlebars(data);
        const messagesRoot = $('#messages-root');
        const messagesTemplate = Handlebars.compile($('#messages-template').html());
        messagesRoot.html(messagesTemplate({
            formattedMessages
        }));
    });
}

const getAllMessagesFromuser = async (user) => {
    const proxyurl = 'https://cors-anywhere.herokuapp.com/';
    const url = 'https://abraxvasbh.execute-api.us-east-2.amazonaws.com/proto/messages/' + user;
    let response = await fetch(proxyurl + url);
    let data = await response.json();
    return data;
};

const submitForm = () => {
    var username = $('#username').val();;
    var subject = $('#subject').val();;
    var message = $('#message').val();;

    //TODO check form values and add error states

    if (username && subject && message) {
        var data = {
            "user": username,
            "operation": "add_message",
            "subject": subject,
            "message": message
        };

        postMessage(data)

        $('#message').val("");;
    }
}

const postMessage = (data) => {
    const proxyurl = 'https://cors-anywhere.herokuapp.com/';
    const url = 'https://abraxvasbh.execute-api.us-east-2.amazonaws.com/proto/messages';
    fetch(proxyurl + url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(() => {
        refreshMessages();
    });
};

// Hacky function to reformate returned data to be better consumed by handlebars
const formateMessagesForHandlebars = data => {
    var parsedData = JSON.parse(data.body);
    const messages = Object.entries(parsedData);
    formattedMessages = [];
    messages.forEach(element => {
        formattedMessages.push({
            name: element[0],
            message: element[1]
        });
    });
    return formattedMessages;
}

// Used to color the badges in the message feed
Handlebars.registerHelper('get_color', function (subject) {
    switch (subject) {
        case "general":
            return "secondary"
            break;
        case "baby talk":
            return "primary"
            break;
        case "research":
            return "success"
            break;
        case "reviews":
            return "warning"
            break;
        case "resources":
            return "info"
            break;
        default:
            break
    }
});