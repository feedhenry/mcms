module.exports = {
    loggedIn: loggedIn,
    loggedOut: loggedOut
};

function loggedIn(req, res, next) {
    if (!req.session || !req.session.user) {
        res.redirect("/cms/login");
    } else {
        next();
    }
}

function loggedOut(req, res, next) {
    if (req.session && req.session.user) {
        res.redirect("/cms/dashboard");
    } else {
        next();
    }
}