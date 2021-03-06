var fs = require('fs'),
    path = require('path'),

    winston = module.parent.require('winston'),
    Meta = module.parent.require('./meta'),
    Emailer = {};
    var nodemailer = require('nodemailer');
    var smtpTransport = require('nodemailer-smtp-transport');

Emailer.init = function(args,callback) {
  var app = args.router,
  middleware = args.middleware,
  controllers = args.controllers;
    function renderAdminPage(req, res, next) {
        res.render('admin/emailers/smtpssl', {});
    }

    app.get('/admin/emailers/smtpssl', middleware.admin.buildHeader,[], renderAdminPage);
    app.get('/api/admin/emailers/smtpssl', renderAdminPage);


    callback();
};

Emailer.send = function(data) {
    var username = Meta.config['emailer:local:username'];
    var pass = Meta.config['emailer:local:password'];
    var transportOptions = {
      secure: true,
        host: Meta.config['emailer:local:host'],
        port: parseInt(Meta.config['emailer:local:port'],10)
    };
    if( username || pass ) {
        transportOptions.auth = {
            user: username,
            pass: pass
        };
    }
    var transport = nodemailer.createTransport(smtpTransport(transportOptions));
    transport.sendMail({
        from: data.from,
        to: data.to,
        html: data.html,
        text: data.plaintext,
        subject: data.subject
    },function(err,response) {
        if ( !err ) {
            winston.info('[emailer.smtp] Sent `' + data.template + '` email to uid ' + data.uid);
        } else {
            winston.warn('[emailer.smtp] Unable to send `' + data.template + '` email to uid ' + data.uid + '!!');
        }
    });
}

Emailer.admin = {
    menu: function(custom_header, callback) {
        custom_header.plugins.push({
            "route": '/emailers/smtpssl',
            "icon": 'fa-envelope-o',
            "name": 'Emailer (Local)Smtp SSL'
        });

        callback(null, custom_header);
    }
};

module.exports = Emailer;
