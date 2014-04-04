module.exports = {
    loadIndex: loadIndex
};

function loadIndex(req, res) {
    if (req.session && req.session.user) {
        res.redirect("/cms/dashboard");
    } else {
        res.redirect("/cms/login");
    }
}