const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const csv = require("csv-parser");
const fs = require('fs');
const emailValidator = require('email-validator');
const nodemailer = require('nodemailer');


const app = express();
let valid = [];
let inValid = [];
const EMAIL = 'phadkesharan@gmail.com';
const PASSWORD = 'ljqcgsqaqhipdxsw';
let fileUploadPath = "";

// nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL,
        pass: PASSWORD
    }
})

app.use(fileUpload());
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
})

app.post('/upload', (req, res) => {
    if (!req.files) {
        console.log("No files uploaded!!");
        res.sendStatus(404);
    }

    const file = req.files.emailList;
    const filePath = __dirname + "/uploads/" + file.name;

    file.mv(filePath, (err) => {
        if (err) console.log(err);

        fileUploadPath = filePath;
        console.log("successfully uploaded!");

        valid = [];
        inValid = [];

        fs.createReadStream(fileUploadPath)
            .pipe(csv())
            .on('data', (data) => {

                if (emailValidator.validate(data['Email Address'])) {
                    valid.push(data);
                }

                else {
                    inValid.push(data);
                }

            })
            .on('end', () => {
                console.log(valid);
            });

        res.redirect('emails');
    })
})

app.get('/emails', (req, res) => {

    res.render('emails', { valid: valid, inValid: inValid });
})

app.get('/compose', (req, res) => {
    res.render('compose');
});

app.post('/compose', (req, res) => {

    let emailList = "";
    valid.forEach((email) => {
        emailList += String(email['Email Address']) + ',';
    })

    emailList = emailList.slice(0, -1);
    console.log("email list");
    console.log(emailList);

    var msg = {
        from: EMAIL, // sender address
        subject: req.body.subject,
        text: req.body.emailBody,
        to: emailList
    }

    transporter.sendMail(msg, (err, info) => {
        if (err) console.log(err);

        res.render('success');
    })

})

app.listen(8000, (err) => {
    if (!err)
        console.log("server running on port 8000");
})

