const { google } = require('googleapis');


async function start() {
    const oauth2Client = new google.auth.OAuth2(
        "507719225227-q8k956pm99sblk8sj4fd81u3vrn51uia.apps.googleusercontent.com",
        "LL_rTu1AbvSg3p5opLg6GbV_",
        ["https://7fb1-115-43-165-47.ngrok.io/ma/token"]
    );


    // const url = oauth2Client.generateAuthUrl({
    //     // 'online' (default) or 'offline' (gets refresh_token)
    //     access_type: 'offline',

    //     // If you only need one scope you can pass it as a string
    //     scope: "https://www.googleapis.com/auth/gmail.modify"
    // });
    // console.log(url)
    await oauth2Client.getToken("4%2F0AX4XfWhs9_CTViifLiyulPrc4B9uE89KncdAEbnnS8V--_b_2XiHmaQP3tOMH-WX_Ymbaw").then(token => {
        console.log(token)
    },error=>{
        console.log(error)
    })

    // oauth2Client.setCredentials(tokens);
    // oauth2Client.on('tokens', (tokens) => {
    //     if (tokens.refresh_token) {
    //         // store the refresh_token in my database!
    //         console.log(tokens.refresh_token);
    //     }
    //     console.log(tokens.access_token);
    // });
    // oauth2Client.setCredentials({
    //     refresh_token: `4/0AX4XfWj9esnxl6D1z-1G66f_KCI2GousdwGQqQ2vvuv0kPtRYiwJ7KncmaP8DGTGa50unw&scope=https://www.googleapis.com/auth/gmail.modify`
    // });

}
function sendMessage(auth) {
    var gmail = google.gmail('v1');
    var email_lines = [];
    // email_lines.push("From: chnbohwr@gmail.com");
    email_lines.push("To:10656010@ntub.edu.tw");
    email_lines.push('Content-type: text/html;charset=utf-8');
    email_lines.push('MIME-Version: 1.0');
    email_lines.push("Subject: New future subject here");
    email_lines.push("");
    email_lines.push("And the body text goes here");
    email_lines.push("<b>And the bold text goes here</b>"); var email = email_lines.join("\r\n").trim();
    var base64EncodedEmail = new Buffer(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
    console.log(base64EncodedEmail);
    function sendDone(err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        console.log('send mail success', response);
    } gmail.users.messages.send({
        auth: auth,
        userId: 'ningpaiyi@gmail.com',
        resource: {
            raw: base64EncodedEmail
        }
    }, sendDone);
}
module.exports = {
    start
}